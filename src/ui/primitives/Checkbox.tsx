import React from 'react';
export const Checkbox = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input type="checkbox" className={`w-4 h-4 border border-[var(--wf-border)] ${className}`} {...props} />
);
