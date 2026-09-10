import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import type { HedgehogSkinAbility } from "./abilities";
import type { HedgehogActorAccessoryOption } from "./config";
// Split from the type import above on purpose: the test mocks this module, and
// a mixed value/type import can leave the type binding dangling at runtime.
import { getAccessoryAbilityFactory } from "./config";

/**
 * Owns the abilities granted by whatever a hedgehog is currently wearing.
 *
 * Mirrors the guard `syncSkinAbility()` uses for skins. `updateOptions()` runs
 * on every option change, including ones with nothing to do with accessories
 * (colour, AI toggle, drag), so a naive rebuild would tear down a firework
 * mid-burn. {@link sync} therefore diffs the worn set against what is already
 * built and leaves anything unchanged alone.
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
      const createAbility = getAccessoryAbilityFactory(accessory);
      if (!createAbility) {
        return;
      }
      this.abilities.set(accessory, createAbility(this.actor, this.game));
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
