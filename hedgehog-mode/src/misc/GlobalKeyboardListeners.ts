import { range } from "lodash";
import { HedgehogActor } from "../actors/Hedgehog";
import { Game } from "../types";

export class GlobalKeyboardListeners {
  constructor(private game: Game) {
    this.setupKeyboardListeners();
  }

  private getPlayableHedgehog(): HedgehogActor {
    return this.game.elements.find(
      (element) => element instanceof HedgehogActor && element.isInteractive
    ) as HedgehogActor;
  }

  private getAllHedgehogs(): HedgehogActor[] {
    return this.game.elements.filter(
      (element) => element instanceof HedgehogActor
    ) as HedgehogActor[];
  }

  setupKeyboardListeners(): () => void {
    const lastKeys: string[] = [];

    const secretMap: {
      keys: string[];
      action: () => void;
    }[] = [
      {
        keys: ["c", "h", "a", "o", "s"],
        action: async () => {
          for (const _ of range(10)) {
            this.game.spawnHedgehog();
            await new Promise((r) => setTimeout(r, 100));
          }
        },
      },
      {
        keys: ["s", "p", "a", "w", "n"],
        action: () => this.game.spawnHedgehog(),
      },
      {
        keys: ["h", "e", "d", "g", "e", "h", "o", "g"],
        action: () => this.game.spawnHedgehog(),
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
