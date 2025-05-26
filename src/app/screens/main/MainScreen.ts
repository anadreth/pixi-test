import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import {
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
  private paused = false;

  // 🆕 Add sprite reference
  private centerImage?: Sprite;
  private keyState: { [key: string]: boolean } = {};
  private movementSpeed: number = 3;
  private goblinCharacter?: Container;

  // Attack system variables
  private isAttacking: boolean = false;
  private attackDirection: 'left' | 'right' | 'up' | 'down' = 'right';
  private attackFrameIndex: number = 0;
  private facingDirection: 'left' | 'right' = 'right';
  private attackHitbox?: Graphics;
  private readonly ATTACK_HITBOX_SIZE = 64; // Size of the attack hitbox

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // Set up keyboard controls for WASD movement and spacebar attack
    window.addEventListener('keydown', (e) => {
      this.keyState[e.key.toLowerCase()] = true;

      // Handle spacebar attack
      if (e.key === ' ' && !this.isAttacking && this.goblinCharacter) {
        this.startAttack();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keyState[e.key.toLowerCase()] = false;
    });

    // Initialize goblin character
    this.showGoblin();

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
  public prepare() { }

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    //  this.bouncer.update();
    this.moveGoblin();
  }

  /**
   * Resume gameplay after pausing - automatically fired when all popups are closed
   */
  public resume(): Promise<void> {
    this.paused = false;
    return Promise.resolve();
  }

  /**
   * Check if the goblin is currently moving based on key states
   */
  private isGoblinMoving(): boolean {
    // Don't register movement if attacking
    if (this.isAttacking) return false;
    return this.keyState['w'] || this.keyState['a'] || this.keyState['s'] || this.keyState['d'];
  }

  /**
   * Move the goblin based on WASD key presses
   */
  private moveGoblin(): void {
    if (!this.goblinCharacter) return;

    // Don't allow movement while attacking
    if (this.isAttacking) return;

    let dx = 0;
    let dy = 0;

    // W - Up
    if (this.keyState['w']) {
      dy -= this.movementSpeed;
      // Store last vertical direction for attack
      this.attackDirection = 'up';
    }

    // S - Down
    if (this.keyState['s']) {
      dy += this.movementSpeed;
      // Store last vertical direction for attack
      this.attackDirection = 'down';
    }

    // A - Left
    if (this.keyState['a']) {
      dx -= this.movementSpeed;
      this.facingDirection = 'left'; // Store facing direction
      this.attackDirection = 'left'; // Store horizontal attack direction
    }

    // D - Right
    if (this.keyState['d']) {
      dx += this.movementSpeed;
      this.facingDirection = 'right'; // Store facing direction
      this.attackDirection = 'right'; // Store horizontal attack direction
    }

    // Apply movement if any keys are pressed
    if (dx !== 0 || dy !== 0) {
      // Apply movement
      this.goblinCharacter.x += dx;
      this.goblinCharacter.y += dy;

      // Get screen boundaries
      const screenWidth = engine().screen.width;
      const screenHeight = engine().screen.height;
      const padding = 30; // Padding from screen edges

      // Enforce screen boundaries with looser constraints to ensure full-screen movement
      this.goblinCharacter.x = Math.max(padding, Math.min(screenWidth - padding, this.goblinCharacter.x));
      this.goblinCharacter.y = Math.max(padding, Math.min(screenHeight - padding, this.goblinCharacter.y));

      // Log position occasionally to help debug movement issues
      if (Math.random() < 0.01) { // Only log about 1% of the time to avoid console spam
        console.log(`Goblin position: (${this.goblinCharacter.x}, ${this.goblinCharacter.y})`);
        console.log(`Screen size: ${screenWidth}x${screenHeight}`);
      }

      // Update sprite direction based on movement
      if (this.goblinCharacter.children[0] instanceof Sprite) {
        const goblinSprite = this.goblinCharacter.children[0] as Sprite;

        // Flip sprite horizontally based on movement direction
        if (this.facingDirection === 'left') {
          goblinSprite.scale.x = -1; // Mirror for left facing
        } else {
          goblinSprite.scale.x = 1;  // Normal for right facing
        }
      }
    }

    // Check for attack input
    if (this.keyState[' '] && !this.isAttacking) { // Spacebar for attack
      this.startAttack();
    }
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() { }

  /** Fully reset */
  public reset() { }

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

      frames.push(frame);
    }
    // Create character container and position it in the center of the screen
    const character = new Container();
    character.x = engine().screen.width / 2;
    character.y = engine().screen.height / 2;
    character.zIndex = 1;

    // Create sprite with proper anchoring
    const sprite = new Sprite(frames[0]);
    sprite.anchor.set(0.5);
    sprite.zIndex = 1;
    console.log(sprite.width, sprite.height);
    this.centerImage = sprite;

    // Create hitbox centered at (0,0) since the container is positioned at the center of the screen
    const playerHitbox = new Graphics();
    playerHitbox.rect(-30, -30, 60, 60).fill({ color: "#000", alpha: 0.5 });
    playerHitbox.zIndex = 2;
    character.addChild(playerHitbox);

    character.addChild(sprite);
    this.addChild(character);
    this.goblinCharacter = character; // Store reference for movement
    console.log("HITBOX", playerHitbox.width);
    let frameIndex = 0;
    let elapsed = 0;
    const frameDuration = 100;
    // Store these for reference in the movement function
    const originalFrames = [...frames]; // Row 0 has 7 frames

    // Create walking animation frames (row 1)
    const walkingFrames: Texture[] = [];
    const walkingFrameCount = 6; // Row 1 has only 6 frames

    for (let i = 0; i < walkingFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        1 * frameHeight, // Row 1 for walking animation
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: baseTexture, frame: rect });
      walkingFrames.push(frame);
    }

    // Create attack animation frames for different directions
    const attackFrameCount = 6; // All attack animations have 6 frames

    // Left/Right attack (row 2)
    const horizontalAttackFrames: Texture[] = [];
    for (let i = 0; i < attackFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        2 * frameHeight, // Row 2 for horizontal attack
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: baseTexture, frame: rect });
      horizontalAttackFrames.push(frame);
    }

    // Down attack (row 3)
    const downAttackFrames: Texture[] = [];
    for (let i = 0; i < attackFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        3 * frameHeight, // Row 3 for down attack
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: baseTexture, frame: rect });
      downAttackFrames.push(frame);
    }

    // Up attack (row 4)
    const upAttackFrames: Texture[] = [];
    for (let i = 0; i < attackFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        4 * frameHeight, // Row 4 for up attack
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: baseTexture, frame: rect });
      upAttackFrames.push(frame);
    }

    Ticker.shared.add(() => {
      elapsed += Ticker.shared.deltaMS;
      if (elapsed >= frameDuration) {
        elapsed = 0;

        // Handle attack animations
        if (this.isAttacking) {
          this.attackFrameIndex = (this.attackFrameIndex + 1) % attackFrameCount;

          // Choose attack animation based on direction
          switch (this.attackDirection) {
            case 'up':
              sprite.texture = upAttackFrames[this.attackFrameIndex];
              break;
            case 'down':
              sprite.texture = downAttackFrames[this.attackFrameIndex];
              break;
            case 'left':
            case 'right':
              sprite.texture = horizontalAttackFrames[this.attackFrameIndex];
              break;
          }

          // If we've completed a full attack animation cycle
          if (this.attackFrameIndex === attackFrameCount - 1) {
            this.isAttacking = false;
            this.attackFrameIndex = 0;

            // Remove attack hitbox when attack animation completes
            this.removeAttackHitbox();
          }
        } else {
          // Normal movement/idle animations
          if (this.isGoblinMoving()) {
            // Use walking frames (row 1) with only 6 frames
            frameIndex = (frameIndex + 1) % walkingFrames.length;
            sprite.texture = walkingFrames[frameIndex];
          } else {
            // Use standing frames (row 0) with 7 frames
            frameIndex = (frameIndex + 1) % originalFrames.length;
            sprite.texture = originalFrames[frameIndex];
          }
        }

        // Apply sprite flipping based on facing direction
        if (this.facingDirection === 'left') {
          sprite.scale.x = -1; // Mirror for left facing
        } else {
          sprite.scale.x = 1;  // Normal for right facing
        }
      }
    });
  }

  /**
   * Start an attack animation based on current direction
   */
  private startAttack(): void {
    if (this.isAttacking) return; // Don't start new attack if already attacking

    this.isAttacking = true;
    this.attackFrameIndex = 0; // Reset attack animation frame

    // Attack direction was already set in moveGoblin based on WASD keys

    // Spawn the attack hitbox based on current attack direction
    this.spawnAttackHitbox();
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
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
  }

  /** Hide screen with animations */
  public async hide() { }

  /** Auto pause the app when window go out of focus */
  public blur() { }

  /**
   * Spawn an attack hitbox based on the current attack direction
   */
  private spawnAttackHitbox(): void {
    // Remove any existing hitbox first
    this.removeAttackHitbox();

    if (!this.goblinCharacter) return;

    // Create a new hitbox
    this.attackHitbox = new Graphics();
    this.attackHitbox.rect(0, 0, this.ATTACK_HITBOX_SIZE, this.ATTACK_HITBOX_SIZE).fill({ color: 0xff0000, alpha: 0.3 });

    // Position the hitbox based on attack direction
    const halfSize = this.ATTACK_HITBOX_SIZE / 2;
    const offsetDistance = 50; // Distance from goblin center to hitbox center
    const upDistanceAdjustment = 15;
    // Position the hitbox relative to the goblin based on direction
    switch (this.attackDirection) {
      case 'up':
        this.attackHitbox.position.set(-halfSize, -halfSize - offsetDistance + upDistanceAdjustment);
        break;
      case 'down':
        this.attackHitbox.position.set(-halfSize, -halfSize + offsetDistance);
        break;
      case 'left':
        this.attackHitbox.position.set(-halfSize - offsetDistance, -halfSize);
        break;
      case 'right':
        this.attackHitbox.position.set(-halfSize + offsetDistance, -halfSize);
        break;
    }

    // Add the hitbox to the goblin container
    this.goblinCharacter.addChild(this.attackHitbox);
  }

  /**
   * Remove the attack hitbox when attack completes
   */
  private removeAttackHitbox(): void {
    if (this.attackHitbox && this.goblinCharacter) {
      this.goblinCharacter.removeChild(this.attackHitbox);
      this.attackHitbox.destroy();
      this.attackHitbox = undefined;
    }
  }
}
