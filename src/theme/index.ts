import type { ColorScale, DeepPartial, WorkflowTheme } from "./types";
export const DEFAULT_THEME: WorkflowTheme = {
  theme: "light",
  radius: 12,
  spacing: 8,
};

const DEFAULT_COLORS: Record<
  string,
  (value?: DeepPartial<ColorScale>) => ColorScale
> = {
  light: (value) => ({
    brand: Object.assign(
      { primary: "#3b82f6", secondary: "#a78bfa" },
      value?.brand
    ),
    text: Object.assign(
      { default: "#111827", muted: "#6b7280", inverted: "#ffffff" },
      value?.text
    ),
    background: Object.assign(
      { base: "#ffffff", subtle: "#f9fafb", highlight: "#f3f4f6" },
      value?.background
    ),
    border: Object.assign(
      { default: "#e5e7eb", focus: "#3b82f6", strong: "#cbd5e1" },
      value?.border
    ),
    // feedback: {
    //   success: "#10b981",
    //   warning: "#f59e0b",
    //   danger: "#ef4444",
    //   info: "#3b82f6",
    // },
  }),
  dark: (value) => ({
    brand: Object.assign(
      { primary: "#60a5fa", secondary: "#c4b5fd" },
      value?.brand
    ),
    text: Object.assign(
      { default: "#f3f4f6", muted: "#9ca3af", inverted: "#0b1220" },
      value?.text
    ),
    background: Object.assign(
      { base: "#0b1220", subtle: "#111827", highlight: "#1f2937" },
      value?.background
    ),
    border: Object.assign(
      { default: "#374151", focus: "#60a5fa", strong: "#4b5563" },
      value?.border
    ),
    // feedback: {
    //   success: "#34d399",
    //   warning: "#fbbf24",
    //   danger: "#f87171",
    //   info: "#60a5fa",
    // },
  }),
};
export function mergeTheme(overrides: WorkflowTheme): WorkflowTheme {
  return {
    ...DEFAULT_THEME,
    ...overrides,
    colors: {
      ...(overrides?.theme !== "custom"
        ? DEFAULT_COLORS[overrides?.theme](overrides.colors)
        : overrides.colors),
    },
  };
}
export * from "./types";
