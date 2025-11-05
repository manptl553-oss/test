import * as React from "react";
import { Dialog, Transition, Portal as HPortal, TransitionChild, DialogPanel } from "@headlessui/react";

import { cn } from "../libs";
import { buttonVariants } from "./Button";

// Context to share open state
type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};
const AlertDialogContext = React.createContext<Ctx | null>(null);
const useAlertDialogCtx = () => {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) throw new Error("AlertDialog components must be used within <AlertDialog>.");
  return ctx;
};

type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const AlertDialog = ({ open, defaultOpen, onOpenChange, children }: RootProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(!!defaultOpen);
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? !!open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolledOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  return (
    <AlertDialogContext.Provider value={{ open: actualOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialogCtx();
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
AlertDialogTrigger.displayName = "AlertDialogTrigger";

const AlertDialogPortal = ({ children }: { children?: React.ReactNode }) => {
  return <HPortal>{children}</HPortal>;
};
AlertDialogPortal.displayName = "AlertDialogPortal";

const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    const { open } = useAlertDialogCtx();
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
          className={cn("fixed inset-0 z-50 bg-black/80", className)}
          {...props}
        />
      </Transition>
    );
  }
);
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useAlertDialogCtx();
    return (
      <AlertDialogPortal>
        <Transition show={open} appear as={React.Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            open={open}
            onClose={() => setOpen(false)}
          >
            <AlertDialogOverlay />

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
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
                    className={cn(
                      "w-full max-w-lg rounded-lg bg-background p-6 shadow-lg",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      </AlertDialogPortal>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, ...props }, ref) => (
    <Dialog.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
  )
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <Dialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialogCtx();
    return (
      <button
        ref={ref}
        className={cn(buttonVariants(), className)}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  }
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialogCtx();
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  }
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
