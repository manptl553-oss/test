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
        className={cn("wf-checkbox", className)}
      >
        {current && <Check className="wf-checkbox-icon" />}

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
