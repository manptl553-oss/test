import React from "react";
import { Column } from "./types";

interface RowProps<T> {
  record: T;
  columns: Array<Column<T>>;
  clickable?: boolean;
  onClick?: (record: T) => void;
}

export function Row<T>({
  record,
  columns,
  clickable = false,
  onClick,
}: RowProps<T>) {
  return (
 <tr
  className={`border-t ${clickable ? "cursor-pointer hover:bg-gray-50" : ""}`}
  onClick={(e) => {
    if (!clickable) return;
    onClick?.(record);
  }}
>

      {columns.map((col) => (
        <td
          key={String(col.field)}
          className="p-4 text-sm text-(--wf-text-default)"
        >
          {col.render
            ? col.render(record)
            : String(record[col.field as keyof T] ?? "-")}
        </td>
      ))}
    </tr>
  );
}
