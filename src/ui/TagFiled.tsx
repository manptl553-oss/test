import { useEffect } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Label } from "./Label";
import { Input } from "./Input";
import { Button } from "./Button";

function TagsField({
  control,
  name,
  label,
  placeholder = "Enter value",
  errors,
}: {
  control: Control<any>;
  name: string; // string[]
  label: string;
  placeholder?: string;
  errors?: any;
}) {
  const {
    fields: kvFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  useEffect(() => {
    if (!kvFields || kvFields.length === 0) {
      append({ key: "", value: "" });
    }
  }, [kvFields, append]);

  return (
    <div className="space-y-2">
      <Label className="block font-medium text-sm text-gray-700">{label}</Label>
      {kvFields.map((row, idx) => (
        <div key={row.id} className="flex gap-2">
          <Controller
            control={control}
            name={`${name}.${idx}`}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={placeholder}
                className="border border-gray-300 focus-visible:ring-0"
              />
            )}
          />
          <Button type="button" variant="ghost" onClick={() => remove(idx)}>
            ✕
          </Button>
          {errors?.[idx]?.message && (
            <p className="text-red-500 text-xs">{errors?.[idx]?.message}</p>
          )}
        </div>
      ))}
      {errors?.root?.message && (
        <p className="text-red-500 text-xs">{errors?.root?.message}</p>
      )}
      <Button type="button" variant="outline" onClick={() => append("")}>
        + Add Recipient
      </Button>
    </div>
  );
}

export { TagsField };
