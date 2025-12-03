<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";
=======
import React, { JSX } from 'react';
import ReactSelect, {
  Props as ReactSelectProps,
  StylesConfig,
  GroupBase,
} from 'react-select';
import { formatName } from '@/shared/utils';
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

/* -------------------------------------------------------------------------- */
/*                               Context Setup                                */
/* -------------------------------------------------------------------------- */

interface SelectContextType {
  value?: string;
  setValue?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}

<<<<<<< HEAD
const SelectContext = React.createContext<SelectContextType | null>(null);
const useSelectCtx = () => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within <Select>.");
  return ctx;
};

/* -------------------------------------------------------------------------- */
/*                                   Root                                     */
/* -------------------------------------------------------------------------- */

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}
=======
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
    placeholder = 'Select',
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
      if (!value || typeof value !== 'string') return null;
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
        newValue && !Array.isArray(newValue) ? newValue.value : '';
      (onValueChange as (value: string) => void)(singleValue);
    }
  };

  // Custom styles
  const customStyles: StylesConfig<Option, boolean, GroupBase<Option>> = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderRadius: '8px',
      backgroundColor: 'var(--wf-background-subtle, #111827)',
      borderColor: state.isFocused
        ? 'var(--wf-border-focus, #84cc16)'
        : error
        ? 'var(--wf-feedback-danger-bg, #ef4444)'
        : 'var(--wf-border-default, #374151)',
      color: 'var(--wf-text-default, #f9fafb)',
      boxShadow: state.isFocused
        ? '0 0 0 2px var(--wf-border-focus, rgba(132,204,22,0.4))'
        : 'none',
      '&:hover': {
        borderColor: state.isFocused
          ? 'var(--wf-border-focus, #84cc16)'
          : 'var(--wf-border-default, #4b5563)',
      },
    }),

    menu: (base) => ({
      ...base,
      marginTop: '4px',
      backgroundColor: 'var(--wf-background-subtle, #1f2937)',
      borderRadius: '8px',
      border: '1px solid var(--wf-border-default, #374151)',
      boxShadow: '0 12px 25px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(6px)',
      overflow: 'hidden',
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 999999,
    }),

    option: (base, state) => ({
      ...base,
      padding: '8px 12px',
      fontSize: '0.875rem',
      borderRadius: '0',
      backgroundColor: state.isSelected
        ? 'var(--wf-brand-primary, #7ec040)'
        : state.isFocused
        ? 'var(--wf-background-hover, #374151)'
        : 'transparent',
      color: state.isSelected
        ? 'var(--wf-text-inverted, #ffffff)'
        : 'var(--wf-text-default, #f9fafb)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--wf-brand-primary, #7ec040)',
        color: 'var(--wf-text-inverted, #ffffff)',
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: 'var(--wf-text-default, #f9fafb)',
    }),

    placeholder: (base) => ({
      ...base,
      color: 'var(--wf-text-muted, #9ca3af)',
    }),

    input: (base) => ({
      ...base,
      color: 'var(--wf-text-default, #f9fafb)',
    }),

    multiValue: (base) => ({
      ...base,
      background: 'var(--wf-background-highlight, rgba(255,255,255,0.1))',
      borderRadius: '6px',
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--wf-text-default, #e5e7eb)',
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--wf-text-muted, #9ca3af)',
      '&:hover': {
        background: 'var(--wf-feedback-danger-bg, #ef4444)',
        color: 'white',
      },
    }),
  };
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

const Select = ({ value, defaultValue, onValueChange, disabled, children }: SelectProps) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const actualValue = isControlled ? value : uncontrolledValue;
  const [open, setOpen] = useState(false);

  const setValue = useCallback(
    (val: string) => {
      if (!isControlled) setUncontrolledValue(val);
      onValueChange?.(val);
      setOpen(false);
    },
    [isControlled, onValueChange]
  );

  return (
<<<<<<< HEAD
    <SelectContext.Provider value={{ value: actualValue, setValue, open, setOpen, disabled }}>
      <div className="wf-select">{children}</div>
    </SelectContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 SelectValue                                */
/* -------------------------------------------------------------------------- */

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectCtx();
  return <span className="wf-select-value">{value || placeholder}</span>;
};

/* -------------------------------------------------------------------------- */
/*                                SelectTrigger                               */
/* -------------------------------------------------------------------------- */

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    const { open, setOpen, disabled } = useSelectCtx();
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
        className={cn("wf-select-trigger", className)}
        {...props}
      >
        {children || <span className="wf-select-placeholder">{placeholder}</span>}
        <ChevronDown className="wf-select-icon" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

/* -------------------------------------------------------------------------- */
/*                                SelectContent                               */
/* -------------------------------------------------------------------------- */

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children }, ref) => {
    const { open, setOpen } = useSelectCtx();
    const contentRef = useRef<HTMLDivElement | null>(null);

    // Close on outside click
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("wf-select-content", className)}
      >
        <div className="wf-select-list">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

/* -------------------------------------------------------------------------- */
/*                                  SelectItem                                */
/* -------------------------------------------------------------------------- */

interface SelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, disabled, className, children }, ref) => {
    const { value: selectedValue, setValue } = useSelectCtx();
    const isSelected = selectedValue === value;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        tabIndex={0}
        onClick={() => !disabled && setValue?.(value)}
        className={cn(
          "wf-select-item",
          isSelected && "wf-select-item--selected",
          disabled && "wf-select-item--disabled",
          className
        )}
      >
        <span className="wf-select-check">
          {isSelected && <Check className="wf-icon-sm" />}
        </span>
        <span className="wf-select-value">{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

/* -------------------------------------------------------------------------- */
/*                              Label, Group, Separator                       */
/* -------------------------------------------------------------------------- */

const SelectLabel = React.forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("wf-select-label", className)} {...props}>
      {children}
    </div>
  )
);
SelectLabel.displayName = "SelectLabel";

const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
SelectGroup.displayName = "SelectGroup";

const SelectSeparator = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wf-select-separator", className)} {...props} />
  )
);
SelectSeparator.displayName = "SelectSeparator";

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
};
=======
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
        menuPortalTarget={document.getElementById('my_workflow')}
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
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
