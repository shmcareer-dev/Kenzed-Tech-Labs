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

import { usePathname, useRouter } from "next/navigation";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
/* Was motion/react. Everything this module still animates is a fade with an
   optional few pixels of travel, which CSS does natively — and the library was
   132KB of raw JavaScript on every page of the site to provide it. */
import { useKzReducedMotion as useReducedMotion } from "./KzEntrance";

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
/* This used to be a blanket display:none below 900px and on any coarse
   pointer — which took the palette away from phones entirely AND left the
   floating dock in the layout as a 0x0 fixed element, because the dock only
   hides itself from 921px up. Site search is worth more on a phone than on a
   desktop, so the trigger survives; it just stops pretending there is a
   keyboard. The header pill keeps its own copy above 920px, where the pill
   still shows a link row to sit it in. */
@media (pointer:coarse){
  .kz-palette-dock .kzcp-trigger{
    width:46px;height:46px;min-height:46px;padding:0;gap:0;
    justify-content:center;border-radius:14px;
    background:color-mix(in srgb,var(--bg2) 92%,transparent);
    box-shadow:0 10px 26px -18px rgba(0,0,0,.9);
  }
  .kz-palette-dock .kzcp-trigger .kzcp-glyph{font-size:1.15rem;line-height:1}
  .kz-palette-dock .kzcp-trigger .kzcp-label{
    /* Hidden visually, still read out: the button would otherwise announce
       itself as a lone magnifier glyph. */
    position:absolute;width:1px;height:1px;padding:0;margin:-1px;
    overflow:hidden;clip-path:inset(50%);white-space:nowrap;
  }
}
/* Inside the header pill the trigger is a text chip, and the pill hides its
   whole link row below 920px, so the header copy goes with it. */
@media (max-width:920px){.kzhdr .kzcp-trigger{display:none}}
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

  /* Keyed on the path, so React remounts the wrapper on navigation and the
     CSS entrance replays. The exit half of the old crossfade is gone on
     purpose: `mode="wait"` held the INCOMING page back until the outgoing one
     had finished animating out, which added its full duration to every
     navigation. The new page now paints immediately and fades up under its
     own animation. */
  return (
    <div key={pathname} className={`kznav-page ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

/* ==========================================================================
   07 — Hide-on-scroll header

/* ==========================================================================
   07 — Sticky CTA

/* ==========================================================================
   08 — Sliding tabs
   ========================================================================== */

export interface KzTabItem {
  id: string;
  label: string;
  /** id of the panel this tab controls, when there is one. */
  controls?: string;
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
  /* The legal shelf is the one part of a site people search for by name rather
     than navigate to, which is exactly what a command palette is for. */
  { id: "privacy", label: "Privacy Policy", href: "/privacy", group: "Legal", keywords: ["data", "gdpr", "dpdp", "cookies"] },
  { id: "terms", label: "Terms & Conditions", href: "/terms", group: "Legal", keywords: ["legal", "agreement", "tos"] },
  { id: "cookies", label: "Cookie Policy", href: "/cookies", group: "Legal", keywords: ["tracking", "storage", "consent"] },
  { id: "refund", label: "Refund & Cancellation", href: "/refund", group: "Legal", keywords: ["cancel", "money back", "billing"] },
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

  /* No exit animation. The palette is dismissed deliberately — Escape, a click
     outside, or running a command — and in every one of those cases the user
     has already moved on; holding a dialog on screen for another 280ms to fade
     it is latency dressed as polish. It still fades IN, which is the half that
     stops it appearing as a hard flash. */
  const overlay = isOpen ? (
    <div className="kzov kzcp" data-reduced={reduced ? "1" : undefined}>
      <div className="kzov-back kznav-in-fade" onClick={close} />
      <div
        ref={panelRef}
        className="kzov-panel kznav-in-pop"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
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
      </div>
    </div>
  ) : null;

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
          <span className="kzcp-glyph" aria-hidden="true">⌕</span>
          <span className="kzcp-label">{triggerLabel}</span>
          <span className="kzcp-kbd" aria-hidden="true">
            ⌘K
          </span>
        </button>
      )}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
