import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn, formatName } from "@/shared/utils";

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
      <div className="inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 SelectValue                                */
/* -------------------------------------------------------------------------- */

const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) => {
  const { value } = useSelectCtx();
  
  // If children provided, use that; otherwise show value or placeholder
  if (children) return <span className="block truncate">{children}</span>;
  
  return <span className="block truncate">{formatName(value ?? placeholder ?? "")}</span>;
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
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm",
          "border-(--wf-border-default) bg-(--wf-background-base) text-(--wf-text-default)",
          "focus:outline-none focus:ring-2 focus:ring-(--wf-border-focus) focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children || (
          <span className="truncate text-(--wf-text-muted)">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 text-(--wf-text-muted)" />
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
          else if (ref) (ref as any).current = node;
        }}
        className={cn(
          "absolute z-50 mt-1 max-h-96 min-w-32 overflow-auto rounded-md shadow-xl",
          "border-(--wf-border-default) bg-(--wf-background-base) text-(--wf-text-default)",
          "animate-in fade-in-0",
          className
        )}
      >
        {children}
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
          "relative flex w-full items-center select-none rounded-sm py-1.5 pl-8 pr-2 text-sm",
          "bg-(--wf-background-base) text-(--wf-text-default) cursor-pointer transition-colors",
          !disabled && "hover:bg-(--wf-background-subtle)",
          disabled && "pointer-events-none opacity-50",
          isSelected && "font-medium",
          className
        )}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4 text-(--wf-text-default)" />}
        </span>
        <span className="block truncate">{children}</span>
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
    <div
      ref={ref}
      className={cn(
        "py-1.5 pl-8 pr-2 text-sm font-semibold text-(--wf-text-default)",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
SelectLabel.displayName = "SelectLabel";

const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
SelectGroup.displayName = "SelectGroup";

const SelectSeparator = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("my-1 h-px bg-(--wf-border-default)", className)}
      {...props}
    />
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
