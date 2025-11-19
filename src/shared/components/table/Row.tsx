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
      onClick={() => clickable && onClick?.(record)}
    >
      {columns.map((col) => (
        <td className="p-3 text-sm text-gray-700" key={String(col.field)}>
          {col.render ? col.render(record) : String(record[col.field as keyof T] ?? "-")}
        </td>
      ))}
    </tr>
  );
}
