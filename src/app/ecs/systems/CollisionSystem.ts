import { System } from '../core/System';
import { World } from '../core/World';
import { HitboxComponent } from '../components/HitboxComponent';
import { HealthComponent } from '../components/HealthComponent';
import { TransformComponent } from '../components/TransformComponent';

/**
 * CollisionSystem handles collision detection and damage application
 */
export class CollisionSystem extends System {
  // Keep track of processed collisions to avoid duplicates within a frame
  private processedCollisions: Set<string> = new Set();
  
  // Keep track of attack hitboxes that have already dealt damage
  private damageDealingHitboxes: Set<number> = new Set();
  
  constructor(world: World) {
    super(world);
  }
  
  /**
   * Check for collisions and apply damage
   */
  public update(deltaTime: number): void {
    // Reset processed collisions each frame
    this.processedCollisions.clear();
    
    // Get all entities with hitbox components
    const entities = [];
    
    // Simple approach to find all entity IDs up to a reasonable number
    for (let i = 0; i < 1000; i++) {
      if (this.world.getComponent(i, HitboxComponent.TYPE)) {
        entities.push(i);
      }
    }
    
    // First pass: update TTL for attack hitboxes and remove expired ones
    for (const entityId of entities) {
      const hitbox = this.world.getComponent<HitboxComponent>(entityId, HitboxComponent.TYPE);
      
      if (hitbox && hitbox.isAttack()) {
        const isAlive = hitbox.updateTTL(deltaTime);
        if (!isAlive) {
          // Remove expired attack hitbox
          const gfx = hitbox.getHitbox();
          if (gfx && gfx.parent) {
            gfx.parent.removeChild(gfx);
          }
          this.world.removeComponent(entityId, HitboxComponent.TYPE);
          
          // Remove from tracking sets
          this.damageDealingHitboxes.delete(entityId);
          
          // Skip this entity in collision detection
          continue;
        }
      }
    }
    
    // Second pass: check for collisions between attack hitboxes and damageable entities
    for (let i = 0; i < entities.length; i++) {
      const entityId1 = entities[i];
      const hitbox1 = this.world.getComponent<HitboxComponent>(entityId1, HitboxComponent.TYPE);
      
      // Skip if not an attack hitbox
      if (!hitbox1 || !hitbox1.isAttack()) continue;
      
      // Skip if this hitbox has already dealt damage
      if (this.damageDealingHitboxes.has(entityId1)) continue;
      
      const transform1 = this.world.getComponent<TransformComponent>(entityId1, TransformComponent.TYPE);
      if (!transform1) continue;
      
      for (let j = 0; j < entities.length; j++) {
        const entityId2 = entities[j];
        
        // Skip self-collision
        if (entityId1 === entityId2) continue;
        
        // Skip if already processed this collision pair
        const collisionKey = `${Math.min(entityId1, entityId2)}-${Math.max(entityId1, entityId2)}`;
        if (this.processedCollisions.has(collisionKey)) continue;
        
        // Get components needed for collision checks
        const hitbox2 = this.world.getComponent<HitboxComponent>(entityId2, HitboxComponent.TYPE);
        const health2 = this.world.getComponent<HealthComponent>(entityId2, HealthComponent.TYPE);
        
        // Skip if target entity is dead
        if (health2 && health2.isDead()) continue;
        
        // Skip if not a damageable entity (must have hitbox and health)
        if (!hitbox2 || !health2) continue;
        
        // Skip attack-attack collisions
        if (hitbox2.isAttack()) continue;
        
        const transform2 = this.world.getComponent<TransformComponent>(entityId2, TransformComponent.TYPE);
        if (!transform2) continue;
        
        // Check for collision
        if (this.checkCollision(transform1, hitbox1, transform2, hitbox2)) {
          // Apply damage
          const damage = hitbox1.getDamage();
          health2.takeDamage(damage);
          
          // Mark this hitbox as having dealt damage already
          // This ensures each attack hitbox only deals damage once during its lifetime
          this.damageDealingHitboxes.add(entityId1);
          
          // Mark this collision as processed for this frame
          this.processedCollisions.add(collisionKey);
          
          // Optional: You could emit an event or create a visual effect here
          console.log(`Entity ${entityId1} dealt ${damage} damage to entity ${entityId2}. Health: ${health2.getHealth()}`);
        }
      }
    }
  }
  
  /**
   * Check if two hitboxes are colliding
   */
  private checkCollision(
    transform1: TransformComponent,
    hitbox1: HitboxComponent,
    transform2: TransformComponent,
    hitbox2: HitboxComponent
  ): boolean {
    const [x1, y1, w1, h1] = hitbox1.getBounds();
    const [x2, y2, w2, h2] = hitbox2.getBounds();
    
    // Apply transform positions
    const rect1 = {
      x: transform1.x + x1 - w1/2,
      y: transform1.y + y1 - h1/2,
      width: w1,
      height: h1
    };
    
    const rect2 = {
      x: transform2.x + x2 - w2/2,
      y: transform2.y + y2 - h2/2,
      width: w2,
      height: h2
    };
    
    // Simple AABB collision check
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}
