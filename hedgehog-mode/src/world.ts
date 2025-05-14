import { uniqueId } from "lodash";
import { Actor } from "./actors/Actor";
import { HedgehogActor } from "./actors/Hedgehog";
import { HedgehogActorOptions } from "./actors/hedgehog/config";
import { Game, GameElement } from "./types";
import { Ground } from "./items/Ground";
import Matter from "matter-js";

export class GameWorld {
  elements: GameElement[] = []; // TODO: Type better

  constructor(private game: Game) {
    this.game = game;
  }

  load() {
    this.elements.push(new Ground(this.game));

    this.spawnHedgehog({
      id: "player",
      player: true,
      controls_enabled: true,
    });
  }

  addElement(element: GameElement) {
    this.elements.push(element);
  }

  public spawnActor(actor: Actor): void {
    this.elements.push(actor);
  }

  spawnHedgehog(options: HedgehogActorOptions | undefined): HedgehogActor {
    const actor = new HedgehogActor(
      this.game,
      options || {
        id: uniqueId("hedgehog-"),
      }
    );
    this.spawnActor(actor);
    return actor;
  }

  removeElement(element: GameElement): void {
    element.beforeUnload?.();
    if (element.rigidBody) {
      Matter.Composite.remove(this.game.engine.world, element.rigidBody);
    }
    if (element.sprite) {
      this.game.app.stage.removeChild(element.sprite);
    }
    this.elements = this.elements.filter((el) => el != element);
    this.game.log(`Removed element. Elements left: ${this.elements.length}`);
  }
}
