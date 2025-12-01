import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Pagination, Table } from "@/shared";
import { Column } from "@/shared/components/table/types";
import { WorkflowFilterConfig, WorkflowListingProps, WorkflowSearchConfig, WorkflowStatus, WorkflowStatusOption } from "./types";

const DEFAULT_DEBOUNCE = 400;

/**==============================
 * Defaults
 *==============================*/

const DEFAULT_STATUS_OPTIONS: WorkflowStatusOption[] = [
  { value: "all", label: "All Workflows" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

const DEFAULT_SEARCH_CONFIG: Required<WorkflowSearchConfig> = {
  query: "",
  onSearch: () => {},
  placeholder: "Search workflows...",
  debounce: DEFAULT_DEBOUNCE,
};

const DEFAULT_FILTER_CONFIG: Required<WorkflowFilterConfig> = {
  status: "all",
  onStatusChange: () => {},
  options: DEFAULT_STATUS_OPTIONS,
};

/**==============================
 * Component
 *==============================*/

export function WorkflowListing<T = unknown>({
  data,
  columns,
  rowKey,
  title,
  loading = false,

  // Search
  searchConfig,

  // Filter
  filterConfig,

  // Create button
  showCreateButton = false,
  createButtonLabel = "Create Workflow",
  onCreate,

  // Sorting
  sortConfig,
  onSortChange,

  // Row interactions
  enableRowClick = true,
  onRowClick,
  renderRowActions,

  // Pagination
  pagination,
}: WorkflowListingProps<T>) {
  /** Normalize configs */
  const search = { ...DEFAULT_SEARCH_CONFIG, ...searchConfig };
  const filter = { ...DEFAULT_FILTER_CONFIG, ...filterConfig };

  /** Determine if user intended to display controls */
  const showSearch = !!searchConfig;
  const showFilter = !!filterConfig;

  /** UI State */
  const [localQuery, setLocalQuery] = useState(search.query);
  const [filterOpen, setFilterOpen] = useState(false);

  // Refs for stability
  const onSearchRef = useRef(search.onSearch);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Keep ref in sync with latest prop */
  useEffect(() => {
    onSearchRef.current = search.onSearch;
  }, [search.onSearch]);

  /**================================
   * Debounced search behavior
   *================================*/
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      // Use the stable ref to call the parent
      if (onSearchRef.current) {
        onSearchRef.current(localQuery.trim());
      }
    }, search.debounce);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // Only re-run if the query string actually changes
  }, [localQuery, search.debounce]);

  /** External search sync (if parent clears search) */
  useEffect(() => {
    if (search.query !== localQuery) {
      setLocalQuery(search.query);
    }
  }, [search.query]);

  /** Close filter when clicking outside */
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!popupRef.current?.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  const hasActiveFilter = filter.status !== "all";

  /**==============================
   * Render
   *==============================*/

  return (
        <div className="wf-listing-root">

      {/* HEADER */}
      <div className="wf-listing-header">
        <h2 className="wf-listing-title">
          {title || "Workflows"}
        </h2>

        <div className="wf-listing-controls">

          {/* SEARCH */}
          {showSearch && (
            <input
              type="text"
              placeholder={search.placeholder}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="
               wf-listing-search
              "
            />
          )}

          {/* FILTER */}
          {showFilter && (
            <div className="wf-listing-filter" ref={popupRef}>
              <Button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                variant={"default"}
              >
                Filter
                {hasActiveFilter && (
                  <div className="wf-listing-filter-dot"></div>
                )}
              </Button>

              {filterOpen && (
                <div className="wf-listing-filter-menu">
                  <div className="wf-listing-filter-panel">
                    <label className="wf-listing-filter-label">
                      Status
                    </label>

                    <select
                      value={filter.status}
                      onChange={(e) =>
                        filter.onStatusChange(e.target.value as WorkflowStatus)
                      }
                      className="wf-listing-filter-select"
                    >
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {hasActiveFilter && (
                      <button
                        type="button"
                        onClick={() => filter.onStatusChange("all")}
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

          {/* CREATE BUTTON */}
          {showCreateButton && (
            <Button
              type="button"
              className="wf-listing-create-btn"
              onClick={onCreate}
            >
              {createButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <Table
        keyField={rowKey}
        records={data}
        columns={[
          ...columns,
          ...(renderRowActions
            ? [
                {
                  label: "Actions",
                  render: (row: T) => (
                    <div
                      className="wf-listing-row-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderRowActions(row)}
                    </div>
                  ),
                } as Column<T>,
              ]
            : []),
        ]}
        isLoading={loading}
        currentSort={sortConfig}
        onSort={onSortChange}
        clickableRows={!renderRowActions && enableRowClick}
        onRowClick={!renderRowActions ? onRowClick : undefined}
      />

      {/* PAGINATION */}
      {pagination && (
         <Pagination
            pageIndex={pagination.page}
            pageSize={pagination.perPage}
            totalCount={pagination.totalCount}
            pageCount={pagination.totalPages}
            pageSizeOptions={pagination.perPageOptions || [10, 20, 50]}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPerPageChange}
        />
      )}
    </div>
  );
}

export default WorkflowListing;