import { System } from '../core/System';
import { World } from '../core/World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { InputComponent } from '../components/InputComponent';
import { AttackComponent } from '../components/AttackComponent';
import { engine } from '../../getEngine';

/**
 * System for handling movement based on input and velocity
 */
export class MovementSystem extends System {
  constructor(world: World) {
    super(world);
  }
  
  public update(deltaTime: number): void {
    // Get all entities that can move (have transform, velocity, and input components)
    const movableEntities = this.world.getEntitiesWithComponents(
      TransformComponent.TYPE, 
      VelocityComponent.TYPE, 
      InputComponent.TYPE
    );
    
    for (const entityId of movableEntities) {
      const transform = this.world.getComponent<TransformComponent>(entityId, TransformComponent.TYPE)!;
      const velocity = this.world.getComponent<VelocityComponent>(entityId, VelocityComponent.TYPE)!;
      const input = this.world.getComponent<InputComponent>(entityId, InputComponent.TYPE)!;
      const attack = this.world.getComponent<AttackComponent>(entityId, AttackComponent.TYPE);
      
      // Don't move if attacking
      if (attack?.isAttacking) {
        continue;
      }
      
      // Reset velocity
      velocity.velocityX = 0;
      velocity.velocityY = 0;
      
      // Update velocity based on input (WASD keys)
      if (input.keyState['w']) {
        velocity.velocityY = -velocity.speed;
        if (attack) attack.attackDirection = 'up';
      }
      
      if (input.keyState['s']) {
        velocity.velocityY = velocity.speed;
        if (attack) attack.attackDirection = 'down';
      }
      
      if (input.keyState['a']) {
        velocity.velocityX = -velocity.speed;
        if (attack) {
          attack.facingDirection = 'left';
          attack.attackDirection = 'left';
        }
      }
      
      if (input.keyState['d']) {
        velocity.velocityX = velocity.speed;
        if (attack) {
          attack.facingDirection = 'right';
          attack.attackDirection = 'right';
        }
      }
      
      // Apply velocity to position
      if (velocity.velocityX !== 0 || velocity.velocityY !== 0) {
        transform.x += velocity.velocityX;
        transform.y += velocity.velocityY;
        
        // Get screen boundaries
        const screenWidth = engine().screen.width;
        const screenHeight = engine().screen.height;
        const padding = 30; // Padding from screen edges
        
        // Enforce screen boundaries
        transform.x = Math.max(padding, Math.min(screenWidth - padding, transform.x));
        transform.y = Math.max(padding, Math.min(screenHeight - padding, transform.y));
      }
    }
  }
}
