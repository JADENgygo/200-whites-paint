export type Theme = "light" | "dark";

export function resolveInitialTheme(
  storedTheme: string | null,
  prefersDark: boolean,
  prefersLight: boolean,
): Theme {
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  if (prefersDark) return "dark";
  if (prefersLight) return "light";
  return "light";
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}
