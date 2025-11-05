import * as React from "react";
import {
  Dialog as HDialog,
  DialogPanel,
  DialogTitle as HDialogTitle,
  Transition,
  Portal as HPortal,
} from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/libs";

/** -------------------------
 * Internal context for open state
 * ------------------------ */
type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const DialogCtx = React.createContext<Ctx | null>(null);
const useDialogCtx = () => {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>.");
  return ctx;
};

/** -------------------------
 * Root (controlled/uncontrolled, Radix-like)
 * ------------------------ */
type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};
const Dialog = ({ open, defaultOpen, onOpenChange, children }: RootProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? !!open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolledOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  return <DialogCtx.Provider value={{ open: actualOpen, setOpen }}>{children}</DialogCtx.Provider>;
};

/** -------------------------
 * Trigger (opens)
 * ------------------------ */
const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ onClick, ...props }, ref) => {
    const { setOpen } = useDialogCtx();
    return (
      <button
        ref={ref}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(true);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

/** -------------------------
 * Portal (API parity)
 * ------------------------ */
const DialogPortal = ({ children }: { children?: React.ReactNode }) => <HPortal>{children}</HPortal>;
DialogPortal.displayName = "DialogPortal";

/** -------------------------
 * Overlay
 * ------------------------ */
const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    const { open } = useDialogCtx();
    return (
      <Transition
        show={open}
        appear
        as={React.Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          className={cn(
            "fixed inset-0 z-50 bg-black/80",
            // keep your Radix-like data-state utilities if you have them configured:
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
          )}
          {...props}
        />
      </Transition>
    );
  }
);
DialogOverlay.displayName = "DialogOverlay";

/** -------------------------
 * Content (Dialog + Panel) + built-in Caret-close button parity
 * ------------------------ */
const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useDialogCtx();

    return (
      <DialogPortal>
        <Transition show={open} appear as={React.Fragment}>
          <HDialog as="div" className="relative z-50" open={open} onClose={() => setOpen(false)}>
            <DialogOverlay />

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel
                    ref={ref}
                    data-state={open ? "open" : "closed"}
                    className={cn(
                      "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg transition-all duration-200",
                      // keep your Radix data-state class hooks:
                      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                      className
                    )}
                    {...props}
                  >
                    {children}
                    {/* Inline close button (like Radix Close in Content) */}
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                  </DialogPanel>
                </Transition.Child>
              </div>
            </div>
          </HDialog>
        </Transition>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = "DialogContent";

/** -------------------------
 * Close (closes)
 * ------------------------ */
const DialogClose = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ onClick, ...props }, ref) => {
    const { setOpen } = useDialogCtx();
    return (
      <button
        ref={ref}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  }
);
DialogClose.displayName = "DialogClose";

/** -------------------------
 * Layout helpers
 * ------------------------ */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

/** -------------------------
 * Title / Description
 * ------------------------ */
const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, ...props }, ref) => (
    <HDialogTitle ref={ref} as="h2" className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";


export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
