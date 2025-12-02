import React from "react";

export type SortOrder = "asc" | "desc";

export type Column<T> = {
  label: string;
  field: keyof T | string; // string allows custom render
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};
