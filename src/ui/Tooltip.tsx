import * as React from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { cn } from "../libs/utils";

// Tooltip Provider - for global config (optional)
const TooltipContext = React.createContext<{
  delayDuration?: number;
  skipDelayDuration?: number;
}>({
  delayDuration: 200,
  skipDelayDuration: 300,
});

export const TooltipProvider = ({
  children,
  delayDuration = 200,
  skipDelayDuration = 300,
}: {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}) => {
  return (
    <TooltipContext.Provider value={{ delayDuration, skipDelayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Tooltip Root
type TooltipProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
};

export const Tooltip = ({
  children,
  open,
  onOpenChange,
  delayDuration,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutRef = React.useRef<number>();
  const context = React.useContext(TooltipContext);
  const delay = delayDuration ?? context.delayDuration ?? 200;

  const controlled = open !== undefined;
  const currentOpen = controlled ? open : isOpen;

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (controlled) {
        onOpenChange?.(true);
      } else {
        setIsOpen(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (controlled) {
      onOpenChange?.(false);
    } else {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover>
      {({ open: popoverOpen }) => (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="inline-block"
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Pass down the open state
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen: currentOpen,
              });
            }
            return child;
          })}
        </div>
      )}
    </Popover>
  );
};

// Tooltip Trigger
type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  children: React.ReactNode;
  isOpen?: boolean;
};

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  TooltipTriggerProps
>(({ asChild = false, children, className, isOpen, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      className: cn(className, children.props.className),
      ...props,
    });
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

// Tooltip Content
type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  isOpen?: boolean;
};

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      side = "top",
      align = "center",
      isOpen,
      children,
      ...props
    },
    ref
  ) => {
    // Calculate position based on side
    const getPositionClasses = () => {
      const baseClasses = "absolute z-50";

      switch (side) {
        case "top":
          return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 mb-${sideOffset}`;
        case "bottom":
          return `${baseClasses} top-full left-1/2 -translate-x-1/2 mt-${sideOffset}`;
        case "left":
          return `${baseClasses} right-full top-1/2 -translate-y-1/2 mr-${sideOffset}`;
        case "right":
          return `${baseClasses} left-full top-1/2 -translate-y-1/2 ml-${sideOffset}`;
        default:
          return baseClasses;
      }
    };

    const getAnimationClasses = () => {
      switch (side) {
        case "top":
          return "data-[closed]:slide-out-to-bottom-2";
        case "bottom":
          return "data-[closed]:slide-out-to-top-2";
        case "left":
          return "data-[closed]:slide-out-to-right-2";
        case "right":
          return "data-[closed]:slide-out-to-left-2";
        default:
          return "";
      }
    };

    return (
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <PopoverPanel
          ref={ref}
          static
          className={cn(
            getPositionClasses(),
            "overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            getAnimationClasses(),
            className
          )}
          {...props}
        >
          {children}
        </PopoverPanel>
      </Transition>
    );
  }
);
TooltipContent.displayName = "TooltipContent";
