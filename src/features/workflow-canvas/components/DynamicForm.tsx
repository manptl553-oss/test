import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { cn, formatName } from "@/shared/utils";
import { DynamicFormProps, FieldConfig } from "../types";
import {
  AuthConfigFields,
  Button,
  Checkbox,
  CodeEditor,
  DynamicFiledOptions,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TableField,
  Textarea,
} from "@/shared";
import RichTextEditor from "@/shared/components/TextEditor";
import { LogicRulesField } from "./ConditionalConfig";

const splitExpression = (expr = "") => {
  const regex = /(.+?)\s*(==|!=|===|>=|<=|>|<)\s*(.+)/;
  const m = expr.match(regex);
  if (!m) return { field: "", operator: "==", value: "" };
  return { field: m[1].trim(), operator: m[2], value: m[3].trim() };
};

export const DynamicForm = ({
  fields,
  schema,
  onSubmit,
  defaultValues = {},
  onCancel,
  twoPane = false,
  onClose,
}: DynamicFormProps) => {
  const cleanedDefaults = useMemo(() => {
    const d: any = { ...defaultValues };

    if (!Array.isArray(d.conditions) || d.conditions.length === 0) {
      d.conditions = [{ field: "", operator: "==", value: "" }];
    } else {
      d.conditions = d.conditions.map((c: any) =>
        c.expression ? splitExpression(c.expression) : c
      );
    }

    if (!Array.isArray(d.switchCases) || d.switchCases.length === 0) {
      d.switchCases = [{ field: "", operator: "==", value: "" }];
    } else {
      d.switchCases = d.switchCases.map((c: any) =>
        c.expression ? splitExpression(c.expression) : c
      );
    }

    fields.forEach((f) => {
      if (d[f.name] === undefined) {
        if (f.type === "conditions" || f.type === "cases") {
          d[f.name] = [{ field: "", operator: "==", value: "" }];
        } else if (f.type === "tags") {
          d[f.name] = [""];
        } else if (f.type === "checkbox") {
          d[f.name] = false;
        } else if (f.type === "select") {
          d[f.name] = f.options?.[0]?.value ?? "";
        } else {
          d[f.name] = "";
        }
      }
    });

    return d;
  }, [defaultValues, fields]);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: cleanedDefaults,
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const authType = watch("auth_type");

  const visibleFields = useMemo(() => {
    if (!twoPane) return fields;

    return fields.filter((f) => {
      const isBasicCred = f.name === "username" || f.name === "password";
      if (authType === "header") return !isBasicCred;
      return true;
    });
  }, [fields, twoPane, authType]);

  const renderField = (field: FieldConfig) => {
    const errorMsg = (errors as any)?.[field.name]?.message;

    switch (field.type) {
      case "input":
        return (
          <div key={field.name} className="space-y-3 w-full mt-3">
            <Label className="block">{field.label}</Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Input {...rhf} placeholder={field.placeholder} />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label>{field.label}</Label>

            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Textarea
                  placeholder={field.placeholder}
                  value={
                    typeof rhf.value === "string"
                      ? rhf.value
                      : JSON.stringify(rhf.value ?? {}, null, 2)
                  }
                  onChange={(e) => rhf.onChange(e.target.value)}
                />
              )}
            />

            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label>{field.label}</Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => {
                const selected = field.options?.find(
                  (opt) => opt.value === value
                );
                return (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="border-(--wf-border-default) text-(--wf-text-default)">
                      <SelectValue placeholder="Select">
                        {formatName(selected?.label ?? "Select")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-(--wf-background-subtle) border-(--wf-border-default)">
                      {field.options?.map((opt) => (
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

      case "richtext":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label>{field.label}</Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <RichTextEditor value={value} onChange={onChange} height={300} />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="flex items-center gap-3">
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Checkbox checked={rhf.value} onCheckedChange={rhf.onChange} />
              )}
            />
            <Label>{field.label}</Label>
          </div>
        );

      case "table":
        return (
          <TableField
            key={field.name}
            control={control}
            name={field.name}
            label={field.label}
            columns={field?.options || []}
            errors={errors[field.name]}
          />
        );

      case "tags":
        return (
          <TableField
            key={field.name}
            control={control}
            name={field.name}
            label={field.label}
            errors={errors[field.name]}
            isTag
          />
        );

      case "code":
        const selectedLanguage = watch("language");
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label className="block font-medium text-sm text-(--wf-text-default) mt-4">
              {field.label}
            </Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <div
                  className="
                    border border-(--wf-border-default) rounded-md overflow-hidden shadow-sm
                    focus-within:ring-2 focus-within:ring-(--wf-border-focus)
                  "
                  onKeyDown={(e) => e.key === " " && e.stopPropagation()}
                >
                  <CodeEditor
                    onChange={onChange}
                    selectedLanguage={selectedLanguage}
                    value={value ?? ""}
                  />
                </div>
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "conditions":
      case "cases":
        return (
          <LogicRulesField
            key={field.name}
            control={control}
            name={field.name}
            label={field.label}
            mode={field.type === "cases" ? "switch" : "conditional"}
            errors={errors[field.name]}
          />
        );

      case "auth":
        return (
          <AuthConfigFields
            control={control}
            key={field.name}
            name={field.name}
            errors={errors[field.name]}
          />
        );
    }
  };

  const left = visibleFields.filter((f) => f.type !== "textarea");
  const right = visibleFields.filter((f) => f.type === "textarea");

  const onSubmitInternal = (data: Record<string, any>) => {
    onSubmit?.(data);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-4">
      <div
        className={
          twoPane
            ? "grid grid-cols-2 gap-6"
            : "space-y-3 max-h-[500px] overflow-y-auto h-full scroll-hide relative"
        }
      >
        <div className="space-y-3 mt-3">
          {(twoPane ? left : visibleFields).map(renderField)}
        </div>

        {twoPane && <div className="space-y-3">{right.map(renderField)}</div>}
      </div>

      <div className="flex gap-3 pt-6">
        <Button type="submit" className="flex-1">
          Save
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
