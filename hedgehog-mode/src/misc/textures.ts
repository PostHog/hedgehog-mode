// Runtime-generated textures for the pyro effects. Generated once per
// renderer and cached, so there is no art dependency and nothing to load.
// Plain Graphics + generateTexture: no shaders, no `new Function`, so these
// survive the browser extension's strict CSP.

import { Graphics, Renderer, Texture } from "pixi.js";

export type PyroTextures = {
  /** Soft radial disc — flame bodies, light glow, smoke. */
  disc: Texture;
  /** Small square — embers. */
  square: Texture;
  /** Soft noise field — heat-shimmer displacement source. */
  noise: Texture;
};

const cache = new WeakMap<Renderer, PyroTextures>();

function makeDisc(renderer: Renderer, radius: number): Texture {
  const graphics = new Graphics();
  const steps = 8;
  for (let i = steps; i >= 1; i--) {
    const k = i / steps;
    graphics.circle(0, 0, radius * k).fill({
      color: 0xffffff,
      alpha: (1 - k) * (1 - k) * 0.35 + 0.05,
    });
  }
  return renderer.generateTexture(graphics);
}

function makeSquare(renderer: Renderer, size: number): Texture {
  const graphics = new Graphics();
  graphics.rect(-size / 2, -size / 2, size, size).fill({ color: 0xffffff });
  return renderer.generateTexture(graphics);
}

function makeNoise(renderer: Renderer, size: number): Texture {
  // A scatter of soft discs reads as smooth noise once the displacement
  // filter scrolls it. Deliberately simple: no filter passes, no shaders.
  const graphics = new Graphics();
  for (let i = 0; i < 40; i++) {
    const r = 6 + Math.random() * 20;
    graphics
      .circle(Math.random() * size, Math.random() * size, r)
      .fill({ color: 0x808080, alpha: 0.25 + Math.random() * 0.5 });
  }
  const texture = renderer.generateTexture(graphics);
  if (texture?.source) {
    texture.source.addressMode = "repeat";
  }
  return texture;
}

export function getPyroTextures(renderer: Renderer): PyroTextures {
  const cached = cache.get(renderer);
  if (cached) {
    return cached;
  }
  const textures: PyroTextures = {
    disc: makeDisc(renderer, 32),
    square: makeSquare(renderer, 4),
    noise: makeNoise(renderer, 128),
  };
  cache.set(renderer, textures);
  return textures;
}
