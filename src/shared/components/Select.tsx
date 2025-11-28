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
      minHeight: "40px",
      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? "var(--wf-border-focus, #3b82f6)"
        : "var(--wf-border-default, #d1d5db)",
      backgroundColor: "var(--wf-background-base, white)",
      color: "var(--wf-text-default, black)",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : "var(--wf-border-focus, #3b82f6)",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--wf-background-base, white)",
      border: "1px solid var(--wf-border-default, #d1d5db)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--wf-background-accent, #3b82f6)"
        : state.isFocused
        ? "var(--wf-background-hover, #f3f4f6)"
        : "transparent",
      color: state.isSelected ? "white" : "var(--wf-text-default, black)",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "var(--wf-background-accent, #3b82f6)",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--wf-background-accent, #e0e7ff)",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--wf-text-default, #1e40af)",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--wf-text-default, #1e40af)",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "var(--wf-background-hover, #c7d2fe)",
        color: "#991b1b",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--wf-text-default, black)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--wf-text-muted, #9ca3af)",
    }),
    input: (base) => ({
      ...base,
      color: "var(--wf-text-default, black)",
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
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
