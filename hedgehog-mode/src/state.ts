import { uniqueId } from "lodash";
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

    if (!this.state.options) {
      this.state.options = {
        id: "player",
        controls_enabled: true,
        player: true,
      };
    }

    this.setHedgehog(this.state.options);
    this.config.state = this.state;
  }

  getHedgehogActor(id: string): HedgehogActor | undefined {
    return this.hedgehogsById[id];
  }

  getPlayerHedgehogActor(): HedgehogActor | undefined {
    return this.hedgehogsById["player"];
  }

  getState() {
    return this.state;
  }

  setHedgehog(config: HedgehogActorOptions) {
    this.state.options = {
      ...this.state.options,
      ...config,
    };

    this.upsertHedgehog(this.state.options);

    this.state.options.friends?.forEach((friend) => {
      this.upsertHedgehog(friend);
    });

    // Remove all missing friends
    Object.keys(this.hedgehogsById).forEach((id) => {
      if (id === this.state.options.id) {
        return;
      }
      if (!this.state.options.friends?.find((f) => f.id === id)) {
        this.hedgehogsById[id]?.destroy?.();
        delete this.hedgehogsById[id];
      }
    });

    this.persistState();
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
    config.id = config.id || uniqueId("hedgehog-");

    const hedgehog = this.hedgehogsById[config.id];
    if (hedgehog) {
      hedgehog.updateOptions(config);
    } else {
      this.hedgehogsById[config.id] = this.game.spawnHedgehog(config);
    }
  }
}
