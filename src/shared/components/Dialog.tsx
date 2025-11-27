import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";

/* ---------------------------------------------
 * Context
 * --------------------------------------------- */
type Ctx = { open: boolean; setOpen: (v: boolean) => void; isModal?: boolean };
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
  isModal?: boolean;
  children?: React.ReactNode;
};

const Dialog = ({
  open,
  defaultOpen,
  onOpenChange,
  isModal = false,
  children,
}: RootProps) => {
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

  return (
    <DialogCtx.Provider value={{ open: actualOpen, setOpen, isModal }}>
      {children}
    </DialogCtx.Provider>
  );
};

/* ---------------------------------------------
 * Trigger
 * --------------------------------------------- */
const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
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
});
DialogTrigger.displayName = "DialogTrigger";

/* ---------------------------------------------
 * Overlay
 * --------------------------------------------- */
const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen, isModal } = useDialogCtx();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    // Only close on overlay click if not in modal mode
    if (!e.defaultPrevented && !isModal) {
      setOpen(false);
    }
    // In modal mode, prevent any propagation
    if (isModal) {
      e.stopPropagation();
    }
  };

  return open ? (
    <div
      ref={ref}
      onClick={handleClick}
      data-state={open ? "open" : "closed"}
      className={cn(
        "fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm opacity-100 transition-opacity duration-200 animate-in fade-in-0",
        className
      )}
      {...props}
    />
  ) : null;
});
DialogOverlay.displayName = "DialogOverlay";

/* ---------------------------------------------
 * Content (with fixed race condition handling)
 * --------------------------------------------- */
const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen, isModal } = useDialogCtx();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isReadyForOutsideClick, setIsReadyForOutsideClick] = useState(false);

  // Reset ready state when dialog opens
  useEffect(() => {
    if (open) {
      setIsReadyForOutsideClick(false);
      // Small delay to prevent immediate closing from the same click that opened it
      const timer = setTimeout(() => {
        setIsReadyForOutsideClick(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsReadyForOutsideClick(false);
    }
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isModal) setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen, isModal]);

  // Close on outside click (with race condition protection)
  useEffect(() => {
    if (!open || !isReadyForOutsideClick || isModal) return;

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Only close if clicking outside the dialog content
      if (dialogRef.current && !dialogRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, isReadyForOutsideClick, setOpen, isModal]);

  if (!open) return null;

  // Render dialog using portal to escape ReactFlow's DOM hierarchy
  const dialogContent = (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 pointer-events-none">
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as React.MutableRefObject<HTMLDivElement | null>).current =
                node;
          }}
          onClick={(e) => {
            // Prevent clicks inside dialog from propagating to overlay
            e.stopPropagation();
          }}
          data-state={open ? "open" : "closed"}
          className={cn(
            "relative w-full max-w-lg rounded-lg border bg-white p-6 shadow-lg transition-all duration-200 pointer-events-auto",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          {children}

          {!isModal && (
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </div>
      </div>
    </>
  );

  const portalRoot = document.getElementById("workflow-portal-root");
  return createPortal(dialogContent, portalRoot!);
});
DialogContent.displayName = "DialogContent";

/* ---------------------------------------------
 * Close button
 * --------------------------------------------- */
const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
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
});
DialogClose.displayName = "DialogClose";

/* ---------------------------------------------
 * Layout helpers
 * --------------------------------------------- */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

/* ---------------------------------------------
 * Title & Description
 * --------------------------------------------- */
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
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
