import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors ring-offset-(--wf-background-base) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--wf-border-focus) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-(--wf-brand-primary) text-(--wf-text-inverted) hover:bg-(--wf-brand-secondary)",

        //need to look
        destructive:
          "bg-(--wf-danger) text-(--wf-text-inverted) hover:bg-(--wf-danger-hover) border-(--wf-danger)",

        outline:
          "border border-(--wf-border-default) bg-transparent text-(--wf-text-default) hover:bg-(--wf-background-subtle)",

        secondary:
          "bg-(--wf-background-subtle) text-(--wf-text-default) hover:bg-(--wf-background-highlight)",

        ghost: "text-(--wf-text-default) hover:bg-(--wf-background-subtle)",

        link: "underline text-(--wf-brand-primary) hover:text-(--wf-brand-secondary)",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
