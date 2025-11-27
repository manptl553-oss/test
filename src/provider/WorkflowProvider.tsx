import React, { createContext, useContext, useMemo } from "react";
import { CanvasConfig, mergeTheme, NodeConfig, WorkflowTheme } from "../theme";

// ✅ ADD: Export this type
export type WorkflowContextValue = {
  theme: WorkflowTheme;
  canvas?: CanvasConfig;
  node?: NodeConfig;
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({
  children,
  theme,
  canvas,
  node,
}: {
  children: React.ReactNode;
  theme: WorkflowTheme;
  canvas?: CanvasConfig;
  node?: NodeConfig;
}) {
  const mergedTheme = useMemo(() => mergeTheme(theme), [theme]);

  // ✅ ADD: Memoize value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ theme: mergedTheme, canvas, node }),
    [mergedTheme, canvas, node]
  );

  // ✅ ADD: Memoize cssVars calculation
  const cssVars = useMemo(() => {
    return Object.entries(mergedTheme.colors!).reduce(
      (acc: Record<string, string>, [category, colors]) => {
        Object.entries(colors).forEach(([key, value]) => {
          acc[`--wf-${category}-${key}`] = value;
        });
        return acc;
      },
      {}
    );
  }, [mergedTheme.colors]);

  return (
    <WorkflowContext.Provider value={value}>
      <div style={cssVars} id="workflow-portal-root">
        {children}
      </div>
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error(
      "useWorkflowContext must be used inside <WorkflowProvider />"
    );
  }
  return ctx;
}
