/**
 * Guards the one mistake this codebase makes over and over.
 *
 * Several components carry their own stylesheet in a JS template literal,
 * because hover, :focus-visible, attribute selectors, media queries and
 * prefers-reduced-motion cannot be expressed as React style props. A backtick
 * typed inside one of those CSS comments — quoting a property name, say —
 * ENDS the literal, and the file stops parsing somewhere far below, with an
 * error naming a line nowhere near the cause.
 *
 * tsc does catch it, but only once you have gone looking. This names the
 * offending file, line and surrounding text directly.
 *
 *   node scripts/check-css-literals.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) yield full;
  }
}

/* `const SOMETHING_CSS = ` opening a template literal. The naming convention
   is consistent across every component that carries a scoped stylesheet. */
const OPENER = /const\s+([A-Za-z0-9_]*CSS)\s*=\s*`/g;

const problems = [];

for (const file of walk(ROOT)) {
  const source = readFileSync(file, "utf8");

  for (const match of source.matchAll(OPENER)) {
    const start = match.index + match[0].length;

    /* Where the literal actually ends AS THE PARSER SEES IT — the first
       backtick that is not escaped. A stray one inside the CSS lands here
       early, and everything after it is parsed as code. */
    let end = start;
    for (;;) {
      end = source.indexOf("`", end);
      if (end === -1) break;
      let slashes = 0;
      while (source[end - 1 - slashes] === "\\") slashes++;
      if (slashes % 2 === 0) break;
      end += 1;
    }
    if (end === -1) continue;

    /* Every one of these declarations closes with backtick-semicolon. Any
       other following character means the literal was terminated early. */
    if (source[end + 1] === ";") continue;

    const line = source.slice(0, end).split("\n").length;
    const context = source
      .slice(Math.max(start, end - 80), end)
      .split("\n")
      .pop()
      .trim();

    problems.push(
      `${file}:${line}  ${match[1]} ends early — stray backtick after: …${context}`
    );
  }
}

if (problems.length) {
  console.error("Stray backtick inside a CSS template literal:\n");
  for (const p of problems) console.error("  " + p);
  console.error("\nWrite property names unquoted in those comments.\n");
  process.exit(1);
}

console.log(`CSS template literals: no stray backticks`);
