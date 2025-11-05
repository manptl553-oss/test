import * as React from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/libs";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  placeholder?: string;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectLabelProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectSeparatorProps {
  className?: string;
}

// Context to share state between components
const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      <Listbox value={value} onChange={onValueChange} disabled={disabled}>
        {children}
      </Listbox>
    </SelectContext.Provider>
  );
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return <span className="block truncate">{value || placeholder}</span>;
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ListboxButton
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>span]:line-clamp-1",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
      </ListboxButton>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";  

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children }, ref) => {
    return (
      <Transition
        as={React.Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <ListboxOptions
          ref={ref}
          className={cn(
            "absolute z-50 mt-1 max-h-96 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
            "focus:outline-none",
            className
          )}
        >
          <div className="p-1">{children}</div>
        </ListboxOptions>
      </Transition>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    return (
      <ListboxOption
        value={value}
        disabled={disabled}
        className={({ focus, selected }) =>
          cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
            focus && "bg-accent text-accent-foreground",
            selected && "font-medium",
            disabled && "pointer-events-none opacity-50",
            className
          )
        }
        {...props}
      >
        {({ selected }) => (
          <>
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              {selected && <Check className="h-4 w-4" />}
            </span>
            <span className="block truncate">{children}</span>
          </>
        )}
      </ListboxOption>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props}
      />
    );
  }
);
SelectSeparator.displayName = "SelectSeparator";

// Group component for organizing options
const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};