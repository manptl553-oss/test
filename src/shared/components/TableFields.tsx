import { useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { DynamicFiledOptions, TableFieldProps } from "../types";
import { cn } from "../utils";

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
          <div key={filedName} className={cn("space-y-2 w-full", cellClassName)}>
            <Controller
              control={control}
              name={filedName}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={column.label}
                  className="border border-gray-300 focus-visible:ring-0"
                />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "select":
        return (
          <div key={filedName} className={cn("space-y-2 w-full", cellClassName)}>
            <Controller
              control={control}
              name={filedName}
              render={({ field: { value, onChange } }) => (
                <Select value={value ?? ""} onValueChange={onChange}>
                  <SelectTrigger className="border border-gray-300 focus-visible:ring-0">
                    <SelectValue placeholder={`Select ${column.label}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    {column.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <Label className="block font-medium text-sm text-gray-700">{label}</Label>

      <div className={cn("flex gap-2 font-semibold text-sm text-gray-700", headerClassName)}>
        {columns &&
          columns.map((col) => (
            <div key={col.name} className="flex-1">
              {col.label}
            </div>
          ))}
        <div className="w-20">Actions</div>
      </div>

      {fields.map((row, idx) => (
        <div key={row.id} className={cn("flex gap-2 items-start", rowClassName)}>
          {columns
            ? columns.map((col) => (
                <div key={col.name} className="flex-1">
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
            className="w-20"
            disabled={fields.length === 1}
          >
            ✕
          </Button>
        </div>
      ))}

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

export { TableField };