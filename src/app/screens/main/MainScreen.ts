import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import {
  AnimatedSprite,
  Graphics,
  Rectangle,
  SCALE_MODES,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import { Assets, Container } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main", "game"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  // private bouncer: Bouncer;
  private paused = false;

  // 🆕 Add sprite reference
  private centerImage?: Sprite;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    // this.bouncer = new Bouncer();

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    //  this.bouncer.update();
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {}

  /** Resume gameplay */
  public async resume() {}

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;

    // this.bouncer.resize(width, height);
    // 🆕 Keep the image centered on resize
    if (this.centerImage) {
      this.centerImage.x = width / 2;
      this.centerImage.y = height / 2;
    }
  }

  private async showGoblin(): Promise<void> {
    const texture = (await Assets.load(
      "game/Factions/Goblins/Troops/Torch/Red/Torch_Red.png",
    )) as Texture;
    const baseTexture = texture.baseTexture;
    baseTexture.scaleMode = SCALE_MODES.NEAREST;

    const rows = 5;
    const cols = 7;

    const frameWidth = Math.floor(baseTexture.width / cols);
    const frameHeight = Math.floor(baseTexture.height / rows);
    const animationRow = 0;

    const frames: Texture[] = [];
    for (let i = 0; i < cols; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        animationRow * frameHeight,
        frameWidth,
        frameHeight,
      );
      const frame = new Texture({ source: baseTexture, frame: rect }); // ✅ This is the correct slicing method
      //  frame.baseTexture.scaleMode = SCALE_MODES.NEAREST;
      frames.push(frame);
    }
    const character = new Container();
    const sprite = new Sprite(frames[0]);
    sprite.anchor.set(0.5);
    sprite.x = engine().screen.width / 2;
    sprite.y = engine().screen.height / 2;
    sprite.zIndex = 1;
    console.log(sprite.width, sprite.height);
    this.centerImage = sprite;
    character.zIndex = 1;
    // character.eventMode = "static";
    // character.on("pointerdown", (e) => {
    //   const newPosition = e.global;

    //   gsap.to(character, {
    //     x: newPosition.x,
    //     y: newPosition.y,
    //     duration: 0.5,
    //     ease: "power2.out",
    //   });
    // });
    const playerHitbox = new Graphics();
    playerHitbox.rect(0, 0, 60, 60).fill({ color: "#000", alpha: 0.5 });
    playerHitbox.zIndex = 2;
    playerHitbox.x = sprite.x - 30; // manually offset if needed
    playerHitbox.y = sprite.y - 30;
    character.addChild(playerHitbox);
    // this.addChild(playerHitbox);

    //  this.addChild(sprite);
    character.addChild(sprite);
    this.addChild(character);
    console.log("HITBOX", playerHitbox.width);
    let frameIndex = 0;
    let elapsed = 0;
    const frameDuration = 100;

    Ticker.shared.add(() => {
      elapsed += Ticker.shared.deltaMS;
      if (elapsed >= frameDuration) {
        elapsed = 0;
        frameIndex = (frameIndex + 1) % frames.length;
        sprite.texture = frames[frameIndex]; // ✅ THIS WILL WORK NOW
      }
    });
  }

  private async showMap(): Promise<void> {
    const texture = (await Assets.load(
      "game/Terrain/Ground/Tilemap_Flat.png",
    )) as Texture;
    texture.baseTexture.width = 400;
    texture.baseTexture.height = 175;
    //190x190 65x65 190x65
    const rect = new Rectangle(0, 0, 190, 190);
    const frame = new Texture({ source: texture.baseTexture, frame: rect });
    const sprite = new Sprite(frame);
    sprite.anchor.set(0.5);
    sprite.x = engine().screen.width / 2;
    sprite.y = engine().screen.height / 2;
    this.centerImage = sprite;
    this.addChild(sprite);
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    await this.showGoblin();
    await this.showMap();

    const elementsToAnimate = [this.pauseButton, this.settingsButton];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
    //  this.bouncer.show(this);
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {}
}
