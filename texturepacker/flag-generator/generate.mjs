// Renders every flag in ./countries into texturepacker/assets/flags/<slug>.png.
//
//   node texturepacker/flag-generator/generate.mjs              # write the PNGs
//   node texturepacker/flag-generator/generate.mjs --preview /tmp/flags.png [--only a,b]
//
// --preview writes nothing into assets: it lays the flags out 10 to a row (in
// the order it prints) at 4x, for eyeballing. Then run
// texturepacker/append-to-atlas.mjs to get new PNGs into the spritesheet.
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { CLOTH_HEIGHT, CLOTH_WIDTH, renderCloth } from "./draw.mjs";
import { createImage, encodePng } from "./png.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, "..", "assets", "flags");

const { values } = parseArgs({
  options: { preview: { type: "string" }, only: { type: "string" } },
});

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

if (values.preview) {
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
