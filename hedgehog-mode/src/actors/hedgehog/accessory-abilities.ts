import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import type { HedgehogSkinAbility } from "./abilities";
import type { HedgehogActorAccessoryOption } from "./config";
import { getAccessoryInfo } from "./config";

/**
 * Owns the abilities granted by whatever a hedgehog is wearing. Diffs rather
 * than rebuilds, so an unrelated option change can't kill a firework mid-burn.
 */
export class HedgehogAccessoryAbilities {
  private abilities = new Map<
    HedgehogActorAccessoryOption,
    HedgehogSkinAbility
  >();

  constructor(
    private actor: HedgehogActor,
    private game: HedgehogModeInterface
  ) {}

  /** Reconcile the built abilities with what the hog is wearing right now. */
  sync(): void {
    const worn = new Set(this.actor.options.accessories ?? []);

    this.abilities.forEach((ability, accessory) => {
      if (!worn.has(accessory)) {
        ability.destroy();
        this.abilities.delete(accessory);
      }
    });

    worn.forEach((accessory) => {
      if (this.abilities.has(accessory)) {
        return;
      }
      const createAbility = getAccessoryInfo(accessory).createAbility;
      if (!createAbility) {
        return;
      }
      this.abilities.set(
        accessory,
        createAbility(this.actor, this.game, accessory)
      );
    });
  }

  /** Trigger every worn ability. Called from the actor's `f` key handler. */
  fire(): void {
    this.abilities.forEach((ability) => ability.fire?.());
  }

  destroy(): void {
    this.abilities.forEach((ability) => ability.destroy());
    this.abilities.clear();
  }
}
