import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useTheme = (): Theme => {
  const _window = typeof window !== "undefined" ? window : null;
  const [theme, setTheme] = useState<Theme>(() => {
    // Check initial theme
    return _window?.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    // Create media query list
    const mediaQuery = _window?.matchMedia("(prefers-color-scheme: dark)");

    if (!mediaQuery) return;

    // Define the handler
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    // Add listener
    mediaQuery.addEventListener("change", handleThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  return theme;
};
