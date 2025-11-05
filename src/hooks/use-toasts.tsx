import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "@/ui";
import * as React from "react";

type ToastMessage = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

type ToastContextType = {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Toaster />");
  return ctx;
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = React.useCallback((toast: Omit<ToastMessage, "id">) => {
    const id =
      window.crypto?.randomUUID?.() ??
      Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000
    );
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      <ToastProvider>
        {children}
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} variant={t.variant}>
            <div className="grid gap-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              {t.description && (
                <ToastDescription>{t.description}</ToastDescription>
              )}
            </div>
            <ToastClose onClick={() => dismissToast(t.id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
