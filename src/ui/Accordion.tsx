import * as React from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../libs/index";

// Root wrapper (structural; Headless UI doesn't have an Accordion root)
const Accordion = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
Accordion.displayName = "Accordion";

// Each item provides a Disclosure context
const AccordionItem = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <Disclosure>
    {() => (
      <div ref={ref} className={cn("border-b", className)} {...props}>
        {children}
      </div>
    )}
  </Disclosure>
));
AccordionItem.displayName = "AccordionItem";

// Trigger mapped to Disclosure.Button
const AccordionTrigger = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ className, children, ...props }, ref) => (
  <DisclosureButton
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline",
      "[&[data-headlessui-state='open']>svg]:rotate-180",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
  </DisclosureButton>
));
AccordionTrigger.displayName = "AccordionTrigger";

// Content mapped to Disclosure.Panel
const AccordionContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <DisclosurePanel
    static={false}
    as="div"
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </DisclosurePanel>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
