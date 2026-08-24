"use client";

/**
 * Kenzed motion kit — categories 07 (navigation) and 08 (wayfinding).
 *
 * House rules enforced here:
 *   - only `transform` and `opacity` are animated; every indicator moves with
 *     translate/scale rather than left/width so nothing re-lays out per frame;
 *   - one easing language: KZ_EASE for entrances, KZ_SPRING for interactions;
 *   - durations sit between 200ms and 800ms;
 *   - `prefers-reduced-motion` collapses every move to a short opacity change;
 *   - nothing animates above the fold on first paint — the page transition
 *     mounts with `initial={false}`, and the overlays only exist after a
 *     deliberate scroll or interaction.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/* ==========================================================================
   Shared vocabulary
   ========================================================================== */

/** The one entrance curve for the whole site. */
export const KZ_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Same curve, spelled for CSS transitions. */
export const KZ_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
/** The one interaction spring. Used for direct manipulation, never entrances. */
export const KZ_SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** SSR has no layout to read, so the layout effect degrades to a plain effect. */
const useKzIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Entrance/exit props for an overlay layer, collapsed to a fade when asked. */
function kzFade(reduced: boolean, y = 0, scale = 1) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: KZ_EASE },
    };
  }
  return {
    initial: { opacity: 0, y, scale },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: y * 0.6, scale },
    transition: { duration: 0.28, ease: KZ_EASE },
  };
}

/**
 * One rAF-coalesced scroll subscription. The handler is held in a ref so a
 * caller can pass an inline closure without re-binding the listener.
 */
function useKzScroll(handler: (y: number) => void) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      handlerRef.current(window.scrollY);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(run);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);
}

/**
 * Portals only exist after mount; a static export prerenders without a body.
 * Read as an external store rather than an effect, so hydration flips it once
 * instead of scheduling a cascading render.
 */
const kzNoopSubscribe = () => () => {};
const kzHydrated = () => true;
const kzNotHydrated = () => false;

function useKzMounted() {
  return useSyncExternalStore(kzNoopSubscribe, kzHydrated, kzNotHydrated);
}

/**
 * Everything a modal surface owes the keyboard: focus moves in on open, Tab is
 * trapped inside the panel, Escape closes, the page behind stops scrolling, and
 * focus returns to whatever opened it.
 *
 * `onClose` and `getInitialFocus` are read through refs so that an inline
 * callback at the call site cannot re-run the effect and yank focus back to the
 * first stop while the user is typing.
 */
