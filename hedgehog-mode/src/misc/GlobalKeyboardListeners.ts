import { range, sample, uniqueId } from "lodash";
import { HedgehogActor } from "../actors/Hedgehog";
import { Game } from "../types";
import {
  getRandomAccessoryCombo,
  HedgehogActorColorOptions,
} from "../actors/hedgehog/config";

export class GlobalKeyboardListeners {
  constructor(private game: Game) {
    this.setupKeyboardListeners();
  }

  private getPlayableHedgehog(): HedgehogActor {
    return this.game.world.elements.find(
      (element) => element instanceof HedgehogActor && element.options.player
    ) as HedgehogActor;
  }

  private getAllHedgehogs(): HedgehogActor[] {
    return this.game.world.elements.filter(
      (element) => element instanceof HedgehogActor
    ) as HedgehogActor[];
  }

  setupKeyboardListeners(): () => void {
    const lastKeys: string[] = [];

    const spawnHedgehog = () =>
      this.game.spawnHedgehog({
        id: uniqueId("hedgehog-"),
        controls_enabled: false,
        accessories: getRandomAccessoryCombo(),
        color: sample(HedgehogActorColorOptions),
      });

    const secretMap: {
      keys: string[];
      action: () => void;
    }[] = [
      {
        keys: ["c", "h", "a", "o", "s"],
        action: async () => {
          for (const _ of range(10)) {
            spawnHedgehog();
            await new Promise((r) => setTimeout(r, 100));
          }
        },
      },
      {
        keys: ["s", "p", "a", "w", "n"],
        action: () => spawnHedgehog(),
      },
      {
        keys: ["h", "e", "d", "g", "e", "h", "o", "g"],
        action: () => spawnHedgehog(),
      },
      {
        keys: ["f", "f", "f"],
        action: () => this.getPlayableHedgehog().setOnFire(),
      },
      {
        keys: ["f", "i", "r", "e"],
        action: () => this.getPlayableHedgehog().setOnFire(),
      },

      {
        keys: ["h", "e", "l", "l", "o"],
        action: () =>
          this.getAllHedgehogs().forEach((hedgehog) => {
            hedgehog.updateSprite("wave");
          }),
      },

      {
        keys: ["h", "e", "a", "t", "m", "a", "p", "s"],
        action: () =>
          this.getAllHedgehogs().forEach((hedgehog) => {
            hedgehog.setOnFire();
          }),
      },

      {
        keys: ["s", "p", "i", "d", "e", "r", "h", "o", "g"],
        action: () => {
          this.getPlayableHedgehog().updateOptions({
            skin: "spiderhog",
          });
        },
      },
      {
        keys: ["c", "h", "e", "a", "t", "c", "o", "d", "e", "s"],
        action: () => {
          this.getPlayableHedgehog().interface.triggerCheatSheet();
        },
      },
      {
        keys: ["r", "a", "i", "n", "b", "o", "w"],
        action: () => {
          this.getAllHedgehogs().forEach((hedgehog) => {
            hedgehog.updateOptions({
              color: "rainbow",
            });
          });
        },
      },
      {
        // giant
        keys: ["g", "i", "a", "n", "t"],
        action: () => {
          this.getPlayableHedgehog().setScale(2);
        },
      },
      {
        // tiny
        keys: ["t", "i", "n", "y"],
        action: () => {
          this.getPlayableHedgehog().setScale(0.5);
        },
      },
      {
        keys: ["s", "l", "o", "w"],
        action: () => {
          this.game.setSpeed(
            this.game.engine.timing.timeScale === 0.5 ? 1 : 0.5
          );
        },
      },
      {
        keys: ["f", "a", "s", "t"],
        action: () => {
          this.game.setSpeed(this.game.engine.timing.timeScale === 2 ? 1 : 2);
        },
      },
      // {
      // // konami code
      //   keys: [
      //     "arrowup",
      //     "arrowup",
      //     "arrowdown",
      //     "arrowdown",
      //     "arrowleft",
      //     "arrowright",
      //     "arrowleft",
      //     "arrowright",
      //     "b",
      //     "a",
      //   ],
      //   action: () => {
      //     this.getPlayableHedgehog().jump();
      //     // this.gravity = -2;

      //     // lemonToast.info("I must leave. My people need me!");
      //     // setTimeout(() => {
      //     //   this.gravity = GRAVITY_PIXELS;
      //     // }, 2000);
      //   },
      // },
    ];

    const keyDownListener = (e: KeyboardEvent): void => {
      const key = e.key.toLowerCase();

      lastKeys.push(key);
      if (lastKeys.length > 20) {
        lastKeys.shift();
      }

      secretMap.forEach((secret) => {
        if (
          lastKeys.slice(-secret.keys.length).join("") === secret.keys.join("")
        ) {
          secret.action();
          lastKeys.splice(-secret.keys.length);
        }
      });
    };

    window.addEventListener("keydown", keyDownListener);

    return () => {
      window.removeEventListener("keydown", keyDownListener);
    };
  }
}
