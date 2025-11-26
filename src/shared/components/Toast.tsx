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
      className={cn(
        "fixed bottom-0 right-0 z-100 flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm",
        className
      )}
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
  "group relative flex w-full items-center justify-between rounded-md border p-4 shadow-md transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-gray-900",
        destructive: "bg-red-50 border-red-300 text-red-900",
        success: "bg-green-50 border-green-500 text-green-800",
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
          open
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full",
          "transform transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      >
        <div className="flex-1">
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
  <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-1 text-sm text-gray-600", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "rounded-md p-1 text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-0 focus:ring-gray-400",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
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
