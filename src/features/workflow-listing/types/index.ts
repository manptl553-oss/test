import { Column, SortOrder } from "@/shared/components/table/types";
import { ReactNode } from "react";

export type WorkflowStatus = "all" | "enabled" | "disabled";

export interface WorkflowStatusOption {
  value: WorkflowStatus;
  label: string;
}

// ---------- Search ----------
export interface WorkflowSearchConfig {
  query: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  debounce?: number;
}

// ---------- Filter ----------
export interface WorkflowFilterConfig {
  status: WorkflowStatus;
  onStatusChange: (status: WorkflowStatus) => void;
  options?: WorkflowStatusOption[];
}

// ---------- Sorting ----------
export interface WorkflowSort {
  field: string;
  order: SortOrder;
}

export interface WorkflowPagination {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  perPageOptions?: number[];
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

// ---------- Main Props ----------
export interface WorkflowListingProps<T = unknown> {
  /** Data source rows */
  data: T[];

  /** Table columns */
  columns: Column<T>[];

  /** Unique row key field */
  rowKey: keyof T;

  /** Title above component */
  title?: string;

  /** Loading state */
  loading?: boolean;

  /** Search configuration */
  searchConfig?: WorkflowSearchConfig;

  /** Filter configuration */
  filterConfig?: WorkflowFilterConfig;

  /** Create button */
  showCreateButton?: boolean;
  createButtonLabel?: string;
  onCreate?: () => void;

  /** Sorting */
  sortConfig?: WorkflowSort;
  onSortChange?: (field: string, order: SortOrder) => void;

  /** Row interaction */
  enableRowClick?: boolean;
  onRowClick?: (row: T) => void;

  /** Custom actions cell */
  renderRowActions?: (row: T) => ReactNode;

  /** Pagination */
  pagination?: WorkflowPagination;
}
