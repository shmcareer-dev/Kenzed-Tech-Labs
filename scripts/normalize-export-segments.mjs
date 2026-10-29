import { constants, copyFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Next.js can export RSC segments as nested directories on Windows, while its
// browser router requests flat, dot-separated filenames. Add the expected files
// without changing correctly exported files or deleting any build output.
// Upstream: https://github.com/vercel/next.js/issues/85374
const root = resolve(process.argv[2] || "dist");
let copied = 0;

function copySegments(directory, destination, parts) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    const names = [...parts, entry.name];
    if (entry.isDirectory()) {
      copySegments(source, destination, names);
    } else if (entry.isFile() && entry.name.endsWith(".txt")) {
      const target = join(destination, names.join("."));
      if (existsSync(target)) {
        if (!readFileSync(source).equals(readFileSync(target))) {
          throw new Error(`Conflicting exported segment: ${target}`);
        }
      } else {
        copyFileSync(source, target, constants.COPYFILE_EXCL);
        copied++;
      }
    }
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const child = join(directory, entry.name);
    if (entry.name.startsWith("__next.")) {
      copySegments(child, directory, [entry.name]);
    } else {
      walk(child);
    }
  }
}

walk(root);
console.log(`Static export: normalized ${copied} segment filenames`);
