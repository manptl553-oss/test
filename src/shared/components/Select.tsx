import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";

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
