import React from 'react';
export const Button = ({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`px-3 py-2 rounded-md bg-[var(--wf-primary)] text-white ${className}`} {...props} />
);
