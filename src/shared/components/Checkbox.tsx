import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "checked"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, checked, defaultChecked, onCheckedChange, disabled, ...props },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      !!defaultChecked
    );
    const isControlled = checked !== undefined;
    const current = isControlled ? checked : internalChecked;

    const toggle = () => {
      const next = !current;
      if (!isControlled) setInternalChecked(next);
      onCheckedChange?.(next);
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={current}
        disabled={disabled}
        data-state={current ? "checked" : "unchecked"}
        onClick={toggle}
        className={cn(
          // Base styles
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors",
          "border border-(--wf-border-default) bg-(--wf-background-subtle) text-(--wf-text-default)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--wf-border-focus) focus-visible:ring-offset-2 ring-offset-(--wf-background-base)",
          "disabled:cursor-not-allowed disabled:opacity-50",

          // Checked state
          current &&
            "bg-(--wf-brand-primary) border-(--wf-brand-primary) text-(--wf-text-inverted)",

          className
        )}
      >
        {current && <Check className="h-3.5 w-3.5 text-current" />}

        <input
          ref={ref}
          type="checkbox"
          checked={current}
          disabled={disabled}
          hidden
          {...props}
        />
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
