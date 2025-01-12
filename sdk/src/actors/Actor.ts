import Matter from "matter-js";
import { AnimatedSprite } from "pixi.js";
import { AvailableAnimations } from "../sprites/sprites";
import { Game, GameElement } from "../types";

export class Actor implements GameElement {
  public sprite: AnimatedSprite;
  public isPointerOver = false;
  public isDragging = false;
  protected currentAnimation: AvailableAnimations;

  rigidBody: Matter.Body;
  isInteractive = false;

  constructor(
    protected game: Game,
    private rigidBodyOptions: Matter.IBodyDefinition = {}
  ) {}

  beforeUnload: () => void;

  protected loadSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite = new AnimatedSprite(
      this.game.spritesManager.getSpriteFrames(animation)
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

    this.rigidBody = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight / 2,
      this.sprite.width,
      this.sprite.height,
      playerOptions
    );

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  protected updateSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite.stop();
    this.sprite.textures = this.game.spritesManager.getSpriteFrames(animation);
    this.sprite.currentFrame = 0;
    this.sprite.play();
  }

  setDraggable(): void {
    this.sprite.on("pointerdown", () => {
      this.isDragging = true;

      const onDragMove = (event) => {
        if (!this.isDragging) {
          return;
        }

        Matter.Body.setPosition(this.rigidBody, {
          x: event.data.global.x,
          y: event.data.global.y,
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
    // velocity
    // Matter.Body.setVelocity(this.rigidBody, {
    //   x: this.xVelocity,
    //   y: this.yVelocity,
    // });

    // this.rotation = this.rigidBody.angle; // todo make sure rigidbody angle cannot change

    // if (this.rigidBody.position.y > 500) this.resetPosition();

    if (this.rigidBody.position.y > this.game.app.screen.height) {
      this.resetPosition();
    }

    this.sprite.x = this.rigidBody.position.x;
    this.sprite.y = this.rigidBody.position.y;
  }

  resetPosition(): void {
    Matter.Body.setPosition(this.rigidBody, { x: 0, y: 0 });
    Matter.Body.setVelocity(this.rigidBody, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.rigidBody, 0);
  }
}
