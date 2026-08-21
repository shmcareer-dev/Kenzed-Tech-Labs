"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

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
  // Always start light so server and client hydration match.
  const [theme, setTheme] = useState<Theme>("light");

  // Read the saved theme once after mount; then keep the DOM in sync.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("kz-theme") : null;
    const initial: Theme = saved === "dark" ? "dark" : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    document.documentElement.setAttribute("data-kz-theme", initial);
    document.body.style.background = initial === "dark" ? "#070a12" : "#f4f5f8";
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-kz-theme", theme);
    document.body.style.background = theme === "dark" ? "#070a12" : "#f4f5f8";
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("kz-theme", next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <KzThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </KzThemeContext.Provider>
  );
}
