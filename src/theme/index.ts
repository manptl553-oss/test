import type { WorkflowTheme } from './types';
export const defaultTheme: WorkflowTheme = {
  radius: 12,
  spacing: 8,
  colors: {
    primary: '#4F46E5',
    textPrimary: '#0B1220',
    surface: '#FFFFFF',
    surfaceAlt: '#F9FAFB',
    border: '#E5E7EB',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B'
  }
};
export function mergeTheme(overrides?: Partial<WorkflowTheme>): WorkflowTheme {
  return { ...defaultTheme, ...overrides, colors: { ...defaultTheme.colors, ...(overrides?.colors || {}) } };
}
export * from './types';
