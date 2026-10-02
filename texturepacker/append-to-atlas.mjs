// Brings hedgehog-mode/assets/sprites.{png,json} up to date with
// texturepacker/assets — the last step of the flag pipeline (spec →
// flag-generator/generate.mjs → assets/flags/<slug>.png → here), and how any
// other new sprite gets into the sheet too. It doesn't move existing frames: PNGs that aren't in the
// sheet yet are appended, packed ones whose source changed (at the same size)
// are redrawn in place, ones that changed size are moved to a new spot, and
// ones whose source was deleted are dropped (the space a moved or dropped
// sprite leaves stays empty until the next full repack).
//
//   node texturepacker/append-to-atlas.mjs           # update the sheet
//   node texturepacker/append-to-atlas.mjs --check   # list what's stale; write nothing
//
// `pnpm flags` / `pnpm flags:check` run this after the flag generator.
//
// hedgehog-mode.tps is still the source of truth for a full repack, but
// TexturePacker is a licensed GUI and a repack reshuffles every frame. This
// keeps the existing frames byte-for-byte where they are and shelf-packs the
// new ones after the last row, continuing the last shelf while they fit. It
// writes the JSON in TexturePacker's own layout, so the diff is just the new
// entries and a running TexturePacker later still sees a sheet it'd produce.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  blit,
  createImage,
  crop,
  decodePng,
  encodePng,
} from "./flag-generator/png.mjs";

/** @typedef {{ x: number, y: number, w: number, h: number }} Rect */

const here = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(here, "assets");
const sheetJson = join(here, "..", "hedgehog-mode", "assets", "sprites.json");
const sheetPng = join(here, "..", "hedgehog-mode", "assets", "sprites.png");

const { values } = parseArgs({ options: { check: { type: "boolean" } } });

const original = readFileSync(sheetJson, "utf8");
const atlas = JSON.parse(original);
if (serialize(atlas) !== original) {
  // If this fires, TexturePacker's output format changed (or someone
  // hand-edited the JSON): fix `serialize` before trusting the diff.
  throw new Error("sprites.json doesn't round-trip through serialize()");
}

const oldSheet = decodePng(readFileSync(sheetPng));
const sources = listPngs(sourceDir).map((file) => {
  const name = relative(sourceDir, file).split(sep).join("/");
  return { name, image: decodePng(readFileSync(file)) };
});

// A sprite that changed size can't be redrawn in place, so it's packed again
// like a new one; its JSON entry keeps its position, so the diff stays small.
const resized = new Set(
  sources
    .filter(({ name, image }) => {
      const frame = atlas.frames[name]?.frame;
      return frame && (frame.w !== image.width || frame.h !== image.height);
    })
    .map(({ name }) => name)
);

const missing = sources
  .filter(({ name }) => !atlas.frames[name] || resized.has(name))
  // Tallest first, so each shelf wastes as little height as possible.
  .sort(
    (a, b) => b.image.height - a.image.height || a.name.localeCompare(b.name)
  );

const changed = sources.filter(({ name, image }) => {
  const frame = atlas.frames[name]?.frame;
  if (!frame || resized.has(name)) {
    return false;
  }
  const packed = crop(oldSheet, frame);
  return !Buffer.from(packed).equals(Buffer.from(image.data));
});

const sourceNames = new Set(sources.map(({ name }) => name));
const removed = new Set(
  Object.keys(atlas.frames).filter((name) => !sourceNames.has(name))
);

const stale = [
  ...missing.map((m) => `  ${resized.has(m.name) ? "↔" : "+"} ${m.name}`),
  ...changed.map((c) => `  ~ ${c.name}`),
  ...[...removed].map((name) => `  - ${name}`),
];
if (values.check || stale.length === 0) {
  console.log(
    stale.length
      ? `${stale.length} sprites out of date (+ missing, ~ changed, ↔ resized, - deleted):\n${stale.join("\n")}`
      : "sprite sheet is up to date"
  );
  process.exit(values.check && stale.length ? 1 : 0);
}

const width = atlas.meta.size.w;
// Everything that stays put, plus each new sprite once it's placed.
const occupied = Object.entries(atlas.frames)
  .filter(([name]) => !removed.has(name) && !resized.has(name))
  .map(([, f]) => f.frame);
const bottom = Math.max(...occupied.map((f) => f.y + f.h));
/**
 * Whether two `{ x, y, w, h }` rectangles overlap.
 * @param {Rect} a
 * @param {Rect} b
 * @returns {boolean}
 */
