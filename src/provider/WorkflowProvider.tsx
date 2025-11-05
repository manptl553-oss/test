import { ApiConfig } from "@/api/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useContext, useMemo } from "react";
import { mergeTheme, WorkflowTheme } from "../theme";

type WorkflowContextValue = {
  theme: WorkflowTheme;
  api:ApiConfig
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

const queryClient = new QueryClient(); // ✅ Prevent re-creation on every render

export function WorkflowProvider({
  children,
  theme,
  api
}: {
  children: React.ReactNode;
  api:ApiConfig;
  theme?: Partial<WorkflowTheme>;
}) {
  const mergedTheme = useMemo(() => mergeTheme(theme), [theme]); // ✅ Memoized

  return (
    <QueryClientProvider client={queryClient}>
      <WorkflowContext.Provider value={{ theme: mergedTheme, api }}>
        {children}
      </WorkflowContext.Provider>
    </QueryClientProvider>
  );
}

export function useWorkflowContext() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error("useWorkflowContext must be used inside <WorkflowProvider />");
  }
  return ctx;
}
