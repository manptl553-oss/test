import React, { useState, forwardRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils/index";

// Root wrapper
const Accordion = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  )
);
Accordion.displayName = "Accordion";

// Accordion Item
interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, defaultOpen = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return (
      <div ref={ref} className={cn("wf-accordion-item", className)} {...props}>
        {/* Passing context manually */}
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            toggle,
          });
        })}
      </div>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

// Accordion Trigger
interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  toggle?: () => void;
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, isOpen, toggle, ...props }, ref) => (
    <button
      ref={ref}
      onClick={toggle}
      className={cn(
        "wf-accordion-trigger",
        isOpen && "wf-accordion-trigger--open",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "wf-accordion-icon",
          isOpen && "wf-accordion-icon--open"
        )}
      />
    </button>
  )
);
AccordionTrigger.displayName = "AccordionTrigger";

// Accordion Content
interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, isOpen, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "wf-accordion-content",
        isOpen && "wf-accordion-content--open",
        className
      )}
      {...props}
    >
      <div className="wf-accordion-content-inner">{children}</div>
    </div>
  )
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
