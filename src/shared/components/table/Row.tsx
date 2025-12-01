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
      className={`wf-table-body-row ${clickable ? "wf-table-body-row--clickable" : ""}`}
     onClick={() => {
    if (!clickable) return;
    onClick?.(record);
  }}
    >
      {columns.map((col) => (
        <td className="wf-table-cell" key={String(col.field)}>
          {col.render ? col.render(record) : String(record[col.field as keyof T] ?? "-")}
        </td>
      ))}
    </tr>
  );
}
