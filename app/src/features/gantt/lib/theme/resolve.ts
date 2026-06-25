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
 * Resolve a bar's fill to a concrete color. Supports palette tokens
 * ("palette.blue"), explicit color strings ("#abc", "rgb(...)"), and a sensible
 * default when unset.
 */
export function resolveBarColor(bar: Bar, theme: Theme): string {
  const { color } = bar;
  if (!color) return theme.colors.palette.blue ?? theme.colors.accent;
  if (color.startsWith("palette.")) {
    const key = color.slice("palette.".length);
    return theme.colors.palette[key] ?? theme.colors.accent;
  }
  return color;
}
