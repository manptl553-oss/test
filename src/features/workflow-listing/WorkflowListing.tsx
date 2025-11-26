import { useState, useRef, useEffect } from "react";
import { Pagination, Table } from "@/shared";
import { Column, SortOrder } from "@/shared/components/table/types";

const DEBOUNCE_DELAY = 400;

// Define the allowed status values
type StatusFilterValue = "all" | "enabled" | "disabled";

const defaultStatusOptions: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All Workflows" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

export interface WorkflowListingProps<T> {
  data: T[];
  loading?: boolean;
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filter (Status) — now fully type-safe
  statusFilter?: StatusFilterValue;
  onStatusFilterChange?: (status: StatusFilterValue) => void;

  // Create Button
  createButton?: {
    show?: boolean;
    label?: string;
    onClick?: () => void;
  };

  // Sorting
  sort?: { field: string; order: SortOrder };
  onSort?: (field: string, order: SortOrder) => void;

  // Row Click
  clickableRows?: boolean;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  // Pagination
  pagination?: {
    page: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
    perPageOptions?: number[];
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
  };
}

export function WorkflowListing<T>({
  data,
  loading = false,
  columns,
  keyField,

  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search workflows...",

  statusFilter = "all",
  onStatusFilterChange,

  createButton = { show: true, label: "Create Workflow", onClick: () => {} },

  sort,
  onSort,

  clickableRows = true,
  onRowClick,
  rowActions,
  pagination,
  title,
}: WorkflowListingProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      onSearchChange?.(localSearch.trim());
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [localSearch, onSearchChange]);

  // Sync external search reset
  useEffect(() => {
    if (searchValue !== localSearch) {
      setLocalSearch(searchValue);
    }
  }, [searchValue]);

  // Close filter on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilter = statusFilter !== "all";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">
          {title || "Workflows"}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          {onSearchChange && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="px-4 py-2 min-w-[240px] rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-lime-500"
            />
          )}

          {/* Status Filter */}
          {onStatusFilterChange && (
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                  hasActiveFilter
                    ? "bg-lime-600 border-lime-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                <span>Filter</span>
                {hasActiveFilter && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-4 space-y-3">
                    <label className="text-sm font-medium text-gray-300">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Type assertion is safe because <option> values are restricted
                        if (
                          value === "all" ||
                          value === "enabled" ||
                          value === "disabled"
                        ) {
                          onStatusFilterChange(value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-lime-500"
                    >
                      {defaultStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {hasActiveFilter && (
                      <button
                        onClick={() => onStatusFilterChange("all")}
                        className="text-sm text-lime-400 hover:text-lime-300"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Button */}
          {createButton.show && (
            <button
              onClick={createButton.onClick}
              className="px-5 py-2 bg-lime-600 text-white font-medium rounded-lg hover:bg-lime-700 transition"
            >
              {createButton.label}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-800 overflow-hidden bg-gray-900/30">
        <Table
          columns={[
            ...columns,
            ...(rowActions
              ? [
                  {
                    label: "Actions",
                    render: (row: T) => (
                      <div className="flex items-center gap-3 justify-end">
                        {rowActions(row)}
                      </div>
                    ),
                  } as Column<T>,
                ]
              : []),
          ]}
          records={data}
          keyField={keyField}
          isLoading={loading}
          currentSort={sort}
          onSort={onSort}
          clickableRows={clickableRows}
          onRowClick={onRowClick}
        />
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          pageIndex={pagination.page}
          pageCount={pagination.totalPages}
          gotoPage={pagination.onPageChange}
          canPreviousPage={pagination.page > 0}
          canNextPage={pagination.page < pagination.totalPages - 1}
          perPage={pagination.perPage}
          perPageOptions={pagination.perPageOptions || [10, 20, 50]}
          onPerPageChange={pagination.onPerPageChange}
          totalCount={pagination.totalCount}
          itemsInPage={data.length}
        />
      )}
    </div>
  );
}
