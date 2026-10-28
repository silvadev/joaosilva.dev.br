export const palette = {
  yellow: "#ffff80",
  pink: "#ff80bf",
  purple: "#9580ff",
  red: "#ff9580",
  orange: "#ffca80",
  green: "#8aff80",
  cyan: "#80ffea",
} as const;

export type Accent = keyof typeof palette;
