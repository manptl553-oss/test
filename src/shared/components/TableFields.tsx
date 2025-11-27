import { useEffect, useRef } from "react";
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
import { cn, formatName } from "../utils";
import { Textarea } from "./TextArea";
import { Delete, DeleteIcon, Trash2 } from "lucide-react";

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
            className={cn("space-y-2 w-full", cellClassName)}
          >
            <Controller
              control={control}
              name={filedName}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={column.label}
                  className="border-(--wf-border-default)"
                />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "select":
        return (
          <div
            key={filedName}
            className={cn("space-y-2 w-full", cellClassName)}
          >
            <Controller
              control={control}
              name={filedName}
              render={({ field: { value, onChange } }) => {
                const selected = column.options?.find(
                  (opt) => opt.value === value
                );
                return (
                  <Select value={value ?? ""} onValueChange={onChange}>
                    <SelectTrigger className="border-(--wf-border-default) text-(--wf-text-default)">
                      <SelectValue placeholder={`Select ${column.label}`}>
                        {formatName(
                          selected?.label ?? `Select ${column.label}`
                        )}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="bg-(--wf-background-subtle) border-(--wf-border-default)">
                      {column.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {formatName(opt.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={filedName} className="space-y-2 w-full">
            <Controller
              control={control}
              name={filedName}
              render={({ field: rhf }) => (
                <Textarea
                  placeholder={column.label}
                  value={
                    typeof rhf.value === "string"
                      ? rhf.value
                      : JSON.stringify(rhf.value ?? {}, null, 2)
                  }
                  onChange={(e) => rhf.onChange(e.target.value)}
                  className="border-(--wf-border-default) text-(--wf-text-default)"
                />
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
    <div className={cn("space-y-3 w-full", className)}>
      <Label className="block font-medium text-sm text-(--wf-text-default)">
        {label}
      </Label>

      {columns && (
        <div
          className={cn(
            "flex gap-2 font-semibold text-sm text-(--wf-text-default) mr-[40px]",
            headerClassName
          )}
        >
          {columns.map((col) => (
            <div key={col.name} className="flex-1">
              {col.label}
            </div>
          ))}
        </div>
      )}

      {fields.map((row, idx) => (
        <div
          key={row.id}
          className={cn("flex gap-2 items-start", rowClassName)}
        >
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
            className="text-black"
            disabled={fields.length === 1}
          >
            <Trash2 />
          </Button>
        </div>
      ))}

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
