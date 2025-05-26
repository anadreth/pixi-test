import { System } from '../core/System';
import { World } from '../core/World';
import { HealthComponent } from '../components/HealthComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { AttackComponent } from '../components/AttackComponent';
import { InputComponent } from '../components/InputComponent';

/**
 * System for handling sprite animations
 */
export class AnimationSystem extends System {
  constructor(world: World) {
    super(world);
  }
  
  public update(deltaTime: number): void {
    // Get all entities with animation and sprite components
    const animatableEntities = this.world.getEntitiesWithComponents(
      AnimationComponent.TYPE,
      SpriteComponent.TYPE
    );
    
    for (const entityId of animatableEntities) {
      // Skip dead entities
      const health = this.world.getComponent<HealthComponent>(entityId, HealthComponent.TYPE);
      if (health && health.isDead()) continue;
      
      const animation = this.world.getComponent<AnimationComponent>(entityId, AnimationComponent.TYPE)!;
      const spriteComp = this.world.getComponent<SpriteComponent>(entityId, SpriteComponent.TYPE)!;
      const velocity = this.world.getComponent<VelocityComponent>(entityId, VelocityComponent.TYPE);
      const attack = this.world.getComponent<AttackComponent>(entityId, AttackComponent.TYPE);
      
      // Update animation time
      animation.elapsedTime += deltaTime;
      
      // Check if we need to advance to the next frame
      if (animation.elapsedTime >= animation.frameDuration) {
        animation.elapsedTime = 0;
        
        // Handle attack animations
        if (attack?.isAttacking) {
          animation.attackFrameIndex++;
          const attackFrameCount = 6; // All attack animations have 6 frames
          
          // Choose attack animation based on direction
          switch (attack.attackDirection) {
            case 'up':
              spriteComp.sprite.texture = spriteComp.animationFrames.attackUp[animation.attackFrameIndex];
              break;
            case 'down':
              spriteComp.sprite.texture = spriteComp.animationFrames.attackDown[animation.attackFrameIndex];
              break;
            case 'left':
            case 'right':
              spriteComp.sprite.texture = spriteComp.animationFrames.attackHorizontal[animation.attackFrameIndex];
              break;
          }
          
          // If we've completed a full attack animation cycle
          if (animation.attackFrameIndex >= attackFrameCount - 1) {
            attack.isAttacking = false;
            animation.attackFrameIndex = 0;
          }
        } 
        // Handle walking/idle animations
        else {
          // Determine if the entity is moving
          const isMoving = velocity && (velocity.velocityX !== 0 || velocity.velocityY !== 0);
          
          // Choose appropriate animation frames
          if (isMoving) {
            // Walking animation
            animation.currentFrame = (animation.currentFrame + 1) % spriteComp.animationFrames.walking.length;
            spriteComp.sprite.texture = spriteComp.animationFrames.walking[animation.currentFrame];
          } else {
            // Idle animation
            animation.currentFrame = (animation.currentFrame + 1) % spriteComp.animationFrames.idle.length;
            spriteComp.sprite.texture = spriteComp.animationFrames.idle[animation.currentFrame];
          }
        }
      }
    }
  }
}
