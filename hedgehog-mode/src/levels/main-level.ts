import { getRandomAccessoryCombo } from "../hedgehog-mode";
import { Ground } from "../items/Ground";
import { Platform } from "../items/Platform";
import { Game } from "../types";

export class MainLevel {
  constructor(private game: Game) {}

  load() {
    this.game.world.elements.push(new Ground(this.game));
    const player = this.game.world.spawnPlayer();

    this.game.world.spawnHedgehog({
      id: "enemy-hedgehog-1",
      player: false,
      controls_enabled: false,
      ai_enabled: true,
      accessories: getRandomAccessoryCombo(),
    });

    this.game.world.spawnHedgehog({
      id: "enemy-hedgehog-2",
      player: false,
      controls_enabled: false,
      ai_enabled: true,
      accessories: getRandomAccessoryCombo(),
    });

    this.game.world.spawnHedgehogGhost({
      x: 100,
      y: 100,
    });

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
