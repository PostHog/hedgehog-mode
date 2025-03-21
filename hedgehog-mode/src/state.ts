import { HedgehogActor } from "./actors/Hedgehog";
import type {
  HedgehogActorOptions,
  HedgeHogMode,
  HedgehogModeConfig,
  HedgehogModeGameState,
} from "./hedgehog-mode";

/**
 * Responsible for storing the state of changes to the game, persisting to local storage and responding out
 */
export class GameStateManager {
  private hedgehogsById: Record<string, HedgehogActor> = {};
  private state: HedgehogModeGameState;

  constructor(
    private game: HedgeHogMode,
    private config: HedgehogModeConfig
  ) {
    this.state = this.config.state ??
      this.getPersistedState() ?? {
        hedgehogsById: {},
      };

    if (!("hedgehogsById" in this.state)) {
      // Looks like bad state - reset it
      this.state = {
        hedgehogsById: {},
      };
    }

    if (Object.keys(this.state.hedgehogsById).length === 0) {
      this.state.hedgehogsById = {
        player: {
          id: "player",
          controls_enabled: true,
          player: true,
        },
      };
    }

    Object.keys(this.state.hedgehogsById).forEach((id) => {
      this.upsertHedgehog(this.state.hedgehogsById[id]);
    });

    this.config.state = this.state;
    this.persistState();
  }

  getState() {
    return this.state;
  }

  getNumberOfHedgehogs() {
    return Object.values(this.state.hedgehogsById).length;
  }

  setHedgehog(config: HedgehogActorOptions) {
    // Find the relevant hedgehog in the state and update it

    this.state.hedgehogsById[config.id] = config;
    this.upsertHedgehog(config);
    this.persistState();
  }

  removeHedgehog(id: string) {
    const hedgehog = this.state.hedgehogsById[id];
    if (hedgehog) {
      if (hedgehog.player) {
        throw new Error("Cannot remove player hedgehog");
      }
      delete this.state.hedgehogsById[id];
      this.hedgehogsById[id]?.destroy?.();
      delete this.hedgehogsById[id];
      this.persistState();
    }
  }

  private persistState() {
    this.config.state = this.state;
    localStorage.setItem("@hedgehog-mode/state", JSON.stringify(this.state));
  }

  private getPersistedState() {
    const state = localStorage.getItem("@hedgehog-mode/state");
    return state ? JSON.parse(state) : null;
  }

  private upsertHedgehog(config: HedgehogActorOptions) {
    config.id =
      config.id || "hedgehog-" + Math.random().toString(36).substring(2, 15);

    const hedgehog = this.hedgehogsById[config.id];
    if (hedgehog) {
      hedgehog.updateOptions(config);
    } else {
      this.hedgehogsById[config.id] = this.game.spawnHedgehog(config);
    }
  }
}
