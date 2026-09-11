// PyroRig is the flamethrower the hedgehog draws when pyro mode starts:
// tank on his back, hose, nozzle in front, and a pilot light that flickers
// at the tip while armed. Drawn with Graphics in the hog's chunky style and
// parented to the actor sprite, so it mirrors and scales with him for free.
// Version-1 art; real PNG frames come later through texturepacker.

import gsap from "gsap";
import { Container, Graphics, Sprite } from "pixi.js";
import { PyroTextures } from "../misc/textures";
import type { HedgehogActor } from "../actors/Hedgehog";
import { Vec } from "../misc/geometry";

// Nozzle tip in actor-sprite space (facing right), tuned to the default hog.
const NOZZLE_LOCAL: Vec = { x: 22, y: -6 };

export class PyroRig {
  readonly container = new Container();
  private readonly pilot: Sprite;
  private time = 0;

  constructor(
    private actor: HedgehogActor,
    textures: PyroTextures
  ) {
    // Tank on his back.
    const tank = new Graphics();
    tank
      .roundRect(-10, -16, 10, 16, 2)
      .fill({ color: 0xc0392b })
      .roundRect(-10, -16, 10, 4, 2)
      .fill({ color: 0x922b21 });

    // Hose from tank to nozzle.
    const hose = new Graphics();
    hose
      .moveTo(-4, -8)
      .lineTo(6, -4)
      .lineTo(14, -6)
      .stroke({ width: 2, color: 0x2c3e50 });

    // Nozzle.
    const nozzle = new Graphics();
    nozzle
      .rect(12, -8, 9, 4)
      .fill({ color: 0x7f8c8d })
      .rect(21, -8, 2, 4)
      .fill({ color: 0x1c2833 });

    this.pilot = new Sprite(textures.disc);
    this.pilot.anchor.set(0.5);
    this.pilot.blendMode = "add";
    this.pilot.tint = 0x66aaff;
    this.pilot.scale.set(0.3);
    this.pilot.position.set(NOZZLE_LOCAL.x, NOZZLE_LOCAL.y);
    this.pilot.visible = false;

    this.container.addChild(tank, hose, nozzle, this.pilot);
  }

  /** Snap onto the hog with an elastic scale-in, then light the pilot. */
  attach(): void {
    this.container.scale.set(0);
    this.actor.sprite!.addChild(this.container);
    gsap.to(this.container.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      ease: "elastic.out",
      onComplete: () => {
        this.pilot.visible = true;
      },
    });
  }

  /** Gutter the pilot, scale off, remove. */
  async detach(): Promise<void> {
    // Three quick flickers, then out.
    await new Promise<void>((resolve) => {
      let flickers = 0;
      const flicker = () => {
        this.pilot.alpha = this.pilot.alpha > 0.4 ? 0.1 : 0.8;
        flickers++;
        if (flickers >= 6) {
          this.pilot.visible = false;
          gsap.to(this.container.scale, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
              this.actor.sprite?.removeChild(this.container);
              resolve();
            },
          });
        } else {
          setTimeout(flicker, 60);
        }
      };
      flicker();
    });
  }

  update(dt: number): void {
    this.time += dt;
    if (this.pilot.visible) {
      this.pilot.alpha = 0.5 + 0.5 * Math.sin(this.time * 40);
    }
  }

  /** Nozzle tip in world (screen) space — handles flip and scale. */
  nozzleWorldPosition(): Vec {
    return this.actor.sprite!.toGlobal({
      x: NOZZLE_LOCAL.x,
      y: NOZZLE_LOCAL.y,
    });
  }

  destroy(): void {
    gsap.killTweensOf(this.container.scale);
    this.actor.sprite?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
