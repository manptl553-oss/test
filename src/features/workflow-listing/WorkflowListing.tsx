import { useState, useRef, useEffect } from "react";
import { Pagination, Table } from "@/shared";
import { Column, SortOrder } from "@/shared/components/table/types";
import "./workflow-listing.css";

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
    <div className="wf-listing-root">
      {/* Header */}
      <div className="wf-listing-header">
        <h2 className="wf-listing-title">
          {title || "Workflows"}
        </h2>

        <div className="wf-listing-controls">
          {/* Search */}
          {onSearchChange && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="wf-listing-search"
            />
          )}

          {/* Status Filter */}
          {onStatusFilterChange && (
            <div className="wf-listing-filter" ref={popupRef}>
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={
                  hasActiveFilter
                    ? "wf-listing-filter-btn wf-listing-filter-btn--active"
                    : "wf-listing-filter-btn"
                }
              >
                <span>Filter</span>
                {hasActiveFilter && (
                  <div className="wf-listing-filter-dot"></div>
                )}
              </button>

              {isFilterOpen && (
                <div className="wf-listing-filter-menu">
                  <div className="wf-listing-filter-panel">
                    <label className="wf-listing-filter-label">
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
                      className="wf-listing-filter-select"
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
                        className="wf-listing-filter-clear"
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
              className="wf-listing-create-btn"
            >
              {createButton.label}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="wf-listing-table">
        <Table
          columns={[
            ...columns,
            ...(rowActions
              ? [
                  {
                    label: "Actions",
                    render: (row: T) => (
                      <div className="wf-listing-row-actions">
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
