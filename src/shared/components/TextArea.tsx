import * as React from "react";
import { cn } from "../utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // layout & sizing
          "flex min-h-20 w-full rounded-md px-3 py-2 text-sm",

          // theme tokens
          "border border-(--wf-border-default)",
          "bg-(--wf-background-subtle) text-(--wf-text-default)",
          "placeholder:text-(--wf-text-muted)",

          // disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",

          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
