import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";

/* ---------------------------------------------
 * Context
 * --------------------------------------------- */
type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const DialogCtx = React.createContext<Ctx | null>(null);

const useDialogCtx = () => {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>.");
  return ctx;
};

/* ---------------------------------------------
 * Root (controlled/uncontrolled)
 * --------------------------------------------- */
type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const Dialog = ({ open, defaultOpen, onOpenChange, children }: RootProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(!!defaultOpen);
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? !!open : uncontrolledOpen;

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolledOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  return <DialogCtx.Provider value={{ open: actualOpen, setOpen }}>{children}</DialogCtx.Provider>;
};

/* ---------------------------------------------
 * Trigger
 * --------------------------------------------- */
const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const { setOpen } = useDialogCtx();
    return (
      <button
        ref={ref}
        type="button"
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

/* ---------------------------------------------
 * Overlay
 * --------------------------------------------- */
const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open } = useDialogCtx();
    return open ? (
      <div
        ref={ref}
        data-state={open ? "open" : "closed"}
        className={cn(
          "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm opacity-100 transition-opacity duration-200 animate-in fade-in-0",
          className
        )}
        {...props}
      />
    ) : null;
  }
);
DialogOverlay.displayName = "DialogOverlay";

/* ---------------------------------------------
 * Content (includes animation + ESC + click-outside)
 * --------------------------------------------- */
const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useDialogCtx();
    const dialogRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      if (open) document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, setOpen]);

    // Close on outside click
    useEffect(() => {
      const onClickOutside = (e: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <DialogOverlay />
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          data-state={open ? "open" : "closed"}
          className={cn(
            "relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg transition-all duration-200",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          {children}

          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

/* ---------------------------------------------
 * Close button
 * --------------------------------------------- */
const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const { setOpen } = useDialogCtx();
    return (
      <button
        ref={ref}
        type="button"
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

/* ---------------------------------------------
 * Layout helpers
 * --------------------------------------------- */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

/* ---------------------------------------------
 * Title & Description
 * --------------------------------------------- */
const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
DialogDescription.displayName = "DialogDescription";

/* ---------------------------------------------
 * Exports
 * --------------------------------------------- */
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
