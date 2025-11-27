import React from "react";
import { Column, SortOrder } from "./types";
import { Row } from "./Row";
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";

interface TableProps<T> {
  columns: Array<Column<T>>;
  records: T[];
  keyField: keyof T;

  isLoading?: boolean;
  emptyText?: string;

  // Sorting (external)
  onSort?: (field: string, order: SortOrder) => void;
  currentSort?: { field: string; order: SortOrder };

  clickableRows?: boolean;
  onRowClick?: (record: T) => void;
}

export function Table<T>({
  columns,
  records,
  keyField,
  isLoading = false,
  emptyText = "No results found",
  onSort,
  currentSort,
  clickableRows = false,
  onRowClick,
}: TableProps<T>) {
  const getSortIcon = (field: string) => {
    if (!onSort) return null;

    if (currentSort?.field === field) {
      return currentSort.order === "asc" ? (
        <SortAsc size={18} />
      ) : (
        <SortDesc size={18} />
      );
    }
    return <ArrowUpDown size={18} />;
  };

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;

    const newOrder: SortOrder =
      currentSort?.field === col.field && currentSort.order === "asc"
        ? "desc"
        : "asc";

    onSort(String(col.field), newOrder);
  };

  return (
    <div className="border border-(--wf-border-default) rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-(--wf-border-default)">
        <thead className="bg-(--wf-background-subtle)">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                style={{ width: col.width }}
                className="p-3 text-left text-sm font-medium text-(--wf-text-default)"
              >
                <div
                  className={`flex items-center gap-1 ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => toggleSort(col)}
                >
                  {col.label}
                  {col.sortable && (
                    <span className="text-(--wf-text-muted)">{getSortIcon(String(col.field))}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-(--wf-border-default)">
          {isLoading ? (
            <tr>
              <td
                className="text-center py-8 text-(--wf-text-muted)"
                colSpan={columns.length}
              >
                Loading...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td
                className="text-center py-8 text-(--wf-text-muted)"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            records.map((row) => (
              <Row
                key={String(row[keyField])}
                record={row}
                columns={columns}
                clickable={clickableRows}
                onClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
