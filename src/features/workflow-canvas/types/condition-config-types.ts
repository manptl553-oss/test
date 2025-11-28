import { Control } from "react-hook-form";

export interface LogicRulesFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  errors?: any;
  mode?: string;
}
