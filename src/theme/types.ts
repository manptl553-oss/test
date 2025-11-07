export type ColorScale = {
  /** Brand / accent colors */
  brand: {
    /** Main accent color for actions and highlights */
    primary: string;
    /** Secondary brand accent (tabs, subtle accents) */
    secondary: string;
  };

  /** Text colors */
  text: {
    /** Default body text color */
    default: string;
    /** Muted/secondary text */
    muted: string;
    /** Text that sits on dark/brand surfaces (e.g., on buttons) */
    inverted: string;
  };

  /** Background layers */
  background: {
    /** Base background (page/canvas) */
    base: string;
    /** Subtle surface (cards, sections) */
    subtle: string;
    /** Highlight surface (headers, callouts) */
    highlight: string;
  };

  /** Strokes & focus */
  border: {
    /** Default borders/dividers */
    default: string;
    /** Focus ring color */
    focus: string;
    /** Stronger borders (emphasis panes) */
    strong: string;
  };

  /** Feedback/semantic states */
  feedback: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
};

/**
 * Built-in theme modes the library understands.
 * - "light" and "dark" ship with sensible defaults.
 * - "custom" requires the consumer to provide a full color palette via `colors`.
 */
export type ThemeKind = "light" | "dark" | "custom";

/**
 * Common shape props shared by all themes.
 * These are semantic tokens consumed by components (via CSS variables).
 */
export type CommonTheme = {
  /**
   * Corner radius in pixels for cards, buttons, nodes, etc.
   * Example: 8 → `rounded-[var(--radius)]` resolves to 8px.
   */
  radius?: number;

  /**
   * Base spacing unit in pixels used for paddings/gaps where applicable.
   * Example: 12 → `p-[var(--spacing)]` resolves to 12px.
   */
  spacing?: number;
};

/**
 * Light/Dark theme selector.
 * Uses built-in color defaults; consumers may still override later at runtime.
 */
export type LightDarkTheme = CommonTheme & {
  /** Select the built-in theme variant. */
  theme: "light" | "dark";
};

/**
 * Custom theme: caller MUST provide a full color palette.
 * See `ColorScale` for required tokens and their intended use.
 */
export type CustomTheme = CommonTheme & {
  /** Select the custom theme mode. */
  theme: "custom";
  /**
   * Full color palette required for the custom theme.
   * All fields in `ColorScale` are required.
   */
  colors: ColorScale;
};

/**
 * Discriminated union for the theme config accepted by the provider.
 * - `light` / `dark`: no colors required; library will use defaults.
 * - `custom`: `colors` are required.
 */
export type WorkflowTheme = LightDarkTheme | CustomTheme;

/**
 * Theme shape exposed by the context/hooks to consumers.
 * Notes:
 * - `colors` may be present if the provider merges/normalizes defaults.
 * - Prefer to read tokens via CSS variables in components when possible.
 */
export type WorkFlowThemeContext = CommonTheme & {
  /** The active theme mode at runtime. */
  theme: ThemeKind;
  /**
   * The resolved color palette (if provided/merged).
   * May be undefined before initialization.
   */
  colors?: ColorScale;
};

/**
 * Generic width/height config used by canvas and nodes.
 * Accepts numbers (px) or strings (%, vw, etc.).
 *
 * Examples:
 * - `{ width: 1200, height: 800 }`
 * - `{ width: "100%", height: "calc(100vh - 90px)" }`
 */
export type SizeConfig<T = number | string> = {
  /** Width in px (number) or any CSS length (string). */
  width?: T;
  /** Height in px (number) or any CSS length (string). */
  height?: T;
};

/**
 * Canvas size configuration for the workflow editor viewport.
 * Typically controls the outer container that hosts React Flow.
 */
export type CanvasConfig = SizeConfig;

/**
 * Node size configuration for individual workflow nodes.
 * Used by custom node renderers or layout utilities.
 */
export type NodeConfig = SizeConfig;
