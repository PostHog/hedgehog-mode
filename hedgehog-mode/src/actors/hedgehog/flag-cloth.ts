import { Mesh, MeshGeometry, Texture } from "pixi.js";
import { FLAG_CLOTH_BANDS } from "../../sprites/flag-shear";

/** Floats per quad: four corners of (x, y). */
const QUAD = 8;
/** How far right the bottom band sits, i.e. how wide the hoist staircase is. */
const MAX_SHIFT = Math.max(...FLAG_CLOTH_BANDS.map(({ shift }) => shift));

/**
 * A flag's cloth: sheared to hang off the leaning pole, and waving.
 *
 * Built as one quad per column per {@link FLAG_CLOTH_BANDS} band rather than a
 * `MeshPlane`. A plane shares vertices between neighbouring columns, so a
 * whole-pixel ripple would tilt every column across a pixel boundary and
 * smear the art; separate quads let each band slide, and each screen column
 * bob, by whole pixels only.
 */
export class FlagCloth extends Mesh {
  private readonly columns: number;
  private readonly rows: number;
  /** Positions with no ripple applied; each frame offsets a copy's y. */
  private readonly rest: Float32Array;
  private ripple: number[] = [];

  constructor(texture: Texture) {
    const columns = texture.frame.width;
    const rows = texture.frame.height;
    const quads = columns * FLAG_CLOTH_BANDS.length;
    const positions = new Float32Array(quads * QUAD);
    const indices = new Uint32Array(quads * 6);
    for (let i = 0; i < columns; i++) {
      FLAG_CLOTH_BANDS.forEach(({ row, height, shift }, b) => {
        const quad = i * FLAG_CLOTH_BANDS.length + b;
        const x = i + shift;
        positions.set(
          [x, row, x + 1, row, x + 1, row + height, x, row + height],
          quad * QUAD
        );
        const v = quad * 4;
        indices.set([v, v + 1, v + 2, v, v + 2, v + 3], quad * 6);
      });
    }

    const geometry = new MeshGeometry({
      positions: positions.slice(),
      uvs: new Float32Array(quads * QUAD),
      indices,
    });
    // 720 vertices is way over pixi's auto-batching limit of 100, and an unbatched mesh
    // takes its own shader path. Batch it like every other sprite.
    geometry.batchMode = "batch";

    super({ geometry, texture });
    this.columns = columns;
    this.rows = rows;
    this.rest = positions;
    this.setMirrored(false);
  }

  /**
   * Show the picture back to front, for when the whole flag is mirrored with
   * a left-facing hedgehog: the cloth stays hoisted at the pole, but reads
   * the right way round.
   */
  setMirrored(mirrored: boolean): void {
    const uvs = this.geometry.uvs;
    for (let i = 0; i < this.columns; i++) {
      const column = mirrored ? this.columns - 1 - i : i;
      const u0 = column / this.columns;
      const u1 = (column + 1) / this.columns;
      FLAG_CLOTH_BANDS.forEach(({ row, height }, b) => {
        const v0 = row / this.rows;
        const v1 = (row + height) / this.rows;
        uvs.set(
          [u0, v0, u1, v0, u1, v1, u0, v1],
          (i * FLAG_CLOTH_BANDS.length + b) * QUAD
        );
      });
    }
    this.geometry.getBuffer("aUV").update();
  }

  /**
   * Ripple the cloth: still at the pole, widest at the free end.
   *
   * The ripple is per *screen* column, not per column of the picture: the
   * shear slides picture columns sideways band by band, so one screen column
   * stacks pieces of several, and bobbing those apart would tear holes in it.
   * The columns the hoist staircase spans hold still, keeping it on the pole.
   */
  wave(phase: number): void {
    const ripple = Array.from({ length: this.columns + MAX_SHIFT }, (_, x) => {
      const damping = Math.min(1, Math.max(0, (x - MAX_SHIFT) / 6));
      return Math.round(Math.sin(phase - x * 0.35) * 1.5 * damping);
    });
    // Whole pixels only, so most frames nothing moves: skip the re-upload.
    if (ripple.every((dy, x) => dy === this.ripple[x])) {
      return;
    }
    this.ripple = ripple;

    const positions = this.geometry.positions;
    for (let i = 0; i < this.columns; i++) {
      FLAG_CLOTH_BANDS.forEach(({ shift }, b) => {
        const dy = ripple[i + shift];
        const start = (i * FLAG_CLOTH_BANDS.length + b) * QUAD;
        for (let k = start + 1; k < start + QUAD; k += 2) {
          positions[k] = this.rest[k] + dy;
        }
      });
    }
    this.geometry.getBuffer("aPosition").update();
  }
}
