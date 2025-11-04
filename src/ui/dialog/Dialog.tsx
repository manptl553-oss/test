import React from 'react';
export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => onOpenChange(false)}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
export function DialogContent({ className = '', children, onOpenAutoFocus }: any) {
  return <div className={`bg-white rounded-xl p-4 min-w-[640px] ${className}`}>{children}</div>;
}
export function DialogHeader({ className = '', children }: any) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}
export function DialogTitle({ className = '', children }: any) {
  return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}
