import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { cn } from "@/shared/utils";
import { DynamicFormProps, FieldConfig } from "../types";
import {
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

/* ------------------------------- Main ------------------------------- */

export const DynamicForm = ({
  fields,
  schema,
  onSubmit,
  defaultValues = {},
  onCancel,
  twoPane = false,
  onClose,
}: DynamicFormProps) => {
  // Build deterministic defaults for all configured fields
  const initialDefaults = useMemo(() => {
    const defaults: Record<string, any> = {};

    fields.forEach((field) => {
      switch (field.type) {
        case "select":
          defaults[field.name] = field.options?.[0]?.value ?? "";
          break;
        case "tags":
          defaults[field.name] = [""];
          break;
        case "checkbox":
          defaults[field.name] = false;
          break;
        default:
          defaults[field.name] = "";
      }
    });

    // Merge provided defaults (editing) last
    return { ...defaults, ...defaultValues };
  }, [defaultValues, fields]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialDefaults,
    mode: "onSubmit",
    shouldUnregister: false,
  });

  // Keep form in sync when defaultValues change
  useEffect(() => {
    const merged: Record<string, any> = {};
    fields.forEach((field) => {
      switch (field.type) {
        case "select":
          merged[field.name] = field.options?.[0]?.value ?? "";
          break;
        case "tags":
          merged[field.name] = [""];
          break;
        case "checkbox":
          merged[field.name] = false;
          break;
        default:
          merged[field.name] = "";
      }
    });
    Object.assign(merged, defaultValues);
    reset(merged);
  }, [defaultValues, reset, fields]);

  // Old trigger-only visibility (kept for backward-compat)
  const authType = watch("auth_type");
  const visibleFields = useMemo(() => {
    if (!twoPane) return fields;
    return fields.filter((f) => {
      // const isHeader = f.type === "keyvalue";
      const isBasicCred = f.name === "username" || f.name === "password";
      // if (authType === "none") return !isHeader && !isBasicCred;
      // if (authType === "basic") return !isHeader;
      if (authType === "header") return !isBasicCred;
      return true;
    });
  }, [fields, twoPane, authType]);

  const renderField = (field: FieldConfig) => {
    const errorMsg = (errors as any)?.[field.name]?.message as
      | string
      | undefined;

    switch (field.type) {
      case "input":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label className="block font-medium text-sm text-gray-700">
              {field.label}
            </Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Input
                  disabled={field.readOnly}
                  {...rhf}
                  value={rhf.value ?? ""}
                  placeholder={field.placeholder}
                  className="border border-gray-300 focus-visible:ring-0"
                />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label className="block font-medium text-sm text-gray-700">
              {field.label}
            </Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Textarea
                  {...rhf}
                  value={rhf.value ?? ""}
                  placeholder={field.placeholder}
                  className="border border-gray-300 focus-visible:ring-0"
                />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label className="block font-medium text-sm text-gray-700">
              {field.label}
            </Label>

            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value ?? ""}
                  onValueChange={(val) => onChange(val)}
                  disabled={field.readOnly}
                >
                  <SelectTrigger className="border border-gray-300 focus-visible:ring-0 focus:border-gray-400">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-md">
                    {field.options?.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={cn(
                          "cursor-pointer text-sm transition-colors duration-150",
                          "hover:bg-primary/20 hover:text-primary",
                          "data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary"
                        )}
                      >
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

      case "richtext":
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label className="block font-medium text-sm text-gray-700">
              {field.label}
            </Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <RichTextEditor
                  value={value ?? ""}
                  onChange={onChange}
                  height={300}
                />
              )}
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );

      case "table":
        return (
          <TableField
            key={field.name}
            control={control}
            name={field.name}
            label={field.label}
            columns={(field.options as DynamicFiledOptions[]) || []}
            errors={errors[field.name]}
          />
        );

      case "checkbox":
        return (
          <div key={field.name} className="flex items-center gap-3 w-full">
            <Controller
              control={control}
              name={field.name}
              render={({ field: rhf }) => (
                <Checkbox
                  {...rhf}
                  checked={!!rhf.value}
                  className="border border-gray-300 focus-visible:ring-0"
                  onCheckedChange={(e) => {
                    rhf.onChange(e);
                  }}
                />
              )}
            />
            <Label className="block font-medium text-sm text-gray-700">
              {field.label}
            </Label>
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}{" "}
          </div>
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

      case "code": {
        const selectedLanguage = watch("language");
        return (
          <div key={field.name} className="space-y-2 w-full">
            <Label className="block font-medium text-sm text-gray-700 mt-4">
              {field.label}
            </Label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { value, onChange } }) => (
                <div
                  className="border border-gray-300 rounded-md overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === " ") e.stopPropagation();
                  }}
                >
                  <CodeEditor
                    onChange={() => {}}
                    selectedLanguage={selectedLanguage}
                    value={value ?? ""}
                  />
                </div>
              )}
            />

            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const left = visibleFields.filter((f) => f.type !== "textarea");
  const right = visibleFields.filter((f) => f.type === "textarea");

  const onSubmitInternal = (data: Record<string, any>) => {
    // Clean empty entries in tags arrays before forwarding
    const cleaned: Record<string, any> = { ...data };
    fields.forEach((f) => {
      if (f.type === "tags" && Array.isArray(cleaned[f.name])) {
        cleaned[f.name] = cleaned[f.name].filter(
          (s: string) => String(s).trim() !== ""
        );
      }
    });
    onSubmit?.(cleaned);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-4">
      <div className={twoPane ? "grid grid-cols-2 gap-6" : "space-y-3"}>
        <div className="space-y-3">
          {(twoPane ? left : visibleFields).map(renderField)}
        </div>
        {twoPane && <div className="space-y-3">{right.map(renderField)}</div>}
      </div>

      <div className="flex gap-3 pt-6">
        <Button type="submit" className="flex-1 text-white">
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
