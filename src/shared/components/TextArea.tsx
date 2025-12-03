import * as React from "react";
<<<<<<< HEAD

import { cn } from "../utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
=======
import { cn } from "../utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
//   ({ className, ...props }, ref) => {
//     return (
//       <textarea
//         ref={ref}
//         className={cn(
//           // layout & sizing
//           "flex min-h-20 w-full rounded-md px-3 py-2 text-sm",

//           // theme tokens
//           "border border-(--wf-border-default)",
//           "bg-(--wf-background-subtle) text-(--wf-text-default)",
//           "placeholder:text-(--wf-text-muted)",

//           // disabled state
//           "disabled:cursor-not-allowed disabled:opacity-50",

//           className
//         )}
//         {...props}
//       />
//     );
//   }
// );
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea className={cn("wf-textarea", className)} ref={ref} {...props} />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
