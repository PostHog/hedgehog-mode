import { range, sample, uniqueId } from "lodash";
import { HedgehogModeInterface } from "../types";
import {
  getRandomAccessoryCombo,
  HedgehogActorColorOptions,
} from "../actors/hedgehog/config";

export class GlobalKeyboardListeners {
  constructor(private game: HedgehogModeInterface) {
    this.setupKeyboardListeners();
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
        action: () => this.game.getPlayableHedgehog()?.setOnFire(),
      },
      {
        keys: ["f", "i", "r", "e"],
        action: () => this.game.getPlayableHedgehog()?.setOnFire(),
      },

      {
        keys: ["h", "e", "l", "l", "o"],
        action: () =>
          this.game.getAllHedgehogs().forEach((hedgehog) => {
            hedgehog.updateSprite("wave");
          }),
      },

      {
        keys: ["h", "e", "a", "t", "m", "a", "p", "s"],
        action: () =>
          this.game.getAllHedgehogs().forEach((hedgehog) => {
            hedgehog.setOnFire();
          }),
      },

      {
        keys: ["s", "p", "i", "d", "e", "r", "h", "o", "g"],
        action: () => {
          this.game.getPlayableHedgehog()?.updateOptions({
            skin: "spiderhog",
          });
        },
      },
      {
        keys: ["r", "o", "b", "o", "h", "o", "g"],
        action: () => {
          this.game.getPlayableHedgehog()?.updateOptions({
            skin: "robohog",
          });
        },
      },
      {
        keys: ["c", "h", "e", "a", "t", "c", "o", "d", "e", "s"],
        action: () => {
          this.game.getPlayableHedgehog()?.interface.triggerCheatSheet();
        },
      },
      {
        keys: ["r", "a", "i", "n", "b", "o", "w"],
        action: () => {
          this.game.getAllHedgehogs().forEach((hedgehog) => {
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
          const player = this.game.getPlayableHedgehog();
          if (!player) {
            return;
          }

          if (player.sprite!.scale.y > 1) {
            // Make it even bigger if bigger
            player.setScale(player.sprite!.scale.y + 1);
          } else {
            player.setScale(2);
          }
        },
      },
      {
        // tiny
        keys: ["t", "i", "n", "y"],
        action: () => {
          const player = this.game.getPlayableHedgehog();
          if (!player) {
            return;
          }

          if (player.sprite!.scale.y < 1) {
            // Make it smaller if small
            player.setScale(player.sprite!.scale.y - 0.1);
            return;
          } else {
            player.setScale(0.5);
          }
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
      {
        keys: ["d", "e", "a", "t", "h"],
        action: async () => {
          for (const hedgehog of this.game.getAllHedgehogs()) {
            hedgehog.destroy();
            await new Promise((r) => setTimeout(r, 50));
          }
        },
      },
      {
        keys: ["g", "h", "o", "s", "t"],
        action: () => {
          const player = this.game.getPlayableHedgehog();
          if (!player) {
            return;
          }
          player.updateOptions({ skin: "ghost" });
          player.updateSprite("idle");
        },
      },
      {
        // konami code
        keys: [
          "arrowup",
          "arrowup",
          "arrowdown",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "arrowleft",
          "arrowright",
          "b",
          "a",
        ],
        action: async () => {
          this.game.getPlayableHedgehog()?.interface.triggerMessages([
            {
              words: [
                {
                  text: "nerd",
                  style: { fontWeight: "bold", fontSize: "1.2em" },
                },
              ],
            },
            {
              words: ["now you've asked for it"],
            },
            {
              words: ["let's see how many hedgehogs your laptop can manage..."],
            },
          ]);

          for (const _ of range(10000)) {
            spawnHedgehog();
            await new Promise((r) => setTimeout(r, 100));
          }
        },
      },
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
