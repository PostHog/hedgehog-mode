import { sample } from "../../misc/utils";
import type { HedgehogActor } from "../Hedgehog";

// How long to wait before looking again when the hog is in no state to act —
// mid-air, mid-swing, or being dragged around by the player.
const SETTLE_RETRY_MS = 250;

export class HedgehogActorAI {
  private actionInterval?: NodeJS.Timeout;
  private enabled = false;
  private possibleActions: (() => void)[] = [];

  constructor(private actor: HedgehogActor) {
    Object.values(this.actions).forEach((action) => {
      for (let i = 0; i < action.frequency; i++) {
        this.possibleActions.push(action.act);
      }
    });
  }

  actions: {
    [key: string]: {
      frequency: number;
      act: () => void;
    };
  } = {
    wait: {
      frequency: 3,
      act: () => {
        this.actor.walkSpeed = 0;
        this.pause(Math.random() * 1000 * 5);
      },
    },
    jump: {
      frequency: 1,
      act: () => {
        this.actor.jump();
      },
    },
    wave: {
      frequency: 1,
      act: () => {
        this.actor.walkSpeed = 0;
        this.actor.updateSprite("wave", {
          reset: true,
          onComplete: () => {
            this.actor.walkSpeed = 0;
            this.pause(1000);
          },
        });
      },
    },
    walk: {
      frequency: 10,
      act: () => {
        const direction = sample(["left", "right"] as const);
        this.actor.setDirection(direction);
        this.actor.walkSpeed = direction === "left" ? -1 : 1;
        this.pause(Math.random() * 1000 * 5);
      },
    },
  };

  enable(isEnabled: boolean = true): void {
    if (isEnabled === this.enabled) {
      return;
    }
    this.enabled = isEnabled;
    if (isEnabled) {
      this.run();
    } else {
      clearTimeout(this.actionInterval);
      this.actor.walkSpeed = 0;
    }
  }

  pause(time: number): void {
    clearTimeout(this.actionInterval);
    this.actionInterval = setTimeout(() => {
      this.run();
    }, time);
  }

  run(action?: string): void {
    if (!this.enabled) {
      return;
    }

    clearTimeout(this.actionInterval);
    this.actionInterval = undefined;

    // He's off the ground (falling, thrown, swinging) or in the player's grip.
    // Acting now is what made him suddenly stride or jump in mid-air, so leave
    // physics alone and check back once he's landed.
    if (!this.actor.isSettled) {
      this.pause(SETTLE_RETRY_MS);
      return;
    }

    this.actor.walkSpeed = 0;

    if (action) {
      this.actions[action]?.act();
    } else {
      sample(this.possibleActions)?.();
    }
    this.pause(1000);
  }
}
