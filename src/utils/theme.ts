export type AppTheme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";
const THEME_USER_PREFERENCE_KEY = "theme-user-preference";

export const getInitialTheme = (): AppTheme => {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  const hasUserPreference = window.localStorage.getItem(THEME_USER_PREFERENCE_KEY) === "true";

  return stored === "dark" && hasUserPreference ? "dark" : "light";
};

export const applyTheme = (theme: AppTheme) => {
  if (typeof window === "undefined") return;

  const root = window.document.documentElement;
  root.classList.remove("light", "dark", "midnight", "forest", "sunset");
  root.classList.add(theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const saveThemePreference = (theme: AppTheme) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(THEME_USER_PREFERENCE_KEY, "true");
  applyTheme(theme);
};
