"use client";

/**
 * The KENZED / TECHLAB lockup.
 *
 * Lives in one place because it appears in the desktop header, the mobile menu
 * header and the footer — three copies had already drifted apart before this.
 *
 * The two lines are sized so TECHLAB ends optically flush with the D of KENZED.
 * That is arithmetic, not eyeballing, and it had to be redone from scratch for
 * Space Grotesk / JetBrains Mono because the old pairing's proportions do not
 * survive the swap:
 *
 *   KENZED   Archivo Black  4.610em  ->  Space Grotesk 700  3.646em  (-21%)
 *   TECHLAB  IBM Plex Mono  4.200em  ->  JetBrains Mono     4.200em  (both 0.6em fixed)
 *
 * The display line lost a fifth of its width while the mono line kept all of
 * its own, so the old 0.38em tracking on TECHLAB now overshoots badly. Rather
 * than crush the tracking down to ~0.10em — which would kill the wide-tracked
 * lab-mark character the lockup is built on — KENZED is set a step larger to
 * recover the footprint Space Grotesk gives away, and TECHLAB is set a step
 * smaller. JetBrains Mono carries a taller cap for the same advance (730 vs
 * IBM Plex's 698 units), so the smaller size still lands on the same optical
 * cap height as before.
 *
 * Width of a tracked run = (sum of advances + (n - 1) x tracking) x font-size,
 * dropping the trailing gap that letter-spacing appends after the final glyph
 * — which is what the negative marginRight below cancels.
 *
 *   md  KENZED  (3.646 + 5 x 0.02) x 1.00rem            = 3.746rem
 *       TECHLAB (4.200 + 6 x 0.30) x 0.46rem + 16px lead = 3.760rem   (+0.4%)
 *   sm  KENZED  (3.646 + 5 x 0.02) x 0.92rem            = 3.446rem
 *       TECHLAB (4.200 + 6 x 0.30) x 0.42rem + 15px lead = 3.458rem   (+0.3%)
 *
 * "lead" is the gradient rule plus the flex gap sitting to the left of
 * TECHLAB; it is fixed in px, so it does not scale with the size step and the
 * two sizes need slightly different gaps to stay flush.
 */

const SIZES = {
  sm: { name: "0.92rem", mark: "0.42rem", rule: 10, gap: 5 },
  md: { name: "1rem", mark: "0.46rem", rule: 10, gap: 6 },
} as const;

/** Tracking on TECHLAB. Shared by both sizes; the gap absorbs the difference. */
const MARK_TRACKING = "0.3em";

export function KzWordmark({ size = "md" }: { size?: "sm" | "md" }) {
  const s = SIZES[size];

  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.1,
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          /* Explicit: Space Grotesk ships 500/600/700 and an unstated weight
             would resolve to the 500, which reads as a draft of the wordmark
             rather than the wordmark. Archivo Black had no such choice. */
          fontWeight: 700,
          fontSize: s.name,
          letterSpacing: "0.02em",
          color: "var(--ink)",
        }}
      >
        KENZED
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: s.gap, marginTop: 3 }}>
        {/* A short gradient rule gives the mark a baseline to sit on, so the
            wide tracking reads as deliberate rather than as loose type. */}
        <span
          aria-hidden="true"
          style={{
            width: s.rule,
            height: 1,
            flex: "0 0 auto",
            backgroundImage: "var(--gr)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: s.mark,
            letterSpacing: MARK_TRACKING,
            /* letter-spacing appends a trailing gap after the final glyph;
               pulling it back keeps TECHLAB optically flush under KENZED. */
            marginRight: `-${MARK_TRACKING}`,
            /* Gradient fill, with the flat accent as the fallback colour for
               engines that do not honour background-clip: text. */
            color: "var(--acc)",
            backgroundImage: "var(--grt)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TECHLAB
        </span>
      </span>
    </span>
  );
}
