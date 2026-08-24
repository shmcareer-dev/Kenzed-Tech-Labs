"use client";

/**
 * The split point for the WebGL background.
 *
 * three.js is by far the heaviest thing this site ships (~600KB raw), and the
 * scene is a decorative, `position: fixed`, `aria-hidden` canvas behind the
 * content — it is never the LCP element and it can never shift layout. Loading
 * it with the page would put the whole renderer on the critical path of every
 * route for a layer the visitor is not reading.
 *
 * `ssr: false` because the scene builds itself against a real canvas and a real
 * matchMedia; there is nothing meaningful to prerender. Kz3DBackground reads the
 * route from usePathname() and morphs on mount, so arriving late costs it
 * nothing — it lands on the correct camera shot for whatever page it mounts on.
 */

import dynamic from "next/dynamic";

export const Kz3DBackgroundDeferred = dynamic(
  () => import("./Kz3DBackground").then((mod) => mod.Kz3DBackground),
  { ssr: false }
);
