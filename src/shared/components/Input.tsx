import * as React from "react";
import { cn } from "../utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-base md:text-sm",
          "bg-(--wf-background-subtle) text-(--wf-text-default)",
          "placeholder:text-(--wf-text-muted)",
          "border border-(--wf-border-default)",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
