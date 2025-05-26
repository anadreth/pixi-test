import { System } from '../core/System';
import { World } from '../core/World';
import { HealthComponent } from '../components/HealthComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { AttackComponent } from '../components/AttackComponent';
import { Sprite, Texture } from 'pixi.js';

/**
 * System for handling entity deaths
 */
export class DeathSystem extends System {
  // Track which entities are already dead to avoid processing them multiple times
  private deadEntities: Set<number> = new Set();
  
  // Death textures cache
  private deathTextures: Map<string, Texture> = new Map();
  
  constructor(world: World) {
    super(world);
  }
  
  /**
   * Register a death texture for an entity type
   */
  public registerDeathTexture(entityType: string, texture: Texture): void {
    this.deathTextures.set(entityType, texture);
    console.log(`Registered death texture for ${entityType}`);
  }
  
  /**
   * Update death states
   */
  public update(_deltaTime: number): void {
    // Get all entities with health components
    const entities = [];
    
    // Simple approach to find all entity IDs with health
    for (let i = 0; i < 1000; i++) {
      if (this.world.getComponent(i, HealthComponent.TYPE)) {
        entities.push(i);
      }
    }
    
    // Check for newly dead entities
    for (const entityId of entities) {
      // Skip entities we've already processed
      if (this.deadEntities.has(entityId)) continue;
      
      const health = this.world.getComponent<HealthComponent>(entityId, HealthComponent.TYPE);
      
      // If entity is dead and we haven't processed it yet
      if (health && health.isDead()) {
        this.handleEntityDeath(entityId, health);
        
        // Mark as processed
        this.deadEntities.add(entityId);
      }
    }
  }
  
  /**
   * Handle entity death
   */
  private handleEntityDeath(entityId: number, health: HealthComponent): void {
    console.log(`Entity ${entityId} died!`);
    
    // Get entity type from health component
    const entityType = health.entityType;
    
    // Check if we have a death texture for this entity type
    if (entityType && this.deathTextures.has(entityType)) {
      const deathTexture = this.deathTextures.get(entityType);
      
      // Get sprite component (using the correct TYPE)
      const spriteComp = this.world.getComponent<SpriteComponent>(entityId, SpriteComponent.TYPE);
      
      if (spriteComp && deathTexture) {
        console.log(`Applying death texture to ${entityType} entity ${entityId}`);
        // Replace sprite texture with death texture
        spriteComp.sprite.texture = deathTexture;
        // Force texture update
        spriteComp.sprite.texture.update();
        
        // Remove any animation components or other components that might interfere
        // This is a simple approach - just change the texture and stop all animations
        const animComp = this.world.getComponent(entityId, 'AnimationComponent');
        if (animComp) {
          this.world.removeComponent(entityId, 'AnimationComponent');
        }
        
        // Remove attack and input components too
        this.world.removeComponent(entityId, AttackComponent.TYPE);
        this.world.removeComponent(entityId, 'input');
        
        // Log to confirm death handling
        console.log(`Applied death texture to entity ${entityId} of type ${entityType}`);
        
        // Optional: You could trigger a death animation or particle effect here
      }
    }
  }
}
