import Matter from "matter-js";
import { AnimatedSprite } from "pixi.js";
import { AvailableAnimations } from "../sprites/sprites";
import { Game, GameElement } from "../types";

export class Actor implements GameElement {
  public sprite: AnimatedSprite;
  public isPointerOver = false;
  public isDragging = false;
  protected currentAnimation: AvailableAnimations;
  protected connectedElements: GameElement[] = [];

  rigidBody: Matter.Body;
  isInteractive = false;
  scale = 1;

  hitBoxModifier = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  constructor(
    protected game: Game,
    private rigidBodyOptions: Matter.IBodyDefinition = {}
  ) {}

  protected loadSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite = new AnimatedSprite(
      this.game.spritesManager.getAnimatedSpriteFrames(animation)
    );
    this.sprite.animationSpeed = 0.5;

    this.maybeLoadRigidBody();

    // Setup a bunch of listeners for the sprite
    this.sprite.on("pointerover", () => {
      this.isPointerOver = true;
    });
    this.sprite.on("pointerout", () => {
      if (!this.isDragging) {
        this.isPointerOver = false;
      }
    });

    this.sprite.eventMode = "static";
    this.sprite.play();
    this.sprite.anchor.set(0.5);
    this.sprite.x = this.rigidBody.position.x;
    this.sprite.y = this.rigidBody.position.y;
    this.game.app.stage.addChild(this.sprite);

    this.setupPointerEvents();
  }

  private maybeLoadRigidBody(): void {
    if (this.rigidBody) {
      return;
    }

    const playerOptions: Matter.IBodyDefinition = {
      density: 0.001,
      friction: 0.7,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.5,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Player",
      ...this.rigidBodyOptions,
    };

    const width = this.sprite.width;
    const height = this.sprite.height;

    this.rigidBody = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight / 2,
      width -
        width * this.hitBoxModifier.left -
        width * this.hitBoxModifier.right,
      height -
        height * this.hitBoxModifier.top -
        height * this.hitBoxModifier.bottom,
      playerOptions
    );

    // Matter.Body.scale(this.rigidBody, this.scale, this.scale, {
    //   x: this.rigidBody.position.x,
    //   y: this.rigidBody.position.y,
    // });

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  protected getRigidBodyDimensions(): { width: number; height: number } {
    return {
      width: this.rigidBody.bounds.max.x - this.rigidBody.bounds.min.x,
      height: this.rigidBody.bounds.max.y - this.rigidBody.bounds.min.y,
    };
  }

  protected updateSprite(animation: AvailableAnimations, reset = false): void {
    if (this.currentAnimation === animation && !reset) {
      return;
    }

    this.currentAnimation = animation;
    this.sprite.stop();
    this.sprite.textures =
      this.game.spritesManager.getAnimatedSpriteFrames(animation);
    this.sprite.currentFrame = 0;
    this.sprite.play();
  }

  setupPointerEvents(): void {
    this.sprite.on("pointerdown", (e) => {
      const originalEvent = e;
      const offsetX = this.sprite.x - originalEvent.global.x;
      const offsetY = this.sprite.y - originalEvent.global.y;

      if (!this.isInteractive) {
        return;
      }

      this.isDragging = true;

      const onDragMove = (event) => {
        if (!this.isDragging) {
          return;
        }

        Matter.Body.setPosition(this.rigidBody, {
          x: event.data.global.x + offsetX,
          y: event.data.global.y + offsetY,
        });
      };

      const onDragEnd = () => {
        this.isDragging = false;
        this.game.app.stage.off("pointermove", onDragMove);
      };

      this.game.app.stage.on("pointermove", onDragMove);
      this.game.app.stage.on("pointerup", onDragEnd);
      this.game.app.stage.on("pointerupoutside", onDragEnd);
    });
  }

  update(): void {
    const yDiff = this.game.app.screen.height - this.rigidBody.position.y;

    if (yDiff < 0) {
      Matter.Body.setPosition(this.rigidBody, {
        x: this.rigidBody.position.x,
        y: Math.max(this.rigidBody.position.y - yDiff, 0),
      });
    }

    // TRICKY: This offsets the rendered sprite to match the hitbox
    const { height, width } = this.sprite;
    const hitBoxHeight =
      height -
      height * this.hitBoxModifier.top -
      height * this.hitBoxModifier.bottom;

    const hitBoxWidth =
      width -
      width * this.hitBoxModifier.left -
      width * this.hitBoxModifier.right;

    const yOffsetDiff = height * this.hitBoxModifier.top;
    const yCenterDiff = (height - hitBoxHeight) / 2;
    const xOffsetDiff = width * this.hitBoxModifier.left;
    const xCenterDiff = (width - hitBoxWidth) / 2;

    this.sprite.x = this.rigidBody.position.x - xOffsetDiff + xCenterDiff;
    this.sprite.y = this.rigidBody.position.y - yOffsetDiff + yCenterDiff;
    this.sprite.rotation = this.rigidBody.angle;

    const { width: rigidBodyWidth } = this.getRigidBodyDimensions();
    if (this.rigidBody.position.x > window.innerWidth + rigidBodyWidth) {
      Matter.Body.setPosition(this.rigidBody, {
        x: 0,
        y: this.rigidBody.position.y,
      });
    }

    if (this.rigidBody.position.x < 0 - rigidBodyWidth) {
      Matter.Body.setPosition(this.rigidBody, {
        x: window.innerWidth,
        y: this.rigidBody.position.y,
      });
    }

    // We scale the sprite relatvie to the hitbox

    // const xScale = (hitBoxWidth / width) * this.scale;
    // const yScale = (hitBoxHeight / height) * this.scale;

    // this.sprite.scale.set(xScale, yScale);
    // // TRICKY: The scale of the hitbox is different to the sprite
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    // We use this to detect if we are on the ground
    this.connectedElements.push(element);
  }

  onCollisionEnd(element: GameElement): void {
    this.connectedElements = this.connectedElements.filter(
      (el) => el !== element
    );
  }

  getGround(): GameElement | undefined {
    const ground = this.connectedElements.find((el) => {
      // Considered ground if it is below us
      return el.rigidBody?.position.y >= this.rigidBody.position.y;
    });

    // Slight optimization: If we find ground then lets move it to the front of the array
    if (ground) {
      this.connectedElements.splice(this.connectedElements.indexOf(ground), 1);
      this.connectedElements.unshift(ground);
    }

    return ground;
  }
}
