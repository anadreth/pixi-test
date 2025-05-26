import { System } from '../core/System';
import { World } from '../core/World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { AttackComponent } from '../components/AttackComponent';

/**
 * System for rendering and updating sprite positions
 */
export class RenderSystem extends System {
  constructor(world: World) {
    super(world);
  }
  
  public update(deltaTime: number): void {
    // Get all entities with transform and sprite components
    const renderableEntities = this.world.getEntitiesWithComponents(
      TransformComponent.TYPE, 
      SpriteComponent.TYPE
    );
    
    for (const entityId of renderableEntities) {
      const transform = this.world.getComponent<TransformComponent>(entityId, TransformComponent.TYPE)!;
      const spriteComp = this.world.getComponent<SpriteComponent>(entityId, SpriteComponent.TYPE)!;
      const attackComp = this.world.getComponent<AttackComponent>(entityId, AttackComponent.TYPE);
      
      // Update container position from transform
      spriteComp.container.x = transform.x;
      spriteComp.container.y = transform.y;
      
      // Update sprite scale based on facing direction if applicable
      if (attackComp) {
        if (attackComp.facingDirection === 'left') {
          spriteComp.sprite.scale.x = -Math.abs(spriteComp.sprite.scale.x);
        } else {
          spriteComp.sprite.scale.x = Math.abs(spriteComp.sprite.scale.x);
        }
      }
    }
  }
}
