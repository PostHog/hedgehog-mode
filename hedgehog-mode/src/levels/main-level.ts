import { getRandomAccessoryCombo } from "../hedgehog-mode";
import { Game } from "../types";
import { Terrain } from "../items/Terrain";
import { Ground } from "../items/Ground";

export class MainLevel {
  constructor(private game: Game) {}

  load() {
    const terrain = new Terrain(this.game, {
      segmentWidth: 6,
      amplitude: 150,
      baseline: 40,
      frequency: 1.8,
      octaves: 5,
      persistence: 0.55,
    });
    this.game.world.addElement(terrain);

    window.addEventListener("resize", () => {
      terrain.rebuild(); // rebuild verts + body
      terrain.buildGraphics(); // redraw the dirt strip
    });

    this.game.world.elements.push(new Ground(this.game));
    const player = this.game.world.spawnPlayer();

    this.game.world.spawnRandomInventory();
    this.game.world.spawnRandomInventory();
    this.game.world.spawnRandomInventory();

    player.setPosition({
      x: 100,
      y: 100,
    });
  }
}
