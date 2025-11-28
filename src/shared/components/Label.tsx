import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const labelVariants = cva("wf-label");

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label ref={ref} className={cn(labelVariants(), className)} {...props} />
    );
  }
);

Label.displayName = "Label";

export { Label };
