import { Container, Ticker } from "pixi.js";
import { World } from "./core/World";
import { InputSystem } from "./systems/InputSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { AnimationSystem } from "./systems/AnimationSystem";
import { AttackSystem } from "./systems/AttackSystem";
import { HealthSystem } from "./systems/HealthSystem";
import { EntityFactory } from "./entities/EntityFactory";
import { SpriteComponent } from "./components/SpriteComponent";
import { engine } from '../getEngine';

/**
 * Main Game class that integrates ECS with PIXI.js
 */
export class Game {
  private world: World;
  private container: Container;
  private paused: boolean = false;
  
  constructor(container: Container) {
    this.container = container;
    this.world = new World();
    
    // Add systems to the world in the order they should be processed
    this.world.addSystem(new InputSystem(this.world));
    this.world.addSystem(new MovementSystem(this.world));
    this.world.addSystem(new AttackSystem(this.world));
    this.world.addSystem(new AnimationSystem(this.world));
    this.world.addSystem(new HealthSystem(this.world));
    this.world.addSystem(new RenderSystem(this.world));
    
    // Set up Ticker
    Ticker.shared.add(this.update.bind(this));
  }
  
  /**
   * Initialize the game and load all required assets
   */
  public async initialize(): Promise<void> {
    // Create the goblin character
    const goblin = await EntityFactory.createGoblin(this.world);
    
    // Add the goblin's sprite container to the game container
    const spriteComponent = this.world.getComponent<SpriteComponent>(goblin.id, SpriteComponent.TYPE);
    if (spriteComponent) {
      this.container.addChild(spriteComponent.container);
    }

    // Create the castle
    const castle = await EntityFactory.createCastle(this.world);
    
    // Add the castle's sprite container to the game container
    const castleSprite = this.world.getComponent<SpriteComponent>(castle.id, SpriteComponent.TYPE);
    if (castleSprite) {
      this.container.addChild(castleSprite.container);
    }
  }
  
  /**
   * Update game state
   * @param deltaTime The time elapsed since the last update
   */
  private update(): void {
    if (this.paused) return;
    
    // Update the ECS world with the delta time from the ticker
    this.world.update(Ticker.shared.deltaMS);
  }
  
  /**
   * Pause the game
   */
  public pause(): void {
    this.paused = true;
  }
  
  /**
   * Resume the game
   */
  public resume(): void {
    this.paused = false;
  }
  
  /**
   * Resize the game
   */
  public resize(width: number, height: number): void {
    // Handle any resize logic if needed
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Remove ticker first to stop updates
    Ticker.shared.remove(this.update.bind(this));
    
    // Clean up container by removing all children (sprites, etc.)
    this.container.removeChildren();
    
    // Create a new world instance to effectively clean up the old one
    // This allows garbage collection to handle the old world
    this.world = new World();
  }
}
