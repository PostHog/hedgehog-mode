import { sample } from "lodash";
import type { HedgehogActor } from "../Hedgehog";

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

    this.actor.walkSpeed = 0;

    clearTimeout(this.actionInterval);
    this.actionInterval = undefined;

    if (action) {
      this.actions[action]?.act();
    } else {
      sample(this.possibleActions)?.();
    }
    this.pause(1000);
  }
}
