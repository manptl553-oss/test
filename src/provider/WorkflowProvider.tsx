import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defaultTheme, mergeTheme, WorkflowTheme } from '../theme';
import { ApiConfig } from '../api/types';

type Ctx = { theme: WorkflowTheme; api: ApiConfig; };
const Ctx = createContext<Ctx | null>(null);

export function WorkflowProvider({ children, api, theme }: { children: React.ReactNode; api: ApiConfig; theme?: Partial<WorkflowTheme>; }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const mergedTheme = useMemo(() => mergeTheme(theme), [theme]);
  return (
    <QueryClientProvider client={queryClient}>
      <Ctx.Provider value={{ theme: mergedTheme, api }}>{children}</Ctx.Provider>
    </QueryClientProvider>
  );
}
export function useWorkflowContext() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWorkflowContext must be used inside <WorkflowProvider/>');
  return ctx;
}
