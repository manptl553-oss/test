import { useEffect } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Label } from "./Label";
import { Input } from "./Input";
import { Button } from "./Button";

function KeyValueField({
  control,
  name,
  label,
}: {
  control: Control<any>;
  name: string;
  label: string;
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
            name={`${name}.${idx}.key`}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Email Address"
                className="border border-gray-300 focus-visible:ring-0"
              />
            )}
          />
          <Controller
            control={control}
            name={`${name}.${idx}.value`}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Value"
                className="border border-gray-300 focus-visible:ring-0"
              />
            )}
          />
          <Button type="button" variant="ghost" onClick={() => remove(idx)}>
            ✕
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ key: "", value: "" })}
      >
        + Add Header
      </Button>
    </div>
  );
}

export { KeyValueField };
