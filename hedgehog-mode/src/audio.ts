import { Howl } from "howler";

export enum ActionSound {
  JUMP = "jump",
  FIRE = "fire",
  EXPLOSION = "explosion",
  PICKUP = "pickup",
  DEATH = "death",
  HURT = "hurt",
  WALK = "walk",
  LAND = "land",
  PLAYER_SPAWN = "player_spawn",
  SPAWN = "spawn",
}

export const SOUND_MAP: Record<string, string[]> = {
  [ActionSound.JUMP]: ["jump.wav"],
  [ActionSound.FIRE]: ["pew.wav" /*, "pew_fast.wav"*/],
  [ActionSound.LAND]: ["oof.wav"],
  //   [ActionSound.EXPLOSION]: ["explosion.wav"],
  //   [ActionSound.PICKUP]: ["pickup.wav"],
  //   [ActionSound.DEATH]: ["death.wav"],
  //   [ActionSound.HURT]: ["hurt.wav"],
  [ActionSound.WALK]: ["walk.wav" /*, "walk_walk_walk_walk.wav"*/],
  //   [ActionSound.LAND]: ["land.wav"],
  //   [ActionSound.PLAYER_SPAWN]: ["player_spawn.wav"],
  //   [ActionSound.SPAWN]: ["spawn.wav"],
};

export class AudioManager {
  private sounds: { [key: string]: Howl[] } = {};

  private static instance: AudioManager;
  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  play(sound: ActionSound) {
    let sounds = this.sounds[sound];
    if (!sounds) {
      if (!SOUND_MAP[sound]) {
        return;
      }
      sounds = SOUND_MAP[sound].map((file) => {
        return new Howl({
          src: [`/assets/sounds/${file}`],
        });
      });
      this.sounds[sound] = sounds;
    }
    if (sounds) {
      const toBePlayed: Howl =
        sounds[Math.floor(Math.random() * sounds.length)];
      if (!toBePlayed.playing()) toBePlayed.play();
    }
  }
}
