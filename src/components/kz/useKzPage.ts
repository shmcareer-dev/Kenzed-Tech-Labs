"use client";

import { useEffect } from "react";

import { useKz3D, type KzPage } from "./Kz3DProvider";

export function useKzPage(page: KzPage) {
  const { ref } = useKz3D();

  useEffect(() => {
    ref.current?.morphTo(page);
  }, [page, ref]);
}
