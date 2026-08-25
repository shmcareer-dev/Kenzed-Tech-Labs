"use client";

/**
 * Damped scrolling for the whole document, and the single clock that drives it.
 *
 * Lenis owns the wheel; GSAP's ticker owns the frame. Running Lenis on its own
 * internal rAF alongside GSAP's would mean two loops per frame and a one-frame
 * lag between the scroll position and every ScrollTrigger reading it — the
 * classic "the parallax is a frame behind the page" artefact. So `autoRaf` is
 * off, `gsap.ticker` calls `lenis.raf()`, and Lenis's own scroll event pushes
 * ScrollTrigger. One loop, one order, no drift.
 */

import { useEffect } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { KZ_REDUCED_MOTION_QUERY } from "./KzScrollFx";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface KzSmoothScrollProps {
  children?: ReactNode;
  /**
   * Lenis interpolation strength, 0..1. Lower is heavier. 0.11 lands a wheel
   * notch in roughly 350ms, inside the 200-800ms window.
   */
  lerp?: number;
  /** Wheel gain. Leave at 1 unless a trackpad audit says otherwise. */
  wheelMultiplier?: number;
}

/**
 * Wraps the app (or renders standalone) and installs damped scrolling.
 *
 * It NO-OPS ENTIRELY under prefers-reduced-motion: no Lenis instance, no ticker
 * hook, no scroll listener, native scrolling untouched. Smooth-scroll hijacking
 * is one of the strongest nausea triggers there is, and a damped page also
 * breaks assistive tech that drives scrollTop directly. The media query is
 * watched live, so toggling the OS setting installs or tears down the whole
 * thing without a reload.
 */
export function KzSmoothScroll({ children, lerp = 0.085, wheelMultiplier = 1.15 }: KzSmoothScrollProps) {
  useEffect(() => {
    const media = window.matchMedia(KZ_REDUCED_MOTION_QUERY);
    const root = document.documentElement;

    let lenis: Lenis | null = null;
    let unsubscribe: (() => void) | null = null;
    let tick: ((time: number) => void) | null = null;
    let previousScrollBehavior = "";

    const start = () => {
      if (lenis) return;

      // globals.css sets `html { scroll-behavior: smooth }`. Native smooth
      // scrolling and Lenis both animate the same scrollTop and fight over it,
      // so the native one steps aside for as long as Lenis is mounted. The old
      // inline value is restored on teardown rather than blanked.
      previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";

      lenis = new Lenis({
        lerp,
        wheelMultiplier,
        // Touch is left entirely native: the OS fling has momentum, rubber-band
        // and interruption semantics that no JS loop reproduces, and syncing it
        // is exactly the mobile jank the brief rules out.
        syncTouch: false,
        // gsap.ticker is the only rAF loop on the page.
        autoRaf: false,
        // Lenis animates in-page anchor jumps, replacing the CSS smooth scroll
        // that was just switched off above.
        anchors: true,
      });

      // Wrapped rather than passed by reference: Lenis hands its own instance to
      // scroll callbacks, and ScrollTrigger.update() reads its first argument as
      // a force flag. Forwarding a truthy object would force a full update on
      // every single scroll event.
      unsubscribe = lenis.on("scroll", () => ScrollTrigger.update());

      tick = (time: number) => {
        // gsap.ticker reports seconds; Lenis expects milliseconds.
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tick);

      // GSAP's lag smoothing would freeze the ticker after a long frame and
      // desynchronise Lenis from the real scroll position.
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();
    };

    const stop = () => {
      if (!lenis) return;

      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      gsap.ticker.lagSmoothing(500, 33);

      unsubscribe?.();
      unsubscribe = null;

      lenis.destroy();
      lenis = null;

      root.style.scrollBehavior = previousScrollBehavior;
      ScrollTrigger.refresh();
    };

    const sync = () => {
      if (media.matches) stop();
      else start();
    };

    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
      stop();
    };
  }, [lerp, wheelMultiplier]);

  return <>{children}</>;
}
