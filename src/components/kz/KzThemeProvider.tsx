"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "kz-theme";

/** Dark is the product default; globals.css resolves an unstamped :root to it. */
const DEFAULT_THEME: Theme = "dark";

/**
 * Blocking bootstrap. It is the first node this provider renders, so the parser
 * runs it before any painted markup below it exists — a stored "light"
 * preference is stamped on <html> ahead of the first paint instead of flashing
 * dark first. The default needs no help from it: the attribute-less stylesheet
 * is already the dark palette. The string is a constant, so the server and
 * client markup are byte-identical and hydration stays quiet.
 */
const BOOTSTRAP = `try{var t=localStorage.getItem("${STORAGE_KEY}");document.documentElement.setAttribute("data-kz-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-kz-theme","dark")}`;

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return DEFAULT_THEME;
  }
}

interface KzThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const KzThemeContext = createContext<KzThemeContextValue | undefined>(undefined);

export function useKzTheme() {
  const ctx = useContext(KzThemeContext);
  if (!ctx) {
    throw new Error("useKzTheme must be used within KzThemeProvider");
  }
  return ctx;
}

interface KzThemeProviderProps {
  children: React.ReactNode;
}

export function KzThemeProvider({ children }: KzThemeProviderProps) {
  // Matches what the server rendered and what the bootstrap stamps by default,
  // so hydration agrees; the stored value is adopted in the effect below.
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = readStoredTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored);
  }, []);

  // The attribute is already correct on first paint; this keeps it in step with
  // every later toggle. Body background comes from `body { background: var(--bg) }`.
  useEffect(() => {
    document.documentElement.setAttribute("data-kz-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private-mode storage failures must not break the toggle.
      }
      return next;
    });
  }, []);

  return (
    <KzThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
      {children}
    </KzThemeContext.Provider>
  );
}
