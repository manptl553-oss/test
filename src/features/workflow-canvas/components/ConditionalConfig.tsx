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
import { useFlowStore } from "@/store";
import { useCallback } from "react";

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
}: any) => {
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
    <div className="wf-field-group">
      <Label className="wf-field-label">{label}</Label>

      <div className="wf-logic-rows">
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="wf-logic-row"
          >
            {/* Field */}
            <Controller
              control={control}
              name={`${name}.${index}.field`}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Field"
                  className="wf-input-bordered"
                />
              )}
            />

            {/* Operator */}
            <Controller
              control={control}
              name={`${name}.${index}.operator`}
              render={({ field }) => {
                const selected = operators.find((o) => o.value === field.value);
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="wf-select-trigger">
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
                <Input
                  {...field}
                  placeholder="Value"
                  className="wf-input-bordered"
                />
              )}
            />

            {fields.length > 1 && (
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={() => {
                  mode == "switch" ? removeEdge(index) : remove(index);
                }}
              >
                ✕
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="wf-primary-cta"
        onClick={() => append({ field: "", operator: "==", value: "" })}
      >
        + Add {mode === "switch" ? "Case" : "Condition"}
      </Button>

      {errors && <p className="wf-error-text">{errors.message}</p>}
    </div>
  );
};
