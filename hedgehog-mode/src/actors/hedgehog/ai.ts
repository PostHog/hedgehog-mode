import { sample } from "lodash";
import type { HedgehogActor } from "../Hedgehog";
import { Inventory } from "../../items/Inventory";
import { Game } from "../../types";

const WALK_SPEED = 2;

export class HedgehogActorAI {
  private actionInterval?: NodeJS.Timeout;
  private enabled = false;
  private possibleActions: (() => void)[] = [];

  constructor(
    private game: Game,
    private actor: HedgehogActor
  ) {
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

    const player = this.game.getPlayer();
    if (!player) {
      return;
    }

    const playerX = player.rigidBody!.position.x;
    const actorX = this.actor.rigidBody!.position.x;

    // clearTimeout(this.actionInterval);
    // this.actionInterval = undefined;

    // if (action) {
    //   this.actions[action]?.act();
    // } else {
    //   sample(this.possibleActions)?.();
    // }
    // this.pause(1000);

    const inventoryItems = this.game.world.elements.filter(
      (e) => e instanceof Inventory
    );

    const nearestInventoryItem =
      inventoryItems.length > 0
        ? inventoryItems.reduce((prev, current) => {
            return prev.rigidBody!.position.x < current.rigidBody!.position.x
              ? prev
              : current;
          }, inventoryItems[0])
        : null;

    if (!nearestInventoryItem) {
      // If there are no weapons, run away from the player and jump sometimes
      const direction = actorX < playerX ? "left" : "right";
      this.actor.setDirection(direction);
      this.actor.walkSpeed = direction === "left" ? -1 : 1;

      if (Math.random() < 0.5) {
        this.actor.jump();
      }
    } else if (this.actor.inventories.length === 0 && nearestInventoryItem) {
      // If we don't have a weapon, move towards the nearest weapon
      const direction =
        nearestInventoryItem.rigidBody!.position.x < actorX ? "left" : "right";
      this.actor.setDirection(direction);
      this.actor.walkSpeed = direction === "left" ? -WALK_SPEED : WALK_SPEED;
    } else {
      // If we have a weapon, move towards the player and shoot them
      const direction = actorX > playerX ? "left" : "right";
      const distance = Math.abs(playerX - actorX);

      if (distance < 200) {
        this.actor.fireWeapon(player.rigidBody!.position);
        this.actor.setDirection(direction);
        this.actor.walkSpeed = 0;
      } else {
        this.actor.setDirection(direction);
        this.actor.walkSpeed = direction === "left" ? -WALK_SPEED : WALK_SPEED;
      }
    }
    // If we don't have a weapon, move towards the nearest weapon
    // If we do have a weapon

    this.pause(1000);
  }
}
