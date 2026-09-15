// WorldFx owns the stage-level pyro effects: the two fixed layers effects
// render into, the warm colour grade while pyro mode is armed, and the
// screen shake. It is the single owner of `stage.filters` and
// `stage.position` so nothing else fights over them.
//
// Layers (bottom → top): `under` (scorch marks) → everything the engine
// already renders (actors, items) → `fx` (flames, embers, glow lines).
// `fx` is re-asserted to the top every frame because actor sprites are
// appended after it.

import { ColorMatrixFilter, Container } from "pixi.js";
import { GameElement, HedgehogModeInterface, UpdateTicker } from "../types";
import { prefersReducedMotion } from "../misc/motion";
import { EmberField } from "./EmberField";
import { ScorchLayer } from "./ScorchLayer";

export class WorldFx implements GameElement {
  isInteractive = false;
  isFlammable = false;
  // Marker so tests can find us without importing the class.
  readonly isWorldFx = true;

  readonly under = new Container();
  readonly fx = new Container();

  private grade = new ColorMatrixFilter();
  private gradeAmount = 0;
  private gradeTarget = 0;
  private gradeRate = 0; // per-second rate toward gradeTarget
  private shakeAmount = 0;
  private _emberField?: EmberField;
  private _scorchLayer?: ScorchLayer;

  constructor(private game: HedgehogModeInterface) {
    const stage = this.game.app.stage;
    stage.addChildAt(this.under, 0);
    stage.addChild(this.fx);
  }

  /** Shared ember/smoke pool, created on first use. */
  get emberField(): EmberField {
    if (!this._emberField) {
      this._emberField = new EmberField(this.game);
      this.game.elements.push(this._emberField);
    }
    return this._emberField;
  }

  /** Scorch marks under everything, created on first use. */
  get scorchLayer(): ScorchLayer {
    if (!this._scorchLayer) {
      this._scorchLayer = new ScorchLayer(this.game);
      this.game.elements.push(this._scorchLayer);
    }
    return this._scorchLayer;
  }

  /** Jump the stage by up to `px` for exactly this frame. */
  shake(px: number): void {
    if (prefersReducedMotion()) {
      return;
    }
    this.shakeAmount = Math.max(this.shakeAmount, px);
  }

  /** Ramp the warm colour grade to `amount` (0..1) over `durationS` seconds. */
  fadeGrade(amount: number, durationS: number): void {
    if (prefersReducedMotion()) {
      this.setGrade(0);
      return;
    }
    this.gradeTarget = amount;
    this.gradeRate =
      durationS > 0 ? Math.abs(amount - this.gradeAmount) / durationS : 0;
  }

  setGrade(amount: number): void {
    this.gradeTarget = amount;
    this.gradeRate = 0;
    this.gradeAmount = amount;
    this.applyGrade();
  }

  /** Current grade amount (0..1) — exposed for tests. */
  get gradeLevel(): number {
    return this.gradeAmount;
  }

  private applyGrade(): void {
    const stage = this.game.app.stage;
    if (this.gradeAmount <= 0) {
      stage.filters = null;
      return;
    }
    const a = this.gradeAmount;
    this.grade.reset();
    this.grade.contrast(1 + 0.12 * a, false);
    // Warm singe: a partial sepia tips everything toward amber.
    this.grade.sepia(false);
    stage.filters = [this.grade];
  }

  update(ticker: UpdateTicker): void {
    const stage = this.game.app.stage;

    // Advance the colour grade toward its target at the configured rate.
    if (this.gradeAmount !== this.gradeTarget) {
      const direction = this.gradeTarget > this.gradeAmount ? 1 : -1;
      this.gradeAmount += direction * this.gradeRate * ticker.deltaTime;
      const overshot =
        direction > 0
          ? this.gradeAmount > this.gradeTarget
          : this.gradeAmount < this.gradeTarget;
      if (overshot || this.gradeRate === 0) {
        this.gradeAmount = this.gradeTarget;
      }
      this.applyGrade();
    }

    if (this.shakeAmount > 0) {
      stage.position.set(
        (Math.random() - 0.5) * 2 * this.shakeAmount,
        (Math.random() - 0.5) * 2 * this.shakeAmount
      );
      this.shakeAmount = 0;
    } else if (stage.position.x !== 0 || stage.position.y !== 0) {
      stage.position.set(0, 0);
    }

    // New actor sprites append to the stage after us; keep fx on top.
    if (stage.children[stage.children.length - 1] !== this.fx) {
      stage.setChildIndex(this.fx, stage.children.length - 1);
    }
  }

  beforeUnload(): void {
    const stage = this.game.app.stage;
    stage.filters = null;
    stage.position.set(0, 0);
    stage.removeChild(this.under);
    stage.removeChild(this.fx);
    this.under.destroy({ children: true });
    this.fx.destroy({ children: true });
  }
}
