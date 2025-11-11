import React, { createContext, useContext, useMemo } from "react";
import {
  CanvasConfig,
  mergeTheme,
  NodeConfig,
  WorkflowTheme
} from "../theme";

type WorkflowContextValue = {
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
  const cssVars = Object.entries(mergedTheme.colors!).reduce(
    (acc: Record<string, string>, [category, colors]) => {
      Object.entries(colors).forEach(([key, value]) => {
        acc[`--wf-${category}-${key}`] = value;
      });

      return acc;
    },
    {}
  );
  return (
    <WorkflowContext.Provider value={{ theme: mergedTheme, canvas, node }}>
      <div style={cssVars}>{children}</div>
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
