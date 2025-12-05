import { DynamicFiledOptions, FieldOption } from "@/shared";

export type BaseFieldType =
  | "input"
  | "textarea"
  | "richtext"
  | "checkbox"
  | "tags"
  | "code"
  | "conditions"
  | "cases"
  | "auth"
  | "schedule"
  | "addOn"
  | "loop";

interface FieldBaseConfig {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}

export interface DynamicFormProps {
  fields: FieldConfig[];
  schema?: any;
  onSubmit?: (data: Record<string, any>) => void;
  defaultValues?: Record<string, any>;
  onCancel?: () => void;
  twoPane?: boolean;
  onClose?: () => void;
}

export type FieldConfig =
  | (FieldBaseConfig & {
      type: BaseFieldType;
      options?: never;
      isMulti?: never;
    })
  | (FieldBaseConfig & {
      type: "select";
      options: FieldOption[];
      isMulti?: boolean;
    })
  | (FieldBaseConfig & {
      type: "table";
      options: DynamicFiledOptions[];
      isMulti?: never;
    });
