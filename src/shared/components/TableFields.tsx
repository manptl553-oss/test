<<<<<<< HEAD
import { useEffect } from "react";
=======
import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
<<<<<<< HEAD
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { DynamicFiledOptions, TableFieldProps } from "../types";
import { cn } from "../utils";
=======
import { Select } from "./Select";
import { Textarea } from "./TextArea";
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

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

  useEffect(() => {
    if (!fields || fields.length === 0) {
      const emptyRow: any = {};
      columns?.forEach((col) => {
        emptyRow[col.name] = "";
      });
      columns ? append(emptyRow) : append("");
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
<<<<<<< HEAD
          <div key={filedName} className={cn("wf-table-field__cell", cellClassName)}>
=======
          <div
            key={filedName}
            className={cn("wf-table-field__cell", cellClassName)}
          >
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
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
<<<<<<< HEAD
          <div key={filedName} className={cn("wf-table-field__cell", cellClassName)}>
=======
          <div
            key={filedName}
            className={cn("wf-table-field__cell", cellClassName)}
          >
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
            <Controller
              control={control}
              name={filedName}
              render={({ field: { value, onChange } }) => (
<<<<<<< HEAD
                <Select value={value ?? ""} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${column.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {column.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
=======
                <Select
                  options={column.options || []}
                  value={value ?? ""}
                  onValueChange={onChange}
                  placeholder={`Select ${column.label}`}
                />
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
              )}
            />
            {errorMsg && <p className="wf-table-field__error">{errorMsg}</p>}
          </div>
        );

<<<<<<< HEAD
=======
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
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
      default:
        return null;
    }
  };

  return (
    <div className={cn("wf-table-field", className)}>
      <Label className="wf-table-field__label">{label}</Label>

<<<<<<< HEAD
      <div className={cn("wf-table-field__header", headerClassName)}>
        {columns &&
          columns.map((col) => (
=======
      {columns && (
        <div className={cn("wf-table-field__header", headerClassName)}>
          {columns.map((col) => (
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
            <div key={col.name} className="wf-table-field__header-col">
              {col.label}
            </div>
          ))}
<<<<<<< HEAD
        <div className="wf-table-field__actions">Actions</div>
      </div>
=======
        </div>
      )}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

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
            : //hardcoded for tab
              renderCell(
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
<<<<<<< HEAD
            className="wf-table-field__remove"
=======
            className="wf-btn wf-btn--destructive wf-btn--size-icon text-black"
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
            disabled={fields.length === 1}
          >
            ✕
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
          columns?.forEach((col) => {
            emptyRow[col.name!] = "";
          });
          columns ? append(emptyRow) : append("");
        }}
      >
        + Add Row
      </Button>
    </div>
  );
}

<<<<<<< HEAD
export { TableField };
=======
export { TableField };
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
