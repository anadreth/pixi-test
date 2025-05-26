import { System } from '../core/System';
import { World } from '../core/World';
import { AttackComponent } from '../components/AttackComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { Graphics } from 'pixi.js';

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
    // Create a new hitbox
    attack.attackHitbox = new Graphics();
    attack.attackHitbox.rect(0, 0, attack.hitboxSize, attack.hitboxSize)
      .fill({ color: 0xff0000, alpha: attack.hitboxAlpha });
    
    // Position the hitbox based on attack direction
    const halfSize = attack.hitboxSize / 2;
    const offsetDistance = 50; // Distance from entity center to hitbox center
    const upDistanceAdjustment = 15; // Adjustment for up attack
    
    // Position the hitbox relative to the entity based on direction
    switch (attack.attackDirection) {
      case 'up':
        attack.attackHitbox.position.set(-halfSize, -halfSize - offsetDistance + upDistanceAdjustment);
        break;
      case 'down':
        attack.attackHitbox.position.set(-halfSize, -halfSize + offsetDistance);
        break;
      case 'left':
        attack.attackHitbox.position.set(-halfSize - offsetDistance, -halfSize);
        break;
      case 'right':
        attack.attackHitbox.position.set(-halfSize + offsetDistance, -halfSize);
        break;
    }
    
    // Add the hitbox to the entity container
    spriteComp.container.addChild(attack.attackHitbox);
  }
  
  /**
   * Remove the attack hitbox when attack completes
   */
  private removeAttackHitbox(attack: AttackComponent, spriteComp: SpriteComponent): void {
    if (attack.attackHitbox) {
      spriteComp.container.removeChild(attack.attackHitbox);
      attack.attackHitbox.destroy();
      attack.attackHitbox = undefined;
    }
  }
}
