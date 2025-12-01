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
      { primary: "#7ec040", secondary: "#6dad35" },
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
  }),
  dark: (value) => ({
    brand: Object.assign(
      {
        primary: "#9ed566", // brand-accent on dark
        secondary: "#b8e986", // hover / secondary accent
      },
      value?.brand
    ),
    text: Object.assign(
      {
        default: "#f3f4f6", // main text
        muted: "#9ca3af", // secondary
        inverted: "#111827", // on brand surfaces
      },
      value?.text
    ),
    background: Object.assign(
      {
        base: "#0f172a", // darker than before for better depth
        subtle: "#1e293b", // card surfaces
        highlight: "#334155", // strong surfaces / headers
      },
      value?.background
    ),
    border: Object.assign(
      {
        default: "#475569", // typical separator
        focus: "#60a5fa", // good blue focus ring for dark
        strong: "#64748b", // more prominent structure
      },
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
