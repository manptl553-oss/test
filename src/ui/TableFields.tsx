
import { useEffect } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Label } from "./Label";

export interface FieldOption {
  label: string;
  value: string;
}

export interface DynamicFiledOptions {
  name: string;
  label: string;
  type: "input" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
}
// export  interface TableFieldOption {
//   label: string;
//   name: string;
//   type: "input" | "select";
//   options?: { label: string; value: string }[];
// }

interface TableFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  columns: DynamicFiledOptions[];
  errors?: any;
}

function TableField({ control, name, label, columns, errors }: TableFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  useEffect(() => {
    if (!fields || fields.length === 0) {
      const emptyRow: any = {};
      columns.forEach((col) => {
        emptyRow[col.name] = "";
      });
      append(emptyRow);
    }
  }, []);

  const renderCell = (column: DynamicFiledOptions, rowIndex: number, errorMsg: string) => {
    switch (column.type) {
      case "input":
        return (
          <div key={`${name}.${rowIndex}.${column.name}`} className="space-y-2 w-full">
            <Controller
              control={control}
              name={`${name}.${rowIndex}.${column.name}`}
              render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder={column.label} className="border border-gray-300 focus-visible:ring-0" />}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "select":
        return (
          <div key={`${name}.${rowIndex}.${column.name}`} className="space-y-2 w-full">
            <Controller
              control={control}
              name={`${name}.${rowIndex}.${column.name}`}
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
    <div className="space-y-2 w-full">
      <Label className="block font-medium text-sm text-gray-700">{label}</Label>

      <div className="flex gap-2 font-semibold text-sm text-gray-700">
        {columns.map((col) => (
          <div key={col.name} className="flex-1">
            {col.label}
          </div>
        ))}
        <div className="w-20">Actions</div>
      </div>

      {fields.map((row, idx) => (
        <div key={row.id} className="flex gap-2 items-start">
          {columns.map((col) => (
            <div key={col.name} className="flex-1">
              {renderCell(col, idx, errors?.[idx]?.[col.name]?.message)}
            </div>
          ))}
          <Button type="button" variant="destructive" size="sm" onClick={() => remove(idx)} className="w-20" disabled={fields.length === 1}>
            ✕
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const emptyRow: any = {};
          columns.forEach((col) => {
            emptyRow[col.name] = "";
          });
          append(emptyRow);
        }}>
        + Add Row
      </Button>
    </div>
  );
}

export default TableField;
