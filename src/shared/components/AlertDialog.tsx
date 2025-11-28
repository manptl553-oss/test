import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../utils";
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

// ---------- Root ----------
type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export const AlertDialog = ({ open, defaultOpen, onOpenChange, children }: RootProps) => {
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
    <AlertDialogContext.Provider value={{ open: actualOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

// ---------- Trigger ----------
export const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
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
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

// ---------- Overlay ----------
export const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open } = useAlertDialogCtx();
    return open ? (
      <div
        ref={ref}
        className={cn("wf-dialog-overlay", className)}
        {...props}
      />
    ) : null;
  }
);
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// ---------- Content ----------
export const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useAlertDialogCtx();
    const dialogRef = useRef<HTMLDivElement | null>(null);

    // close on ESC
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      if (open) document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, setOpen]);

    // close on outside click
    useEffect(() => {
      const onClick = (e: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", onClick);
      return () => document.removeEventListener("mousedown", onClick);
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div className="wf-dialog-wrapper">
        <AlertDialogOverlay />
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={cn("wf-dialog-shell", className)}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

// ---------- Header / Footer ----------
export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("wf-dialog-header", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("wf-dialog-footer", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

// ---------- Title / Description ----------
export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("wf-dialog-title", className)} {...props} />
  )
);
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("wf-dialog-description", className)} {...props} />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// ---------- Buttons ----------
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
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

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialogCtx();
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant: "outline" }), "wf-alert-cancel", className)}
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
