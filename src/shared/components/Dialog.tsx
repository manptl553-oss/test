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
    // In modal mode, prevent any propagation
    if (isModal) {
      e.stopPropagation();
    }
    onClick?.(e);
    // Only close on overlay click if not in modal mode
    if (!e.defaultPrevented && !isModal) {
      setOpen(false);
    }
  };

  return open ? (
    <div
      ref={ref}
      onClick={handleClick}
      data-state={open ? "open" : "closed"}
      className={cn("wf-dialog-overlay", className)}
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
      <div className="wf-dialog-wrapper">
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
          className={cn("wf-dialog-shell", className)}
          {...props}
        >
          {children}

          {!isModal && (
            <DialogClose className="wf-dialog-close">
              <X className="wf-icon-sm" />
              {/* <span className="sr-only">Close</span> */}
            </DialogClose>
          )}
        </div>
      </div>
    </>
  );

  const portalRoot = document.getElementById("my_workflow");
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
  <div className={cn("wf-dialog-header", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("wf-dialog-footer", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

/* ---------------------------------------------
 * Title & Description
 * --------------------------------------------- */
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("wf-dialog-title", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("wf-dialog-description", className)} {...props} />
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
