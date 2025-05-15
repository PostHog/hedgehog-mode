import { getRandomAccessoryCombo } from "../hedgehog-mode";
import { Platform } from "../items/Platform";
import { Game } from "../types";
import { Terrain } from "../items/Terrain";
import {Ground} from "../items/Ground";

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
      this.game.world.addElement(
        new Platform(this.game, {
          x: 100 + i * 250,
          y: window.innerHeight - 300,
          width: 200,
          height: 50,
        })
      );
    }
  }
}
