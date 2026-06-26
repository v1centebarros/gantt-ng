import type { Bar, Theme } from "../../types";
import { LIGHT_THEME } from "./builtins";

/** Look up a theme by id, falling back to the document theme then a builtin. */
export function resolveTheme(
  themeId: string | undefined,
  themes: Theme[],
  fallback?: Theme,
): Theme {
  if (themeId) {
    const found = themes.find((t) => t.id === themeId);
    if (found) return found;
  }
  return fallback ?? themes[0] ?? LIGHT_THEME;
}

/**
 * Resolve a color value to a concrete color. Supports palette tokens
 * ("palette.blue"), explicit color strings ("#abc", "rgb(...)"), and a caller
 * fallback when unset.
 */
export function resolveColor(
  color: string | undefined,
  theme: Theme,
  fallback?: string,
): string {
  if (!color)
    return fallback ?? theme.colors.palette.blue ?? theme.colors.accent;
  if (color.startsWith("palette.")) {
    const key = color.slice("palette.".length);
    return theme.colors.palette[key] ?? theme.colors.accent;
  }
  return color;
}

/** Resolve a bar's fill to a concrete color, defaulting to the palette blue. */
export function resolveBarColor(bar: Bar, theme: Theme): string {
  return resolveColor(bar.color, theme);
}
