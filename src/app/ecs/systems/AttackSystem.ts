import { System } from '../core/System';
import { World } from '../core/World';
import { InputComponent } from '../components/InputComponent';
import { AttackComponent } from '../components/AttackComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { TransformComponent } from '../components/TransformComponent';
import { HitboxComponent } from '../components/HitboxComponent';
import { Graphics } from 'pixi.js';
import { SpriteComponent } from '../components/SpriteComponent';

/**
 * System for handling attack mechanics and hitboxes
 */
export class AttackSystem extends System {
  constructor(world: World) {
    super(world);
  }
  
  public update(deltaTime: number): void {
    // Get all entities with attack and sprite components
    const attackEntities = this.world.getEntitiesWithComponents(
      AttackComponent.TYPE,
      SpriteComponent.TYPE
    );
    
    for (const entityId of attackEntities) {
      const attack = this.world.getComponent<AttackComponent>(entityId, AttackComponent.TYPE)!;
      const spriteComp = this.world.getComponent<SpriteComponent>(entityId, SpriteComponent.TYPE)!;
      
      // Spawn attack hitbox if attacking and hitbox doesn't exist
      if (attack.isAttacking && !attack.attackHitbox) {
        this.spawnAttackHitbox(attack, spriteComp);
      }
      
      // Remove attack hitbox if not attacking
      if (!attack.isAttacking && attack.attackHitbox) {
        this.removeAttackHitbox(attack, spriteComp);
      }
    }
  }
  
  /**
   * Spawn an attack hitbox based on the current attack direction
   */
  private spawnAttackHitbox(attack: AttackComponent, spriteComp: SpriteComponent): void {
    // Create a new hitbox graphic
    attack.attackHitbox = new Graphics();
    attack.attackHitbox.beginFill(0xff0000, attack.hitboxAlpha);
    attack.attackHitbox.drawRect(0, 0, attack.hitboxSize, attack.hitboxSize);
    attack.attackHitbox.endFill();
    
    // Position the hitbox based on attack direction
    const halfSize = attack.hitboxSize / 2;
    const offsetDistance = 50; // Distance from entity center to hitbox center
    const upDistanceAdjustment = 15; // Adjustment for up attack
    
    // Determine position and offset based on direction
    let offsetX = 0;
    let offsetY = 0;
    
    switch (attack.attackDirection) {
      case 'up':
        offsetY = -offsetDistance + upDistanceAdjustment;
        attack.attackHitbox.position.set(-halfSize, -halfSize - offsetDistance + upDistanceAdjustment);
        break;
      case 'down':
        offsetY = offsetDistance;
        attack.attackHitbox.position.set(-halfSize, -halfSize + offsetDistance);
        break;
      case 'left':
        offsetX = -offsetDistance;
        attack.attackHitbox.position.set(-halfSize - offsetDistance, -halfSize);
        break;
      case 'right':
        offsetX = offsetDistance;
        attack.attackHitbox.position.set(-halfSize + offsetDistance, -halfSize);
        break;
    }
    
    // Add the hitbox to the entity container
    spriteComp.container.addChild(attack.attackHitbox);
    
    // Create a hitbox component for collision detection
    const entityId = this.getEntityId(attack);
    if (entityId !== null) {
      // Create a new entity for the attack hitbox
      const attackEntity = this.world.createEntity();
      attack.attackEntityId = attackEntity.id; // Store for later removal
      
      // Add transform component - will be updated each frame
      const transform = this.world.getComponent<TransformComponent>(entityId, TransformComponent.TYPE);
      if (transform) {
        this.world.addComponent(attackEntity.id, new TransformComponent(transform.x, transform.y, transform.direction));
      }
      
      // Add hitbox component with damage and TTL
      this.world.addComponent(attackEntity.id, new HitboxComponent(
        attack.attackHitbox,
        attack.hitboxSize,
        attack.hitboxSize,
        offsetX,
        offsetY,
        true, // This is an attack hitbox
        20,   // 20 damage
        500   // 500ms TTL
      ));
    }
  }
  
  /**
   * Remove the attack hitbox when attack completes
   */
  private removeAttackHitbox(attack: AttackComponent, spriteComp: SpriteComponent): void {
    if (attack.attackHitbox) {
      spriteComp.container.removeChild(attack.attackHitbox);
      attack.attackHitbox.destroy();
      attack.attackHitbox = undefined;
      
      // Remove the attack entity if it exists
      if (attack.attackEntityId !== undefined) {
        this.world.removeEntity(attack.attackEntityId);
        attack.attackEntityId = undefined;
      }
    }
  }
  
  /**
   * Get the entity ID associated with an attack component
   */
  private getEntityId(attack: AttackComponent): number | null {
    // Simple loop to find entity with this attack component
    for (let i = 0; i < 1000; i++) {
      const comp = this.world.getComponent<AttackComponent>(i, AttackComponent.TYPE);
      if (comp === attack) {
        return i;
      }
    }
    return null;
  }
}
