import { Container, Ticker } from "pixi.js";
import { World } from "./core/World";
import { InputSystem } from './systems/InputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { RenderSystem } from './systems/RenderSystem';
import { AnimationSystem } from './systems/AnimationSystem';
import { AttackSystem } from './systems/AttackSystem';
import { HealthSystem } from './systems/HealthSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { DeathSystem } from './systems/DeathSystem';
import { EntityFactory } from "./entities/EntityFactory";
import { SpriteComponent } from "./components/SpriteComponent";
import { HealthComponent } from './components/HealthComponent';
import { engine } from '../getEngine';

/**
 * Main Game class that integrates ECS with PIXI.js
 */
export class Game {
  private world!: World;
  private deathSystem: DeathSystem | null = null;
  private container: Container;
  private paused: boolean = false;
  
  constructor(container: Container) {
    this.container = container;
    this.setup();
  }
  
  async setup() {
    // Initialize ECS world
    this.world = new World();
    
    // Create death system first so entity factories can register death textures
    const deathSystem = new DeathSystem(this.world);
    
    // Add systems to the world in the order they should be processed
    this.world.addSystem(new InputSystem(this.world));
    this.world.addSystem(new MovementSystem(this.world));
    this.world.addSystem(new AttackSystem(this.world));
    this.world.addSystem(new AnimationSystem(this.world));
    this.world.addSystem(new HealthSystem(this.world));
    this.world.addSystem(new CollisionSystem(this.world));
    this.world.addSystem(deathSystem);
    this.world.addSystem(new RenderSystem(this.world));
    
    // Store the deathSystem reference for initialize method
    this.deathSystem = deathSystem;
    
    // Set up Ticker
    Ticker.shared.add(this.update.bind(this));
  }
  
  /**
   * Initialize the game and load all required assets
   */
  public async initialize(): Promise<void> {
    if (!this.deathSystem) {
      console.error('DeathSystem not initialized! Setup must be called first.');
      return;
    }
    
    // Enable sortable children on the main container
    this.container.sortableChildren = true;

    // Create the goblin character with death textures
    const goblin = await EntityFactory.createGoblin(this.world, this.deathSystem);
    
    // Add the goblin's sprite container to the game container
    const spriteComponent = this.world.getComponent<SpriteComponent>(goblin.id, SpriteComponent.TYPE);
    if (spriteComponent) {
      spriteComponent.container.zIndex = 1;
      this.container.addChild(spriteComponent.container);
    }

    // Create the castle with death textures
    const castle = await EntityFactory.createCastle(this.world, this.deathSystem);
    
    // Add the castle's sprite container to the game container
    const castleSprite = this.world.getComponent<SpriteComponent>(castle.id, SpriteComponent.TYPE);
    if (castleSprite) {
      castleSprite.container.zIndex = 1;
      this.container.addChild(castleSprite.container);
    }
    
    // Get health components for debugging
    const goblinHealth = this.world.getComponent<HealthComponent>(goblin.id, HealthComponent.TYPE);
    const castleHealth = this.world.getComponent<HealthComponent>(castle.id, HealthComponent.TYPE);
    
    // Log health bar setup information
    if (goblinHealth) {
      console.log('Goblin health component initialized, entity ID:', goblin.id);
    }
    
    if (castleHealth) {
      console.log('Castle health component initialized, entity ID:', castle.id);
    }
    
    console.log('Game initialized with entities:', goblin.id, castle.id);
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
