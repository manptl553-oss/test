import * as React from "react";
import { cn } from "../libs";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Extra classes for the scrollable viewport */
  viewportClassName?: string;
};

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, viewportClassName, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn(
          // Rounded container with native scrolling
          "h-full w-full rounded-[inherit] overflow-auto",
          // If you use tailwind-scrollbar plugin, these will style the bar
          "scrollbar-thin scrollbar-thumb-rounded-full",
          viewportClassName
        )}
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
