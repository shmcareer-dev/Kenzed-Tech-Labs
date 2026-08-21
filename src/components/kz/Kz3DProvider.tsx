"use client";

import { createContext, useContext, useRef } from "react";

export type KzPage =
  | "home"
  | "services"
  | "technology"
  | "infrastructure"
  | "process"
  | "about"
  | "contact";

export interface Kz3DHandle {
  morphTo: (page: KzPage) => void;
}

interface Kz3DContextValue {
  ref: React.MutableRefObject<Kz3DHandle | null>;
}

const Kz3DContext = createContext<Kz3DContextValue | undefined>(undefined);

export function useKz3D() {
  const ctx = useContext(Kz3DContext);
  if (!ctx) {
    throw new Error("useKz3D must be used within Kz3DProvider");
  }
  return ctx;
}

interface Kz3DProviderProps {
  children: React.ReactNode;
}

export function Kz3DProvider({ children }: Kz3DProviderProps) {
  const ref = useRef<Kz3DHandle | null>(null);
  return <Kz3DContext.Provider value={{ ref }}>{children}</Kz3DContext.Provider>;
}
