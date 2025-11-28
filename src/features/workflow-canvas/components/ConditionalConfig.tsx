import { Button, Input, Label, Select } from "@/shared";
import { useFlowStore } from "@/store";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { LogicRulesFieldProps } from "../types";

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
  mode = "conditional",
}: LogicRulesFieldProps) => {
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  });

  const { edges, activeNode, setEdges } = useFlowStore();
  const removeEdge = useCallback((index: number) => {
    const existingEdges = edges.filter((e) => e.source === activeNode?.id);
    remove(index);
    const caseIndex = index + 1;
    if (caseIndex <= 0 || caseIndex >= existingEdges.length) return;

    const edgeToRemove = edges.findIndex(
      (e) => e.sourceHandle === `case_${caseIndex}`
    );
    const lastEdge = edges.findIndex(
      (e) => e.sourceHandle === `case_${existingEdges.length}`
    );

    const newEdges = [...edges];
    const temp = newEdges[edgeToRemove];
    newEdges[edgeToRemove] = {
      ...newEdges[lastEdge],
      sourceHandle: `case_${caseIndex}`,
      data: {
        ...newEdges[lastEdge].data,
        condition: `case_${caseIndex}`,
      },
    };
    newEdges[lastEdge] = {
      ...temp,
      sourceHandle: `case_${existingEdges.length}`,
      data: {
        ...temp.data,
        condition: `case_${existingEdges.length}`,
      },
    };
    setEdges(newEdges);
  }, []);

  return (
    <div className="w-full space-y-2">
      <Label className="block font-medium text-sm text-(--wf-text-default)">
        {label}
      </Label>

      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            {/* Field */}
            <Controller
              control={control}
              name={`${name}.${index}.field`}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Field"
                  className="border-(--wf-border-default)"
                />
              )}
            />

            {/* Operator */}
            <div className="flex-1">
              <Controller
                control={control}
                name={`${name}.${index}.operator`}
                render={({ field }) => (
                  <Select
                    options={operators}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Operator"
                    className="w-40"
                  />
                )}
              />
            </div>

            {/* Value */}
            <Controller
              control={control}
              name={`${name}.${index}.value`}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Value"
                  className="border-(--wf-border-default)"
                />
              )}
            />

            {fields.length > 1 && (
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={() => {
                  mode === "switch" ? removeEdge(index) : remove(index);
                }}
                className="text-black"
              >
                <Trash2 />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="hover:bg-(--wf-background-subtle)"
        onClick={() => append({ field: "", operator: "==", value: "" })}
      >
        + Add {mode === "switch" ? "Case" : "Condition"}
      </Button>

      {errors && <p className="text-red-500 text-xs">{errors.message}</p>}
    </div>
  );
};
