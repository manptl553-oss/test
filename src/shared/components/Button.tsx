import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const buttonVariants = cva(
  "wf-btn",
  {
    variants: {
      variant: {
        default: "wf-btn--default",
        destructive: "wf-btn--destructive",
        outline: "wf-btn--outline",
        secondary: "wf-btn--secondary",
        ghost: "wf-btn--ghost",
        link: "wf-btn--link",
      },
      size: {
        default: "wf-btn--size-default",
        sm: "wf-btn--size-sm",
        lg: "wf-btn--size-lg",
        icon: "wf-btn--size-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