const overlaps = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// The open shelf: the bottom-most row, from just right of its last frame. A
// sheet TexturePacker packed needn't end in clean rows, so a spot on it is
// only used if nothing already there overlaps; otherwise new shelves start
// below everything.
const shelfY = Math.max(...occupied.map((f) => f.y));
const lastRow = occupied.filter((f) => f.y === shelfY);
let shelf = {
  y: shelfY,
  height: Math.max(...lastRow.map((f) => f.h)),
  x: Math.max(...lastRow.map((f) => f.x + f.w)),
};

for (const sprite of missing) {
  const { width: w, height: h } = sprite.image;
  if (w > width) {
    throw new Error(`${sprite.name} is wider than the sheet (${w} > ${width})`);
  }
  const fits =
    h <= shelf.height &&
    shelf.x + w <= width &&
    !occupied.some((f) => overlaps(f, { x: shelf.x, y: shelf.y, w, h }));
  if (!fits) {
    shelf = { y: Math.max(shelf.y + shelf.height, bottom), height: h, x: 0 };
  }
  const spot = { x: shelf.x, y: shelf.y, w, h };
  Object.assign(sprite, spot);
  occupied.push(spot);
  shelf.x += w;
}

const height = Math.max(
  oldSheet.height,
  ...missing.map((s) => s.y + s.image.height)
);
const sheet = createImage(width, height);
sheet.data.set(oldSheet.data);
// Clear the slots being vacated first: a moved sprite may land on one.
for (const name of [...removed, ...resized]) {
  const { w, h, x, y } = atlas.frames[name].frame;
  blit(sheet, createImage(w, h), x, y);
}
for (const { image, x, y } of missing) {
  blit(sheet, image, x, y);
}
for (const { name, image } of changed) {
  const { x, y } = atlas.frames[name].frame;
  blit(sheet, image, x, y);
}
for (const name of removed) {
  delete atlas.frames[name];
}

for (const { name, image, x, y } of missing) {
  const { width: w, height: h } = image;
  atlas.frames[name] = {
    frame: { x, y, w, h },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: 0, y: 0, w, h },
    sourceSize: { w, h },
  };
  // TexturePacker's animation detection: frames ending in digits are grouped
  // under the name with the digits (and extension) dropped.
  const animation = name.match(/^(.*?)\d+\.png$/)?.[1];
  if (animation) {
    atlas.animations[animation] = [
      ...new Set([...(atlas.animations[animation] ?? []), name]),
    ].sort();
  }
}
atlas.animations = Object.fromEntries(
  Object.entries(atlas.animations)
    .map(([key, list]) => [key, list.filter((name) => atlas.frames[name])])
    .filter(([, list]) => list.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
);
atlas.meta.size = { w: width, h: height };

writeFileSync(sheetPng, encodePng(sheet));
writeFileSync(sheetJson, serialize(atlas));
console.log(
  `appended ${missing.length - resized.size}, moved ${resized.size}, redrew ${changed.length} and dropped ${removed.size} sprites; sheet is now ${width}x${height} (was ${oldSheet.width}x${oldSheet.height})`
);

/**
 * Every .png under `dir`, recursively.
 * @param {string} dir
 * @returns {string[]} Paths.
 */
function listPngs(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listPngs(path);
    }
    return entry.name.endsWith(".png") ? [path] : [];
  });
}

/**
 * The atlas as TexturePacker's pixijs4 layout, exactly — see the round-trip
 * check above.
 * @param {{ frames: object, animations: Record<string, string[]>, meta: object }} atlas
 * @returns {string}
 */
function serialize({ frames, animations, meta }) {
  // A flat object on one line, unquoted values: `{"x":1,"y":2}`.
  const box = (o) =>
    `{${Object.entries(o)
      .map(([k, v]) => `"${k}":${v}`)
      .join(",")}}`;
  const frameEntries = Object.entries(frames).map(
    ([name, f]) =>
      `${JSON.stringify(name)}:\n{\n` +
      `\t"frame": ${box(f.frame)},\n` +
      `\t"rotated": ${f.rotated},\n` +
      `\t"trimmed": ${f.trimmed},\n` +
      `\t"spriteSourceSize": ${box(f.spriteSourceSize)},\n` +
      `\t"sourceSize": ${box(f.sourceSize)}\n}`
  );
  const animationEntries = Object.entries(animations).map(
    ([name, list]) => `\t${JSON.stringify(name)}: ${JSON.stringify(list)}`
  );
  const metaEntries = Object.entries(meta).map(
    ([k, v]) =>
      `\t"${k}": ${typeof v === "object" ? box(v) : JSON.stringify(v)}`
  );
  return (
    `{"frames": {\n\n${frameEntries.join(",\n")}},\n` +
    `"animations": {\n${animationEntries.join(",\n")}\n},\n` +
    `"meta": {\n${metaEntries.join(",\n")}\n}\n}\n`
  );
}
