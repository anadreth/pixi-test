import { Container, Ticker } from "pixi.js";
import { FancyButton } from "@pixi/ui";

import { engine } from "../../getEngine";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Game } from "../../ecs/Game";

/**
 * MainScreen for the game - now using ECS architecture
 * @class
 */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main", "game"];

  private mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private game: Game;
  private paused = false;

  constructor() {
    super();

    // Create main container
    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    
    // Character creation and animation now handled by ECS architecture
    this.game = new Game(this.mainContainer);

    // Create simple button animations
    const buttonAnimations = {
      hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
      pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 }
    };

    // Create UI buttons
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations
    });
    this.pauseButton.onPress.connect(() => this.handlePauseClick());
    this.pauseButton.position.set(engine().screen.width - 100, 30);
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations
    });
    this.settingsButton.onPress.connect(() => this.handleSettingsClick());
    this.settingsButton.position.set(engine().screen.width - 100, 80);
    this.addChild(this.settingsButton);
  }

  /**
   * Called when the screen is shown
   */
  public async prepare() {
    // Initialize the game
    await this.game.initialize();
  }

  /**
   * Update the screen (called by the game engine)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    // Empty - game updates handled by Game class
  }

  /**
   * Handle pause button click
   */
  private handlePauseClick(): void {
    this.paused = !this.paused;
    if (this.paused) {
      this.game.pause();
      this.pauseButton.defaultView = "icon-play.png";
    } else {
      this.game.resume();
      this.pauseButton.defaultView = "icon-pause.png";
    }
  }

  /**
   * Handle settings button click
   */
  private handleSettingsClick(): void {
    engine().navigation.presentPopup(SettingsPopup);
  }

  /**
   * Clean up resources when the screen is hidden
   */
  public destroy() {
    super.destroy();
    this.game.cleanup();
  }

  /**
   * Pause the game - automatically fired when a popup is presented
   */
  public pause(): void {
    if (this.paused) return;
    this.paused = true;
    this.game.pause();
  }

  /**
   * Resume gameplay after pausing - automatically fired when all popups are closed
   */
  public resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.game.resume();
  }

  /**
   * Reset game to initial state
   */
  public reset(): void {
    // Clean up and restart the game
    this.game.cleanup();
    this.game.initialize();
  }

  /** 
   * Resize the screen, fired whenever window size changes 
   */
  public resize(width: number, height: number): void {
    // Reposition UI elements
    if (this.pauseButton) {
      this.pauseButton.position.set(width - 100, 30);
    }

    if (this.settingsButton) {
      this.settingsButton.position.set(width - 100, 80);
    }

    // Center any popup if it exists
    const popupContainer = engine().stage.getChildByName("popup-container");
    if (popupContainer) {
      popupContainer.x = width / 2;
      popupContainer.y = height / 2;
    }
  }

  /** 
   * Show screen with animations 
   */
  public async show(): Promise<void> {
    // Play background music
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
    
    // Simple UI approach - first hide buttons
    this.pauseButton.alpha = 0;
    this.settingsButton.alpha = 0;
    
    // Simple timeout-based animation - more reliable than complex animations
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.pauseButton.alpha = 1;
        this.settingsButton.alpha = 1;
        resolve();
      }, 750);
    });
  }

  /** 
   * Hide screen with animations 
   */
  public async hide(): Promise<void> {
    // Empty implementation - to be filled if needed
  }

  /** 
   * Auto pause the app when window goes out of focus 
   */
  public blur(): void {
    this.pause();
  }
  
  /**
   * Handle window focus events
   */
  public focus(): void {
    // Resume can be called safely if not actually paused
    this.resume();
  }
}
