import { Transition } from "@headlessui/react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import React, { createContext, useCallback, useContext, useState } from "react";
import { cn } from "../libs";

// Toast type definition
type ToastType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  open?: boolean;
};

// Context for managing toasts
type ToastContextType = {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id" | "open">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

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

      // Auto dismiss
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
    );
    // Remove from array after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
};

// Toast Viewport - renders all toasts
export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { toasts } = useToast();

  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm",
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

// Toast variants
const toastVariants = cva(
  "group relative flex w-full items-center justify-between rounded-md border p-4 shadow-md transition-all",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-gray-900",
        destructive: "bg-red-50 border-red-300 text-red-900",
        success: "bg-green-50 border-green-500 text-primary",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

// Toast component
type ToastProps = ToastType & React.HTMLAttributes<HTMLDivElement>;

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    { id, title, description, variant, open, className, children, ...props },
    ref
  ) => {
    const { removeToast } = useToast();

    return (
      <Transition
        show={open}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-x-full"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-full"
      >
        <div
          ref={ref}
          className={cn(toastVariants({ variant }), className)}
          {...props}
        >
          <div className="flex-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            {children}
          </div>
          <ToastClose onClick={() => removeToast(id)} />
        </div>
      </Transition>
    );
  }
);
Toast.displayName = "Toast";

// Toast Title
export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

// Toast Description
export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-600 mt-1", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

// Toast Close
export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "rounded-md p-1 text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

// Helper hook for easier usage
export const toast = {
  success: (title: string, description?: string) => {
    // This will be called via the context
    return { title, description, variant: "success" as const };
  },
  error: (title: string, description?: string) => {
    return { title, description, variant: "destructive" as const };
  },
  default: (title: string, description?: string) => {
    return { title, description, variant: "default" as const };
  },
};
