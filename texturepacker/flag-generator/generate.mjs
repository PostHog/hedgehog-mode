// The flag generator's entry point. Every flag the hedgehog can hold is a
// 31x21 "cloth" generated from a spec in ./countries (written in the DSL in
// ./draw.mjs, with emblems from ./helpers.mjs), never drawn by hand. This
// renders each spec and writes texturepacker/assets/flags/<slug>.png; then
// texturepacker/append-to-atlas.mjs packs those into
// hedgehog-mode/assets/sprites.{png,json}.
//
//   pnpm flags                    # generate + repack
//   pnpm flags:check              # CI: fail if any cloth or the atlas is stale
//   pnpm flags:preview <out.png> [--only a,b]
//
// or directly:
//
//   node texturepacker/flag-generator/generate.mjs              # write the PNGs
//   node texturepacker/flag-generator/generate.mjs --preview /tmp/flags.png [--only a,b]
//   node texturepacker/flag-generator/generate.mjs --check      # stale? exit 1
//
// --preview writes nothing into assets: it lays the flags out 10 to a row (in
// the order it prints) at 4x, for eyeballing. --check writes nothing either:
// it fails if any cloth PNG doesn't match its spec, or has no spec, so a
// hand-edited PNG or a forgotten regenerate can't slip through.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { CLOTH_HEIGHT, CLOTH_WIDTH, renderCloth } from "./draw.mjs";
import { createImage, encodePng } from "./png.mjs";

/** @typedef {import("./draw.mjs").Flag} Flag */
/** @typedef {import("./png.mjs").Image} Image */

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, "..", "assets", "flags");

const { values } = parseArgs({
  options: {
    preview: { type: "string" },
    only: { type: "string" },
    check: { type: "boolean" },
  },
});

/** Every spec in ./countries, by slug. @type {Record<string, Flag>} */
const flags = {};
for (const file of readdirSync(join(here, "countries")).sort()) {
  const batch = await import(join(here, "countries", file));
  for (const [slug, flag] of Object.entries(batch.flags)) {
    if (flags[slug]) {
      throw new Error(`${slug} is defined twice (again in ${file})`);
    }
    flags[slug] = flag;
  }
}

const only = values.only?.split(",");
const slugs = Object.keys(flags)
  .filter((slug) => !only || only.includes(slug))
  .sort();
const images = slugs.map((slug) => [slug, renderCloth(flags[slug])]);

if (values.check) {
  const stale = images
    .filter(([slug, image]) => {
      const file = join(assets, `${slug}.png`);
      return !existsSync(file) || !encodePng(image).equals(readFileSync(file));
    })
    .map(([slug]) => slug);
  const orphans = readdirSync(assets)
    .map((file) => file.replace(/\.png$/, ""))
    .filter((slug) => !flags[slug] && (!only || only.includes(slug)));
  if (stale.length || orphans.length) {
    if (stale.length) {
      console.log(
        `${stale.length} cloths don't match their spec: ${stale.join(" ")}`
      );
    }
    if (orphans.length) {
      console.log(
        `${orphans.length} cloths have no spec: ${orphans.join(" ")}`
      );
    }
    console.log("run `pnpm flags` to regenerate");
    process.exit(1);
  }
  console.log(`all ${images.length} cloths match their specs`);
} else if (values.preview) {
  writeFileSync(
    values.preview,
    encodePng(contactSheet(images.map(([, i]) => i)))
  );
  slugs.forEach((slug, i) => console.log(`${i}\t${slug}`));
} else {
  for (const [slug, image] of images) {
    writeFileSync(join(assets, `${slug}.png`), encodePng(image));
  }
  console.log(`wrote ${images.length} flags to ${assets}`);
}

/**
 * Lays cloths out in a grid on a grey sheet, scaled up for eyeballing.
 * @param {Image[]} cloths
 * @param {number} [perRow]
 * @param {number} [scale]
 * @param {number} [gap] Grey pixels between cloths, after scaling.
 * @returns {Image}
 */
function contactSheet(cloths, perRow = 10, scale = 4, gap = 4) {
  const cellW = CLOTH_WIDTH * scale + gap;
  const cellH = CLOTH_HEIGHT * scale + gap;
  const rows = Math.ceil(cloths.length / perRow);
  const sheet = createImage(perRow * cellW + gap, rows * cellH + gap);
  sheet.data.fill(200);
  cloths.forEach((cloth, i) => {
    const ox = gap + (i % perRow) * cellW;
    const oy = gap + Math.floor(i / perRow) * cellH;
    for (let y = 0; y < CLOTH_HEIGHT * scale; y++) {
      for (let x = 0; x < CLOTH_WIDTH * scale; x++) {
        const src =
          (Math.floor(y / scale) * CLOTH_WIDTH + Math.floor(x / scale)) * 4;
        if (cloth.data[src + 3]) {
          sheet.data.set(
            cloth.data.subarray(src, src + 4),
            ((oy + y) * sheet.width + ox + x) * 4
          );
        }
      }
    }
  });
  return sheet;
}
