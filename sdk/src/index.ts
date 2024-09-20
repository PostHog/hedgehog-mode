import {
  AnimatedSprite,
  Application,
  Assets,
  Spritesheet,
  Texture,
} from "pixi.js";
import sprites from "../assets/sprites.json";

export type HedgeHogModeConfig = {
  assetsUrl: string;
};

type AvailableSprites = keyof typeof sprites.frames;
type AvailableAnimations = keyof typeof sprites.animations;

const createAnimatedSprite = (
  spritesheet: Spritesheet,
  animation: AvailableAnimations
): AnimatedSprite => {
  const sprite = new AnimatedSprite(spritesheet.animations[animation]);
  sprite.animationSpeed = 0.25;
  return sprite;
};

export class HedgeHogMode {
  app: Application;
  spritesheet: Spritesheet;

  constructor(private options: HedgeHogModeConfig) {
    console.log("HedgeHogMode constructor");
  }

  assetUrl(name: string): string {
    return `${this.options.assetsUrl}/${name}`;
  }

  async render(ref: HTMLDivElement): Promise<void> {
    // Create the application helper and add its render target to the page
    this.app = new Application();

    await this.app.init({
      backgroundAlpha: 0.2,
      resizeTo: window,
    });
    document.body.appendChild(this.app.canvas);

    console.log(sprites, this.assetUrl("sprites.png"));
    const texture = await Assets.load(this.assetUrl("sprites.png"));

    console.log(texture);
    this.spritesheet = new Spritesheet(texture, sprites);

    await this.spritesheet.parse();

    // spritesheet is ready to use!
    const anim = createAnimatedSprite(
      this.spritesheet,
      "skins/default/action/tile"
    );
    anim.play();
    anim.anchor.set(0.5);
    anim.x = this.app.screen.width / 2;
    anim.y = this.app.screen.height / 2;

    this.app.stage.addChild(anim);

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    this.app.ticker.add((ticker) => {
      elapsed += ticker.deltaTime;
      // anim.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
    });

    ref.appendChild(this.app.canvas);
  }
}
