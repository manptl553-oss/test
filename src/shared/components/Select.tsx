import React, { JSX } from "react";
import ReactSelect, {
  Props as ReactSelectProps,
  StylesConfig,
  GroupBase,
} from "react-select";
import { formatName } from "@/shared/utils";

export interface Option {
  value: string;
  label: string;
}

// Base props shared between single and multi
interface BaseSelectProps {
  options: Option[];
  placeholder?: string;
  className?: string;
  useFormattedLabel?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  error?: string;
}

// Single select props
interface SingleSelectProps extends BaseSelectProps {
  isMulti?: false;
  value?: string;
  onValueChange?: (value: string) => void;
}

// Multi select props
interface MultiSelectProps extends BaseSelectProps {
  isMulti: true;
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

// Union type for all props
type SelectProps = SingleSelectProps | MultiSelectProps;

// Overload signatures for better type inference
// export function Select(props: SingleSelectProps): JSX.Element;
// export function Select(props: MultiSelectProps): JSX.Element;
export function Select(props: SelectProps): JSX.Element {
  const {
    options,
    value,
    onValueChange,
    placeholder = "Select",
    className,
    useFormattedLabel = true,
    isMulti = false,
    isDisabled = false,
    isClearable = false,
    isSearchable = true,
    error,
  } = props;

  // Type guards and converters
  const getSelectedOption = (): Option | Option[] | null => {
    if (isMulti) {
      if (!value || !Array.isArray(value)) return [];
      return options.filter((opt) => (value as string[]).includes(opt.value));
    } else {
      if (!value || typeof value !== "string") return null;
      return options.find((opt) => opt.value === value) || null;
    }
  };

  const selectedOption = getSelectedOption();

  // Handle change with proper typing
  const handleChange = (newValue: Option | Option[] | null) => {
    if (!onValueChange) return;

    if (isMulti) {
      const values = Array.isArray(newValue)
        ? newValue.map((opt) => opt.value)
        : [];
      (onValueChange as (value: string[]) => void)(values);
    } else {
      const singleValue =
        newValue && !Array.isArray(newValue) ? newValue.value : "";
      (onValueChange as (value: string) => void)(singleValue);
    }
  };

  // Custom styles
  const customStyles: StylesConfig<Option, boolean, GroupBase<Option>> = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "8px",
      backgroundColor: "var(--wf-background-subtle, #111827)",
      borderColor: state.isFocused
        ? "var(--wf-border-focus, #84cc16)"
        : error
        ? "var(--wf-feedback-danger-bg, #ef4444)"
        : "var(--wf-border-default, #374151)",
      color: "var(--wf-text-default, #f9fafb)",
      boxShadow: state.isFocused
        ? "0 0 0 2px var(--wf-border-focus, rgba(132,204,22,0.4))"
        : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? "var(--wf-border-focus, #84cc16)"
          : "var(--wf-border-default, #4b5563)",
      },
    }),

    menu: (base) => ({
      ...base,
      marginTop: "4px",
      backgroundColor: "var(--wf-background-subtle, #1f2937)",
      borderRadius: "8px",
      border: "1px solid var(--wf-border-default, #374151)",
      boxShadow: "0 12px 25px rgba(0,0,0,0.4)",
      backdropFilter: "blur(6px)",
      overflow: "hidden",
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 999999,
    }),

    option: (base, state) => ({
      ...base,
      padding: "8px 12px",
      fontSize: "0.875rem",
      borderRadius: "0",
      backgroundColor: state.isSelected
        ? "var(--wf-brand-primary, #7ec040)"
        : state.isFocused
        ? "var(--wf-background-hover, #374151)"
        : "transparent",
      color: state.isSelected
        ? "var(--wf-text-inverted, #ffffff)"
        : "var(--wf-text-default, #f9fafb)",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "var(--wf-brand-primary, #7ec040)",
        color: "var(--wf-text-inverted, #ffffff)",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "var(--wf-text-default, #f9fafb)",
    }),

    placeholder: (base) => ({
      ...base,
      color: "var(--wf-text-muted, #9ca3af)",
    }),

    input: (base) => ({
      ...base,
      color: "var(--wf-text-default, #f9fafb)",
    }),

    multiValue: (base) => ({
      ...base,
      background: "var(--wf-background-highlight, rgba(255,255,255,0.1))",
      borderRadius: "6px",
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: "var(--wf-text-default, #e5e7eb)",
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: "var(--wf-text-muted, #9ca3af)",
      "&:hover": {
        background: "var(--wf-feedback-danger-bg, #ef4444)",
        color: "white",
      },
    }),
  };

  // Format label
  const formatLabel = (option: Option) => {
    return useFormattedLabel ? formatName(option.label) : option.label;
  };

  return (
    <div className="w-full">
      <ReactSelect<Option, boolean, GroupBase<Option>>
        options={options}
        value={selectedOption}
        onChange={handleChange as any}
        placeholder={placeholder}
        styles={customStyles}
        className={className}
        classNamePrefix="react-select"
        formatOptionLabel={useFormattedLabel ? formatLabel : undefined}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        menuPlacement="auto"
        isMulti={isMulti}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        closeMenuOnSelect={!isMulti}
      />
      {error && <p className="wf-error-text mt-1">{error}</p>}
    </div>
  );
}
