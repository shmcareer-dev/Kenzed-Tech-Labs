"use client";

/**
 * The KENZED TECHLAB brand lockup: the design's K-tile — a 30px rounded
 * square with a diagonal cyan slash behind a mono K — followed by the name
 * set on one line, TECHLAB as a small mono suffix.
 *
 * Lives in one place because it appears in the desktop header pill and the
 * mobile menu header; the previous two-line lockup drifted apart across
 * copies before it was centralised, so the single source stays.
 *
 * The external API ({ size?: "sm" | "md" }) is unchanged from the old
 * lockup so call sites did not have to churn during the redesign.
 */

const KZWM_CSS = `
.kzwm{display:inline-flex;align-items:center;gap:11px;line-height:1;width:max-content}
.kzwm-mark{
  position:relative;display:grid;place-items:center;overflow:hidden;flex:0 0 auto;
  width:30px;height:30px;border-radius:8px;
  border:1px solid rgba(130,206,255,.64);
  background:#071524;color:#dff4ff;
  font:800 14px var(--font-mono);
  box-shadow:inset 0 0 16px rgba(77,163,255,.2),0 0 24px rgba(77,163,255,.15);
}
.kzwm-mark i{
  position:absolute;width:20px;height:1px;transform:rotate(-48deg);
  background:var(--acc3);box-shadow:0 0 9px var(--acc3);
}
/* The tile's near-black well and cyan halo are intrinsically dark furniture
   (the one place a hard hex is deliberate); light mode swaps them for the
   card surface so the K keeps its contrast instead of glowing on white. */
[data-kz-theme="light"] .kzwm-mark{
  border-color:var(--line2);background:var(--card2);color:var(--ink);box-shadow:none;
}
[data-kz-theme="light"] .kzwm-mark i{box-shadow:none}
.kzwm-name{
  display:inline-flex;align-items:baseline;gap:6px;white-space:nowrap;
  font-family:var(--font-display);font-size:14px;font-weight:760;
  letter-spacing:-.018em;color:var(--ink);
}
.kzwm-name b{font:500 10px var(--font-mono);letter-spacing:.1em;color:var(--mut)}
.kzwm[data-size="sm"] .kzwm-mark{width:26px;height:26px;border-radius:7px;font-size:12px}
.kzwm[data-size="sm"] .kzwm-mark i{width:17px}
.kzwm[data-size="sm"] .kzwm-name{font-size:13px}
`;

export function KzWordmark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <>
      <style href="kz-wordmark" precedence="default" dangerouslySetInnerHTML={{ __html: KZWM_CSS }} />
      <span className="kzwm" data-size={size}>
        {/* The K is decoration on top of the adjacent name, not a word. */}
        <span className="kzwm-mark" aria-hidden="true">
          <i />K
        </span>
        <span className="kzwm-name">
          KENZED <b>TECHLAB</b>
        </span>
      </span>
    </>
  );
}
