import { sample } from "lodash";
import type { HedgehogActor } from "../Hedgehog";
import { Inventory } from "../../items/Inventory";
import { PUNCH_RANGE_X } from "./punch";
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

    const itemsWithDistance = inventoryItems.map((item) => {
      return {
        item,
        distance: Math.abs(item.rigidBody!.position.x - actorX),
      };
    });

    const nearestInventoryItem =
      itemsWithDistance.length > 0
        ? itemsWithDistance.reduce((prev, current) => {
            return prev.distance < current.distance ? prev : current;
          }, itemsWithDistance[0])
        : null;

    const distance = Math.abs(playerX - actorX);
    const directionToPlayer = actorX > playerX ? "left" : "right";

    if (this.actor.inventories.length > 0) {
      // If we have a weapon, move towards the player and shoot them
      this.actor.setDirection(directionToPlayer);
      if (distance < 200) {
        this.actor.fireWeapon(player.rigidBody!.position);
        this.actor.walkSpeed = 0;
      } else {
        this.actor.walkSpeed =
          directionToPlayer === "left" ? -WALK_SPEED : WALK_SPEED;
      }
    } else if (nearestInventoryItem) {
      // If we don't have a weapon, move towards the nearest weapon,
      // punching the player if they get in reach on the way
      if (distance < PUNCH_RANGE_X) {
        this.actor.fireWeapon(player.rigidBody!.position);
      }
      const direction =
        nearestInventoryItem.item.rigidBody!.position.x < actorX
          ? "left"
          : "right";
      this.actor.setDirection(direction);
      this.actor.walkSpeed = direction === "left" ? -WALK_SPEED : WALK_SPEED;
    } else {
      // No weapons anywhere: chase the player and punch them
      this.actor.setDirection(directionToPlayer);
      if (distance < PUNCH_RANGE_X) {
        this.actor.walkSpeed = 0;
        this.actor.fireWeapon(player.rigidBody!.position);
      } else {
        this.actor.walkSpeed =
          directionToPlayer === "left" ? -WALK_SPEED : WALK_SPEED;
        if (Math.random() < 0.25) {
          this.actor.jump();
        }
      }
    }
    // If we don't have a weapon, move towards the nearest weapon
    // If we do have a weapon

    this.pause(1000);
  }
}
