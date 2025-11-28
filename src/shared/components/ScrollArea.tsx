import * as React from "react";
import { cn } from "../utils";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Extra classes for the scrollable viewport */
  viewportClassName?: string;
};

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, viewportClassName, children, ...props }, ref) => (
    <div ref={ref} className={cn("wf-scroll-area", className)} {...props}>
      <div
        className={cn("wf-scroll-viewport", viewportClassName)}
      >
        {children}
      </div>
      {/* Keep the API parity: ScrollBar is now optional/no-op, native bar is used */}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

/**
 * Kept for API compatibility with Radix usage.
 * With native scrollbars, this component does not need to render anything.
 * You can still pass className/orientation props without breaking calls.
 */
type ScrollBarProps = {
  orientation?: "vertical" | "horizontal";
  className?: string;
};
const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  (_props, _ref) => null
);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
