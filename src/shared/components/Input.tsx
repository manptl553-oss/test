import * as React from "react";

import { cn } from "../utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("wf-input", className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