function useKzDialog(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  getInitialFocus?: () => HTMLElement | null
) {
  const closeRef = useRef(onClose);
  const initialRef = useRef(getInitialFocus);
  useEffect(() => {
    closeRef.current = onClose;
    initialRef.current = getInitialFocus;
  });

  useEffect(() => {
    if (!open) return;

    const restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const stops = () => {
      const panel = panelRef.current;
      if (!panel) return [] as HTMLElement[];
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );
    };

    const wanted = initialRef.current?.() ?? null;
    (wanted ?? stops()[0] ?? panelRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const list = stops();
      if (list.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const outside = !(active instanceof Node) || !panel.contains(active);
      if (event.shiftKey && (outside || active === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (outside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (restore && document.contains(restore)) restore.focus();
    };
  }, [open, panelRef]);
}

/* ==========================================================================
   Styles — one sheet, deduplicated by React through href + precedence.
   ========================================================================== */

const KZ_NAV_CSS = `
.kznav-hide{
  position:fixed;top:0;left:0;right:0;z-index:50;
  transform:translate3d(0,0,0);
  transition:transform .38s ${KZ_EASE_CSS};
}
.kznav-hide[data-hidden="true"]{transform:translate3d(0,-102%,0)}

.kzcta{
  position:fixed;left:0;right:0;bottom:0;z-index:48;
  display:flex;align-items:center;gap:12px;flex-wrap:wrap;
  padding:10px clamp(14px,4vw,22px);
  padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));
  background:var(--navbg);border-top:1px solid var(--line);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
}
.kzcta-copy{flex:1 1 150px;min-width:0}
.kzcta-label{
  font-family:var(--font-display);font-weight:600;font-size:.94rem;line-height:1.3;
  letter-spacing:-.004em;color:var(--ink);
  overflow-wrap:break-word;
}
.kzcta-note{
  font-family:var(--font-mono);font-size:.6rem;letter-spacing:.11em;
  text-transform:uppercase;color:var(--mut);margin-top:3px;
}
.kzcta-action{
  display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;
  border-radius:12px;background:var(--ink);color:var(--bg);border:0;
  font-family:var(--font-mono);font-size:.7rem;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;white-space:nowrap;
  box-shadow:0 12px 26px -16px var(--accglow);
}
.kzcta-close{
  width:44px;height:44px;flex:none;display:grid;place-items:center;
  border-radius:12px;border:1px solid var(--line);background:transparent;
  color:var(--mut);cursor:pointer;font-family:var(--font-mono);font-size:.9rem;
}
@media (min-width:900px){
  .kzcta{
    left:auto;right:clamp(16px,3vw,28px);bottom:clamp(16px,3vw,28px);
    max-width:430px;border:1px solid var(--line);border-radius:18px;
    box-shadow:var(--shadow);padding:14px 16px;
  }
}

.kzbtt{
  position:fixed;right:clamp(12px,3vw,24px);bottom:clamp(12px,3vw,24px);z-index:47;
  width:48px;height:48px;display:grid;place-items:center;
  border-radius:14px;border:1px solid var(--line);background:var(--navbg);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  color:var(--ink);cursor:pointer;box-shadow:var(--shadow);
}
.kzbtt svg{display:block}

.kzss{position:relative;padding-left:1px}
.kzss::before{content:"";position:absolute;left:0;top:0;bottom:0;width:1px;background:var(--line)}
.kzss-bar{
  position:absolute;left:0;top:0;width:2px;border-radius:2px;background:var(--acc);
  height:var(--kzss-h,44px);transform-origin:0 0;
  transform:translate3d(0,var(--kzss-y,0px),0) scaleY(var(--kzss-s,1));
  transition:transform .42s ${KZ_EASE_CSS},opacity .3s ${KZ_EASE_CSS};
  box-shadow:0 0 12px var(--accglow);
}
.kzss-list{list-style:none;margin:0;padding:0}
.kzss-link{
  display:flex;align-items:baseline;gap:10px;min-height:44px;
  padding:11px 0 11px 16px;color:var(--mut);line-height:1.35;
  font-size:.85rem;transition:color .28s ${KZ_EASE_CSS};
}
.kzss-num{font-family:var(--font-mono);font-size:.62rem;letter-spacing:.1em;color:var(--dim);flex:none}
.kzss-link[aria-current="location"]{color:var(--ink)}
.kzss-link[aria-current="location"] .kzss-num{color:var(--acc)}
.kzss-link:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:6px}

.kztabs{
  position:relative;display:flex;gap:4px;max-width:100%;
  padding:4px;border:1px solid var(--line);border-radius:999px;background:var(--card);
  overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
}
.kztabs::-webkit-scrollbar{display:none}
/* The pill is measured once against the widest tab and then only ever
   translated and scaled — width is never animated, so no frame re-lays out. */
.kztabs-pill{
  position:absolute;left:0;top:4px;height:calc(100% - 8px);
  width:var(--kztabs-w,96px);border-radius:999px;pointer-events:none;
  background:color-mix(in srgb,var(--acc) 17%,transparent);
  border:1px solid color-mix(in srgb,var(--acc) 42%,transparent);
  transform-origin:0 50%;
  transform:translate3d(var(--kztabs-x,0px),0,0) scaleX(var(--kztabs-s,1));
  transition:transform .42s ${KZ_EASE_CSS},opacity .3s ${KZ_EASE_CSS};
}
.kztab{
  position:relative;z-index:1;flex:none;scroll-snap-align:center;
  min-height:44px;padding:0 clamp(14px,3.4vw,22px);
  border:0;background:transparent;border-radius:999px;cursor:pointer;color:var(--mut);
  font-family:var(--font-mono);font-size:.67rem;font-weight:500;letter-spacing:.11em;
  text-transform:uppercase;white-space:nowrap;
  transition:color .3s ${KZ_EASE_CSS};
}
.kztab[aria-selected="true"]{color:var(--ink)}
.kztab:focus-visible{outline:2px solid var(--acc);outline-offset:-2px}

.kzov{
  position:fixed;inset:0;z-index:120;display:flex;justify-content:center;
  padding:clamp(12px,4vw,40px);overflow-y:auto;overscroll-behavior:contain;
}
.kzov-back{position:fixed;inset:0;background:color-mix(in srgb,var(--bg) 72%,transparent);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.kzov-panel{
  position:relative;display:flex;flex-direction:column;min-height:0;
  width:100%;max-width:var(--kzov-max,560px);margin:auto;
  background:var(--bg2);border:1px solid var(--line);border-radius:18px;
  box-shadow:var(--shadow);max-height:calc(100dvh - clamp(24px,8vw,80px));
}
.kzov-panel:focus{outline:none}
.kzov-head{
  display:flex;align-items:flex-start;gap:12px;
  padding:clamp(16px,4vw,22px) clamp(16px,4vw,24px) 0;
}
.kzov-title{
  flex:1 1 auto;min-width:0;margin:0;color:var(--ink);
  font-family:var(--font-display);font-weight:600;font-size:clamp(1.05rem,4vw,1.32rem);
  line-height:1.28;letter-spacing:-.006em;
}
.kzov-desc{
  margin:8px 0 0;padding:0 clamp(16px,4vw,24px);
  color:var(--mut);font-size:.88rem;line-height:1.55;
}
.kzov-body{padding:clamp(16px,4vw,22px) clamp(16px,4vw,24px);overflow-y:auto;min-height:0}
.kzov-foot{
  display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;
  padding:0 clamp(16px,4vw,24px) clamp(16px,4vw,22px);
}
.kzov-x{
  flex:none;width:44px;height:44px;margin:-8px -8px 0 0;display:grid;place-items:center;
  border-radius:12px;border:1px solid var(--line);background:transparent;
  color:var(--mut);cursor:pointer;font-family:var(--font-mono);font-size:.95rem;
  transition:color .2s ${KZ_EASE_CSS},border-color .2s ${KZ_EASE_CSS};
}
.kzov-x:hover{color:var(--ink);border-color:var(--line2)}

.kzcp .kzov-panel{margin:clamp(24px,9vh,110px) auto auto;--kzov-max:600px;padding:0;overflow:hidden}
.kzcp-input{
  width:100%;min-height:54px;padding:0 clamp(14px,4vw,20px);
  border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);
  font-family:var(--font-sans);font-size:16px;outline:none;
}
.kzcp-input::placeholder{color:var(--dim)}
.kzcp-list{padding:8px;overflow-y:auto;overscroll-behavior:contain;max-height:min(52dvh,380px)}
.kzcp [cmdk-group-heading]{
  padding:12px 12px 6px;color:var(--dim);
  font-family:var(--font-mono);font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;
}
.kzcp [cmdk-item]{
  display:flex;align-items:center;gap:12px;min-height:44px;padding:0 12px;
  border-radius:12px;color:var(--mut);cursor:pointer;
  transition:color .18s ${KZ_EASE_CSS},background-color .18s ${KZ_EASE_CSS};
}
.kzcp [cmdk-item][data-selected="true"]{background:var(--card2);color:var(--ink)}
.kzcp-item-label{flex:1 1 auto;min-width:0;font-size:.92rem;overflow-wrap:break-word}
.kzcp-item-hint{
  flex:none;color:var(--dim);font-family:var(--font-mono);font-size:.6rem;
  letter-spacing:.12em;text-transform:uppercase;
}
.kzcp-empty{padding:26px 12px;text-align:center;color:var(--dim);font-size:.88rem}
.kzcp-foot{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:10px clamp(14px,4vw,20px);border-top:1px solid var(--line);
  color:var(--dim);font-family:var(--font-mono);font-size:.58rem;letter-spacing:.11em;
  text-transform:uppercase;
}
.kzcp-trigger{
  display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;
  border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--mut);
  cursor:pointer;font-family:var(--font-mono);font-size:.66rem;letter-spacing:.12em;
  text-transform:uppercase;
  transition:color .2s ${KZ_EASE_CSS},border-color .2s ${KZ_EASE_CSS};
}
.kzcp-trigger:hover{color:var(--ink);border-color:var(--line2)}
/* The trigger advertises a keyboard shortcut and the palette is driven by
   Cmd/Ctrl+K, so it is meaningless on a touch device — where it also collided
   with the hero stat block. Show it only where a real keyboard is likely. */
@media (max-width:900px),(pointer:coarse){.kzcp-trigger{display:none}}
.kzcp-kbd{
  display:inline-flex;align-items:center;padding:2px 7px;border-radius:6px;
  border:1px solid var(--line);color:var(--dim);font-size:.6rem;letter-spacing:.08em;
}
/* A keyboard hint is meaningless without a keyboard. */
@media (pointer:coarse){.kzcp-kbd{display:none}}

@media (prefers-reduced-motion:reduce){
  .kznav-hide{transition:none;transform:none}
  .kzss-bar,.kztabs-pill{transition:opacity .15s linear}
}
`;

function KzNavStyles() {
  return <style href="kz-nav" precedence="default" dangerouslySetInnerHTML={{ __html: KZ_NAV_CSS }} />;
}

/* ==========================================================================
   07 — Page transition
   ========================================================================== */

export interface KzPageTransitionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Crossfades route content. `initial={false}` on the presence boundary is the
 * load-bearing detail: the first paint renders the page at its final position,
 * so the transition never costs Largest Contentful Paint.
 *
 * The wrapper carries a transform only while a transition is in flight, which
 * is why any `position: fixed` chrome belongs outside it.
 */
export function KzPageTransition({ children, className, style }: KzPageTransitionProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion() === true;

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.32, ease: KZ_EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ==========================================================================
   07 — Hide-on-scroll header
   ========================================================================== */

export interface KzHideOnScrollHeaderProps {
  children: ReactNode;
  /** Pixels of scroll before hiding is allowed at all. */
  offset?: number;
  /** Scroll delta that counts as a direction change; filters trackpad jitter. */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

/** Fixed shell that retracts on scroll down and returns on scroll up. */
export function KzHideOnScrollHeader({
  children,
  offset = 96,
  threshold = 6,
  className = "",
  style,
}: KzHideOnScrollHeaderProps) {
  const reduced = useReducedMotion() === true;
  const [hidden, setHidden] = useState(false);
  const lastRef = useRef(0);

  useKzScroll((y) => {
    if (reduced) {
      setHidden(false);
      return;
    }
    const delta = y - lastRef.current;
    if (Math.abs(delta) < threshold) return;
    lastRef.current = y;
    setHidden(delta > 0 && y > offset);
  });

  return (
    <>
      <KzNavStyles />
      <div className={`kznav-hide ${className}`.trim()} data-hidden={hidden} style={style}>
        {children}
      </div>
    </>
  );
}

/* ==========================================================================
   07 — Sticky CTA
   ========================================================================== */

export interface KzStickyCtaProps {
  href: string;
  label: string;
  note?: string;
  action?: string;
  /** Fraction of the document scrolled before the bar appears. */
  showAt?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/** A single conversion prompt that arrives once the reader is committed. */
export function KzStickyCta({
  href,
  label,
  note,
  action = "Start",
  showAt = 0.4,
  dismissible = true,
  onDismiss,
}: KzStickyCtaProps) {
  const reduced = useReducedMotion() === true;
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useKzScroll((y) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    setShown(max > 0 && y / max >= showAt);
  });

  const dismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  return (
    <>
      <KzNavStyles />
      <AnimatePresence>
        {shown && !dismissed && (
          <motion.aside className="kzcta" aria-label={label} {...kzFade(reduced, 24)}>
            <div className="kzcta-copy">
              <div className="kzcta-label">{label}</div>
              {note && <div className="kzcta-note">{note}</div>}
            </div>
            <Link href={href} className="kzcta-action">
              {action}
            </Link>
            {dismissible && (
              <button type="button" className="kzcta-close" onClick={dismiss} aria-label="Dismiss">
                ✕
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

/* ==========================================================================
   08 — Sliding tabs
   ========================================================================== */

export interface KzTabItem {
  id: string;
  label: string;
  /** id of the panel this tab controls, when there is one. */
  controls?: string;
}

export interface KzSlidingTabsProps {
  tabs: KzTabItem[];
  /** Controlled selection. Omit for the uncontrolled form. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
}

/** Roving-tabindex tab strip with a measured pill that only ever transforms. */
export function KzSlidingTabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  ariaLabel,
  className = "",
  style,
}: KzSlidingTabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id ?? "");
  const activeId = value ?? internal;
  const listRef = useRef<HTMLDivElement | null>(null);
  const interactedRef = useRef(false);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("[data-kztab]"));
    if (buttons.length === 0) return;
    const base = Math.max(...buttons.map((button) => button.offsetWidth));
    if (base <= 0) return;
    const active = buttons.find((button) => button.dataset.kztab === activeId) ?? buttons[0];
    list.style.setProperty("--kztabs-w", `${base}px`);
    list.style.setProperty("--kztabs-x", `${active.offsetLeft}px`);
    list.style.setProperty("--kztabs-s", `${active.offsetWidth / base}`);

    if (!interactedRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: Math.max(0, active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2),
      behavior: reduced ? "auto" : "smooth",
    });
  }, [activeId]);

  useKzIsomorphicLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      // Web fonts land after first paint and change every tab's width.
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    if (typeof ResizeObserver === "undefined") {
      return () => {
        cancelled = true;
      };
    }
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [measure]);

  const select = useCallback(
    (id: string) => {
      interactedRef.current = true;
      if (value === undefined) setInternal(id);
      onValueChange?.(id);
    },
    [onValueChange, value]
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const index = tabs.findIndex((tab) => tab.id === activeId);
      const last = tabs.length - 1;
      let next = index;
      if (event.key === "ArrowLeft") next = index <= 0 ? last : index - 1;
      if (event.key === "ArrowRight") next = index >= last ? 0 : index + 1;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = last;
      const target = tabs[next];
      if (!target) return;
      select(target.id);
      listRef.current?.querySelector<HTMLButtonElement>(`[data-kztab="${target.id}"]`)?.focus();
    },
    [activeId, select, tabs]
  );

  return (
    <>
      <KzNavStyles />
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={`kztabs ${className}`.trim()}
        style={style}
      >
        <span className="kztabs-pill" aria-hidden="true" />
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              data-kztab={tab.id}
              className="kztab"
              aria-selected={selected}
              aria-controls={tab.controls}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ==========================================================================
   07 — Command palette
   ========================================================================== */

/**
 * cmdk lives behind this boundary rather than at the top of the file: the root
 * layout imports KzPageTransition from this module on every route, so a static
 * `import { Command } from "cmdk"` would ship the search engine to every page
 * whether or not anyone opens it. The factory is named so the trigger can warm
 * the chunk on hover or focus — the module registry de-duplicates the second
 * call, so the palette opens instantly on the path a mouse takes.
 */
const importCommandList = () => import("./KzCommandList");

const KzLazyCommandList = lazy(() =>
  importCommandList().then((mod) => ({ default: mod.KzCommandList }))
);

export interface KzCommandItem {
  id: string;
  label: string;
  /** Internal route to push. Ignored when `onSelect` is given. */
  href?: string;
  onSelect?: () => void;
  hint?: string;
  group?: string;
  keywords?: string[];
}

/**
 * The site's real routes, mirroring the header navigation plus the two pages
 * that live in the sitemap without a header slot. Nothing here is invented.
 */
export const KZ_SITE_COMMANDS: KzCommandItem[] = [
  { id: "home", label: "Home", href: "/", hint: "01", group: "Pages", keywords: ["start", "index"] },
  { id: "services", label: "Services", href: "/services", hint: "02", group: "Pages", keywords: ["ai", "ml", "capabilities"] },
  { id: "product-studio", label: "Product Studio", href: "/product-studio", hint: "03", group: "Pages", keywords: ["products", "build"] },
  { id: "live-projects", label: "Live Projects", href: "/live-projects", hint: "04", group: "Pages", keywords: ["work", "case studies"] },
  { id: "technology", label: "Technology", href: "/technology", hint: "05", group: "Pages", keywords: ["stack", "tools"] },
  { id: "infrastructure", label: "Infrastructure", href: "/infrastructure", hint: "06", group: "Pages", keywords: ["cloud", "devops"] },
  { id: "process", label: "Process", href: "/process", hint: "07", group: "Pages", keywords: ["method", "delivery"] },
  { id: "about", label: "About", href: "/about", hint: "08", group: "Pages", keywords: ["company", "story"] },
  { id: "contact", label: "Contact", href: "/contact", hint: "09", group: "Pages", keywords: ["email", "call", "enquiry"] },
  { id: "industries", label: "Industries", href: "/industries", group: "Pages", keywords: ["sectors", "verticals"] },
  { id: "team", label: "Team", href: "/team", group: "Pages", keywords: ["people", "engineers"] },
];

export interface KzCommandPaletteProps {
  commands?: KzCommandItem[];
  /** Controlled open state. Omit to let the component own it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Binds Cmd/Ctrl+K while mounted. The listener lives and dies with this component. */
  hotkey?: boolean;
  /** Renders the built-in opener, so the palette is reachable without a keyboard. */
  withTrigger?: boolean;
  triggerLabel?: string;
  placeholder?: string;
  emptyMessage?: string;
  label?: string;
}

/**
 * Fuzzy site search over the real routes.
 *
 * The Cmd/Ctrl+K binding is registered inside this component's effect, so a
 * page that does not mount the palette leaves the browser shortcut alone.
 */
export function KzCommandPalette({
  commands = KZ_SITE_COMMANDS,
  open,
  onOpenChange,
  hotkey = true,
  withTrigger = true,
  triggerLabel = "Search",
  placeholder = "Search pages and commands…",
  emptyMessage = "No matches.",
  label = "Site command palette",
}: KzCommandPaletteProps) {
  const router = useRouter();
  const mounted = useKzMounted();
  const reduced = useReducedMotion() === true;
  const [internal, setInternal] = useState(false);
  const isOpen = open ?? internal;
  const panelRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open]
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen(!isOpen);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hotkey, isOpen, setOpen]);

  // No initial-focus override: the lazy list mounts a moment after the panel,
  // and its input carries autoFocus.
  useKzDialog(isOpen, panelRef, close);

  const run = useCallback(
    (item: KzCommandItem) => {
      close();
      if (item.onSelect) item.onSelect();
      else if (item.href) router.push(item.href);
    },
    [close, router]
  );

  const groups: { name: string; items: KzCommandItem[] }[] = [];
  commands.forEach((item) => {
    const name = item.group ?? "Commands";
    const bucket = groups.find((group) => group.name === name);
    if (bucket) bucket.items.push(item);
    else groups.push({ name, items: [item] });
  });

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <div className="kzov kzcp">
          <motion.div
            className="kzov-back"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.22, ease: KZ_EASE }}
          />
          <motion.div
            ref={panelRef}
            className="kzov-panel"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            {...kzFade(reduced, -12, 0.985)}
          >
            <Suspense fallback={<div className="kzcp-empty">Loading search…</div>}>
              <KzLazyCommandList
                label={label}
                placeholder={placeholder}
                emptyMessage={emptyMessage}
                groups={groups}
                onRun={run}
              />
            </Suspense>
            <div className="kzcp-foot">
              <span className="kzcp-kbd">↑↓</span>
              <span>Navigate</span>
              <span className="kzcp-kbd">↵</span>
              <span>Open</span>
              <span className="kzcp-kbd">Esc</span>
              <span>Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <KzNavStyles />
      {withTrigger && (
        <button
          type="button"
          className="kzcp-trigger"
          onClick={() => setOpen(true)}
          onPointerEnter={() => void importCommandList()}
          onFocus={() => void importCommandList()}
        >
          <span aria-hidden="true">⌕</span>
          <span>{triggerLabel}</span>
          <span className="kzcp-kbd" aria-hidden="true">
            ⌘K
          </span>
        </button>
      )}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

/* ==========================================================================
   07 — Back to top
   ========================================================================== */

export interface KzBackToTopProps {
  /** Pixels scrolled before the control appears. */
  showAfter?: number;
  label?: string;
  style?: CSSProperties;
}

/** Fixed control that returns the reader to the top of the document. */
export function KzBackToTop({ showAfter = 640, label = "Back to top", style }: KzBackToTopProps) {
  const reduced = useReducedMotion() === true;
  const [shown, setShown] = useState(false);

  useKzScroll((y) => setShown(y > showAfter));

  const toTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, []);

  return (
    <>
      <KzNavStyles />
      <AnimatePresence>
        {shown && (
          <motion.button
            type="button"
            className="kzbtt"
            onClick={toTop}
            aria-label={label}
            title={label}
            style={style}
            whileTap={reduced ? undefined : { scale: 0.94 }}
            {...kzFade(reduced, 14)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M9 15V3M9 3 3.5 8.5M9 3l5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

/* ==========================================================================
   07 — Modal
   ========================================================================== */

export interface KzModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeLabel?: string;
  /** Element to focus on open. Defaults to the first focusable stop. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const KZ_MODAL_WIDTH: Record<NonNullable<KzModalProps["size"]>, string> = {
  sm: "420px",
  md: "560px",
  lg: "760px",
};

/**
 * Portalled dialog with a blurred backdrop. Focus enters on open, Tab is
 * trapped, Escape closes, and focus returns to the trigger on the way out.
 */
export function KzModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeLabel = "Close dialog",
  initialFocusRef,
}: KzModalProps) {
  const mounted = useKzMounted();
  const reduced = useReducedMotion() === true;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const getInitialFocus = useCallback(
    () => initialFocusRef?.current ?? null,
    [initialFocusRef]
  );

  useKzDialog(open, panelRef, onClose, getInitialFocus);

  const overlay = (
    <AnimatePresence>
      {open && (
        <div className="kzov">
          <motion.div
            className="kzov-back"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.22, ease: KZ_EASE }}
          />
          <motion.div
            ref={panelRef}
            className="kzov-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            style={{ "--kzov-max": KZ_MODAL_WIDTH[size] } as CSSProperties}
            {...kzFade(reduced, 16, 0.98)}
          >
            <div className="kzov-head">
              <h2 id={titleId} className="kzov-title">
                {title}
              </h2>
              <button type="button" className="kzov-x" onClick={onClose} aria-label={closeLabel}>
                ✕
              </button>
            </div>
            {description && (
              <p id={descriptionId} className="kzov-desc">
                {description}
              </p>
            )}
            {children && <div className="kzov-body">{children}</div>}
            {footer && <div className="kzov-foot">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <KzNavStyles />
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
