import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  AddOnsConfig,
  AuthConfigFields,
  Button,
  Checkbox,
  CodeEditor,
  Input,
  Label,
  Select,
  TableField,
  Textarea,
} from "@/shared";
import RichTextEditor from "@/shared/components/TextEditor";
import { DynamicFormProps, FieldConfig } from "../types";
import { LogicRulesField } from "./ConditionalConfig";
import { ScheduleConfig } from "@/shared/components/ScheduleConfig";

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
          // Handle both single and multi select defaults
          if (f.isMulti) {
            d[f.name] = []; // Empty array for multi-select
          } else {
            d[f.name] = f.options?.[0]?.value ?? ""; // First option or empty string
          }
        } else if (f.type === "addOn") {
          d[f.name] = [];
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
    setValue,
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
          <div key={field.name} className="wf-field-group">
            <Label>{field.label}</Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Input
                  {...rhf}
                  placeholder={field.placeholder}
                  disabled={field.readOnly}
                />
              )}
            />
            {errorMsg && <p className="wf-error-text">{errorMsg}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="wf-field-group">
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
                  disabled={field.readOnly}
                />
              )}
            />
            {errorMsg && <p className="wf-error-text">{errorMsg}</p>}
          </div>
        );

      case "select": {
        const isMulti = field.type === "select" && field.isMulti === true;

        return (
          <div key={field.name} className="wf-field-group">
            <Label>{field.label}</Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <Select
                  isMulti={isMulti}
                  options={field.options || []}
                  value={value ?? (isMulti ? [] : "")}
                  onValueChange={onChange}
                  placeholder={isMulti ? "Select multiple" : "Select"}
                  isDisabled={field.readOnly}
                />
              )}
            />
            {errorMsg && <p className="wf-error-text">{errorMsg}</p>}
          </div>
        );
      }

      case "richtext":
        return (
          <div key={field.name} className="wf-field-group">
            <Label>{field.label}</Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <RichTextEditor
                  value={value}
                  onChange={onChange}
                  height={300}
                />
              )}
            />
            {errorMsg && <p className="wf-error-text">{errorMsg}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="wf-checkbox-row">
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Checkbox
                  checked={rhf.value}
                  onCheckedChange={rhf.onChange}
                  disabled={field.readOnly}
                />
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
          <div key={field.name} className="wf-field-group">
            <Label className="wf-field-label wf-field-label--spaced">
              {field.label}
            </Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <div
                  className="wf-code-editor-shell"
                  onKeyDown={(e) => {
                    if (e.key === " ") e.stopPropagation();
                  }}
                >
                  <CodeEditor
                    onChange={onChange}
                    selectedLanguage={selectedLanguage}
                    value={value ?? ""}
                  />
                </div>
              )}
            />
            {errorMsg && <p className="wf-error-text">{errorMsg}</p>}
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

      case "schedule":
        return (
          <ScheduleConfig
            control={control}
            key={field.name}
            errors={errors[field.name]}
          />
        );

      case "addOn":
        return (
          <AddOnsConfig
            control={control}
            setValue={setValue}
            key={field.name}
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
    <form onSubmit={handleSubmit(onSubmitInternal)} className="wf-dynamic-form">
      <div className={twoPane ? "wf-form-grid" : "wf-field-column"}>
        <div className="wf-field-column wf-scroll-hide">
          {(twoPane ? left : visibleFields).map(renderField)}
        </div>
        {twoPane && (
          <div className="wf-field-column wf-scroll-hide">
            {right.map(renderField)}
          </div>
        )}
      </div>

      <div className="wf-actions-row">
        <Button
          type="submit"
          className="wf-button-fill wf-button-text-contrast"
        >
          Save
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="wf-button-fill"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
