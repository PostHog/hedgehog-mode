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

  constructor(
    private game: HedgeHogMode,
    private config: HedgehogModeConfig
  ) {
    this.loadState();
  }

  setState(state: HedgehogModeGameState) {
    this.config.state = state;

    if (state.player) {
      this.game.spawnHedgehog(state.player);
    }

    // Create the number of hedgehogs specified in the config
  }

  upsertHedgehog(config: HedgehogActorOptions) {
    config.id =
      config.id || "hedgehog-" + Math.random().toString(36).substring(2, 15);
    const hedgehog = this.hedgehogsById[config.id];
    if (hedgehog) {
      //   hedgehog.
    } else {
      this.hedgehogsById[config.id] = this.game.spawnHedgehog(config);
    }
  }

  loadState() {
    // We try and parse the state and use it to sync the game. If it isn't set we just create a new one

    if (this.config.state) {
      this.setState(this.config.state);
    } else {
      this.setState({
        player: {
          id: "player",
          controls_enabled: true,
          player: true,
        },
        hedgehogs: [],
      });
    }
  }
}
