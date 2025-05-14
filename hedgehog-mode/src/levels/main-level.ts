import { Ground } from "../items/Ground";
import { Platform } from "../items/Platform";
import { Game } from "../types";

export class MainLevel {
  constructor(private game: Game) {}

  load() {
    this.game.world.elements.push(new Ground(this.game));
    const player = this.game.world.spawnPlayer();

    player.setPosition({
      x: 100,
      y: 100,
    });

    for (let i = 0; i < 10; i++) {
      this.game.world.spawnPlatform(
        new Platform(this.game, {
          x: 100 + i * 200,
          y: window.innerHeight - 100,
          width: 100,
          height: 50,
        })
      );
    }
  }
}
