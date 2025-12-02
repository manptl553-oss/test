import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { DynamicFiledOptions, TableFieldProps } from "../types";
import { cn } from "../utils";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { Select } from "./Select";
import { Textarea } from "./TextArea";

function TableField({
  control,
  name,
  label,
  errors,
  isTag = false,
  columns,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
}: TableFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && (!fields || fields.length === 0)) {
      const emptyRow: any = {};
      columns?.forEach((col) => {
        emptyRow[col.name] = "";
      });
      columns ? append(emptyRow) : append("");
      initializedRef.current = true;
    }
  }, []);

  const renderCell = (
    column: DynamicFiledOptions,
    isTag: boolean,
    rowIndex: number,
    errorMsg?: string
  ) => {
    const filedName = !isTag
      ? `${name}.${rowIndex}.${column.name}`
      : `${name}.${rowIndex}`;

    switch (column.type) {
      case "input":
        return (
          <div
            key={filedName}
            className={cn("wf-table-field__cell", cellClassName)}
          >
            <Controller
              control={control}
              name={filedName}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={column.label}
                />
              )}
            />
            {errorMsg && <p className="wf-table-field__error">{errorMsg}</p>}
          </div>
        );

      case "select":
        return (
          <div
            key={filedName}
            className={cn("wf-table-field__cell", cellClassName)}
          >
            <Controller
              control={control}
              name={filedName}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={column.options || []}
                  value={value ?? ""}
                  onValueChange={onChange}
                  placeholder={`Select ${column.label}`}
                />
              )}
            />
            {errorMsg && <p className="wf-table-field__error">{errorMsg}</p>}
          </div>
        );

      // case "textarea":
      //   return (
      //     <div key={filedName} className="space-y-2 w-full">
      //       <Controller
      //         control={control}
      //         name={filedName}
      //         render={({ field: rhf }) => (
      //           <Textarea
      //             placeholder={column.label}
      //             value={
      //               typeof rhf.value === "string"
      //                 ? rhf.value
      //                 : JSON.stringify(rhf.value ?? {}, null, 2)
      //             }
      //             onChange={(e) => rhf.onChange(e.target.value)}
      //             className="border-(--wf-border-default) text-(--wf-text-default)"
      //           />
      //         )}
      //       />

      //       {errorMsg && <p className="wf-error-text">{errorMsg}</p>}
      //     </div>
      //   );
      default:
        return null;
    }
  };

  return (
    <div className={cn("wf-table-field", className)}>
      <Label className="wf-table-field__label">{label}</Label>

      {columns && (
        <div className={cn("wf-table-field__header", headerClassName)}>
          {columns.map((col) => (
            <div key={col.name} className="wf-table-field__header-col">
              {col.label}
            </div>
          ))}
        </div>
      )}

      {fields.map((row, idx) => (
        <div key={row.id} className={cn("wf-table-field__row", rowClassName)}>
          {columns
            ? columns.map((col) => (
                <div key={col.name} className="wf-table-field__cell">
                  {renderCell(
                    col,
                    isTag,
                    idx,
                    errors?.[idx]?.[col.name]?.message
                  )}
                </div>
              ))
            : renderCell(
                { name, type: "input", label },
                isTag,
                idx,
                errors?.[idx]?.message
              )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(idx)}
            className="wf-btn wf-btn--destructive wf-btn--size-icon text-black"
            disabled={fields.length === 1}
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      {errors?.root?.message && (
        <p className="wf-error-text">{errors?.root?.message}</p>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const emptyRow: any = {};
          columns?.forEach((col) => (emptyRow[col.name!] = ""));
          columns ? append(emptyRow) : append("");
        }}
      >
        + Add Row
      </Button>
    </div>
  );
}

export { TableField };
