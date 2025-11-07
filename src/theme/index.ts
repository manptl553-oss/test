import type { WorkFlowThemeContext, WorkflowTheme } from "./types";
export const DEFAULT_THEME: WorkflowTheme = {
  theme: "light",
  radius: 12,
  spacing: 8,
};
const DEFAULT_COLORS = {
  light: {
    brand: { primary: "#3b82f6", secondary: "#a78bfa" },
    text: { default: "#111827", muted: "#6b7280", inverted: "#ffffff" },
    background: { base: "#ffffff", subtle: "#f9fafb", highlight: "#f3f4f6" },
    border: { default: "#e5e7eb", focus: "#3b82f6", strong: "#cbd5e1" },
    feedback: {
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6",
    },
  },
  dark: {
    brand: { primary: "#60a5fa", secondary: "#c4b5fd" },
    text: { default: "#f3f4f6", muted: "#9ca3af", inverted: "#0b1220" },
    background: { base: "#0b1220", subtle: "#111827", highlight: "#1f2937" },
    border: { default: "#374151", focus: "#60a5fa", strong: "#4b5563" },
    feedback: {
      success: "#34d399",
      warning: "#fbbf24",
      danger: "#f87171",
      info: "#60a5fa",
    },
  },
};
export function mergeTheme(
  overrides: WorkFlowThemeContext | WorkflowTheme
): WorkFlowThemeContext {
  return {
    ...DEFAULT_THEME,
    ...overrides,
    colors: {
      ...(overrides?.theme !== "custom"
        ? DEFAULT_COLORS[overrides?.theme]
        : overrides.colors!),
    },
  };
}
export * from "./types";
