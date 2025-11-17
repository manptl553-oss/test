import { Controller, useFieldArray } from "react-hook-form";
import {
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared";

const operators = [
  { label: "EQUALS", value: "==" },
  { label: "STRICT EQUALS", value: "===" },
  { label: "NOT EQUALS", value: "!=" },
  { label: "GREATER THAN", value: ">" },
  { label: "LESS THAN", value: "<" },
  { label: "GREATER OR EQUAL", value: ">=" },
  { label: "LESS OR EQUAL", value: "<=" },
];

export const LogicRulesField = ({
  control,
  name,
  label,
  errors,
  mode = "conditional", // "conditional" | "switch"
}: any) => {

  const { fields, append, remove } = useFieldArray({
    name,
    control,
  });

  return (
    <div className="w-full space-y-2">
      <Label className="block font-medium text-sm text-gray-700">{label}</Label>

      <div className="space-y-3 max-h-[400px] overflow-y-auto border p-3 rounded-md">
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center border p-2 rounded-md">
            
            {/* Field */}
            <Controller
              control={control}
              name={`${name}.${index}.field`}
              render={({ field }) => (
                <Input {...field} placeholder="Field" className="border" />
              )}
            />

            {/* Operator */}
            <Controller
              control={control}
              name={`${name}.${index}.operator`}
              render={({ field }) => {
                const selected = operators.find(o => o.value === field.value);
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border w-40">
                      <span>{selected?.label ?? "Operator"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />

            {/* Value */}
            <Controller
              control={control}
              name={`${name}.${index}.value`}
              render={({ field }) => (
                <Input {...field} placeholder="Value" className="border" />
              )}
            />

            {fields.length > 1 && (
              <Button variant="destructive" size="icon" type="button" onClick={() => remove(index)}>
                ✕
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="bg-primary text-white"
        onClick={() => append({ field: "", operator: "==", value: "" })}
      >
        + Add {mode === "switch" ? "Case" : "Condition"}
      </Button>

      {errors && <p className="text-red-500 text-xs">{errors.message}</p>}
    </div>
  );
};
