import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../utils";

/* -------------------------------------------------------------------------- */
/*                                Types & Context                             */
/* -------------------------------------------------------------------------- */

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  open?: boolean;
};

type ToastContextType = {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id" | "open">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

/* -------------------------------------------------------------------------- */
/*                                 Provider                                   */
/* -------------------------------------------------------------------------- */

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 5000,
    }: Omit<ToastType, "id" | "open">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastType = {
        id,
        title,
        description,
        variant,
        duration,
        open: true,
      };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Viewport                                    */
/* -------------------------------------------------------------------------- */

export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { toasts } = useToast();
  return (
    <div
      ref={ref}
      className={cn("wf-toast-viewport", className)}
      {...props}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
});
ToastViewport.displayName = "ToastViewport";

/* -------------------------------------------------------------------------- */
/*                                Toast Styles                                */
/* -------------------------------------------------------------------------- */

const toastVariants = cva(
  "wf-toast",
  {
    variants: {
      variant: {
        default: "wf-toast--default",
        destructive: "wf-toast--destructive",
        success: "wf-toast--success",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

/* -------------------------------------------------------------------------- */
/*                                Toast Component                             */
/* -------------------------------------------------------------------------- */

type ToastProps = ToastType & React.HTMLAttributes<HTMLDivElement>;

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant, open, className, ...props }, ref) => {
    const { removeToast } = useToast();
    const [visible, setVisible] = useState(open);

    // Handle open/close animation manually
    useEffect(() => {
      if (open) setVisible(true);
      else {
        const timer = setTimeout(() => setVisible(false), 200);
        return () => clearTimeout(timer);
      }
    }, [open]);

    if (!visible) return null;

    return (
      <div
        ref={ref}
        data-open={open}
        className={cn(
          toastVariants({ variant }),
          open ? "wf-toast--visible" : "wf-toast--hidden",
          className
        )}
        {...props}
      >
        <div className="wf-toast-body">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
        <ToastClose onClick={() => removeToast(id)} />
      </div>
    );
  }
);
Toast.displayName = "Toast";

/* -------------------------------------------------------------------------- */
/*                              Subcomponents                                 */
/* -------------------------------------------------------------------------- */

export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("wf-toast-title", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("wf-toast-desc", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn("wf-toast-close", className)}
    {...props}
  >
    <X className="wf-icon-sm" />
  </button>
));
ToastClose.displayName = "ToastClose";

/* -------------------------------------------------------------------------- */
/*                              Helper Methods                                */
/* -------------------------------------------------------------------------- */

export const toast = {
  success: (title: string, description?: string) => ({
    title,
    description,
    variant: "success" as const,
  }),
  error: (title: string, description?: string) => ({
    title,
    description,
    variant: "destructive" as const,
  }),
  default: (title: string, description?: string) => ({
    title,
    description,
    variant: "default" as const,
  }),
};
