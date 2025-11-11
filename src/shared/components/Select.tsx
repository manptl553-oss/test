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
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 SelectValue                                */
/* -------------------------------------------------------------------------- */

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectCtx();
  return <span className="block truncate">{value || placeholder}</span>;
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
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children || <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronDown className="h-4 w-4 opacity-50" />
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
        className={cn(
          "absolute z-50 mt-1 max-h-96 min-w-32 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0",
          className
        )}
      >
        <div className="p-1">{children}</div>
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
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
          isSelected && "bg-accent text-accent-foreground font-medium",
          disabled && "pointer-events-none opacity-50",
          "hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
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
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-foreground", className)}
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
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
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
