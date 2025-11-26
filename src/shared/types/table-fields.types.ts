import { Control } from "react-hook-form";

export interface FieldOption {
  label: string;
  value: string;
}

interface DynamicFiledBase {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface TableFieldBase {
  control: Control<any>;
  name: string;
  label: string;
  errors?: any;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
}

export type TableFieldProps =
  | (TableFieldBase & { isTag?: false; columns: DynamicFiledOptions[] })
  | (TableFieldBase & { isTag: true; columns?: never });

export type DynamicFiledOptions =
  | (DynamicFiledBase & { type: "input" | "textarea"; options?: never })
  | (DynamicFiledBase & { type: "select"; options: FieldOption[] });
