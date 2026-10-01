// Just enough PNG to read and write the 8-bit RGBA images this repo ships, with
// nothing but node:zlib — so regenerating sprites doesn't need TexturePacker,
// ImageMagick or a native image library.
import { crc32, deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** @typedef {{ width: number, height: number, data: Uint8Array }} Image RGBA, row-major */

/** @returns {Image} */
export function createImage(width, height) {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

/** Copies `image` into `sheet` with its top-left at (x, y). */
export function blit(sheet, image, x, y) {
  for (let row = 0; row < image.height; row++) {
    sheet.data.set(
      image.data.subarray(row * image.width * 4, (row + 1) * image.width * 4),
      ((y + row) * sheet.width + x) * 4
    );
  }
}

/** The RGBA pixels of a `{ x, y, w, h }` region of `sheet`. */
export function crop(sheet, { x, y, w, h }) {
  const out = new Uint8Array(w * h * 4);
  for (let row = 0; row < h; row++) {
    const start = ((y + row) * sheet.width + x) * 4;
    out.set(sheet.data.subarray(start, start + w * 4), row * w * 4);
  }
  return out;
}

/** @param {Image} image */
export function encodePng({ width, height, data }) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  // Filter type 0 (none) on every row: these are flat-colour sprites, so
  // deflate already does well and the output stays deterministic.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw.set(data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Decodes any non-interlaced PNG (grey, RGB, palette, with or without alpha;
 * up to 8 bits per channel) to RGBA. Fully transparent pixels come out as
 * 0,0,0,0 whatever colour they were stored with, so images that look the same
 * compare equal.
 */
export function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error("not a PNG");
  }
  let header;
  let palette;
  let transparency;
  const idat = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: body.readUInt32BE(0),
        height: body.readUInt32BE(4),
        depth: body[8],
        colorType: body[9],
        interlace: body[12],
      };
    } else if (type === "PLTE") {
      palette = body;
    } else if (type === "tRNS") {
      transparency = body;
    } else if (type === "IDAT") {
      idat.push(body);
    }
    offset += 12 + length;
  }

  const { width, height, depth, colorType, interlace } = header;
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels || depth > 8 || interlace !== 0) {
    throw new Error(
      `unsupported PNG (depth ${depth}, colour type ${colorType}, interlace ${interlace})`
    );
  }
  const stride = Math.ceil((width * channels * depth) / 8);
  const bpp = Math.max(1, (channels * depth) / 8);
  const raw = inflateSync(Buffer.concat(idat));
  const bytes = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = y * stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= bpp ? bytes[row + i - bpp] : 0;
      const up = y > 0 ? bytes[row - stride + i] : 0;
      const upLeft = y > 0 && i >= bpp ? bytes[row - stride + i - bpp] : 0;
      bytes[row + i] = (line[i] + unfilter(filter, left, up, upLeft)) & 0xff;
    }
  }

  // Sample n of row y, unpacking sub-byte depths.
  const sample = (y, n) => {
    if (depth === 8) {
      return bytes[y * stride + n];
    }
    const bit = n * depth;
    const byte = bytes[y * stride + (bit >> 3)];
    return (byte >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
  };
  const scale = 255 / ((1 << depth) - 1);
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rgba;
      const s = (c) => sample(y, x * channels + c);
      if (colorType === 3) {
        const i = s(0);
        rgba = [
          ...palette.subarray(i * 3, i * 3 + 3),
          transparency?.[i] ?? 255,
        ];
      } else if (colorType === 0) {
        const g = s(0);
        const opaque = !transparency || transparency.readUInt16BE(0) !== g;
        rgba = [g * scale, g * scale, g * scale, opaque ? 255 : 0];
      } else if (colorType === 4) {
        rgba = [s(0), s(0), s(0), s(1)];
      } else if (colorType === 2) {
        rgba = [s(0), s(1), s(2), 255];
      } else {
        rgba = [s(0), s(1), s(2), s(3)];
      }
      if (rgba[3] !== 0) {
        data.set(rgba, (y * width + x) * 4);
      }
    }
  }
  return { width, height, data };
}

function unfilter(filter, left, up, upLeft) {
  switch (filter) {
    case 0:
      return 0;
    case 1:
      return left;
    case 2:
      return up;
    case 3:
      return (left + up) >> 1;
    case 4: {
      const p = left + up - upLeft;
      const pa = Math.abs(p - left);
      const pb = Math.abs(p - up);
      const pc = Math.abs(p - upLeft);
      return pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
    }
    default:
      throw new Error(`unknown PNG filter ${filter}`);
  }
}

function chunk(type, body) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  const typed = Buffer.concat([Buffer.from(type, "latin1"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, crc]);
}
