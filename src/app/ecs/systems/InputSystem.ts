import { System } from '../core/System';
import { World } from '../core/World';
import { HealthComponent } from '../components/HealthComponent';
import { InputComponent } from '../components/InputComponent';
import { AttackComponent } from '../components/AttackComponent';

/**
 * System for handling keyboard input
 */
export class InputSystem extends System {
  private inputEntities: number[] = [];
  
  constructor(world: World) {
    super(world);
  }
  
  public initialize(): void {
    // Set up keyboard event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  // Track attack cooldowns for entities
  private attackCooldowns: Map<number, number> = new Map();
  private attackInterval: number = 600; // 600ms between attacks

  public update(deltaTime: number): void {
    // Get all entities with input components
    this.inputEntities = this.world.getEntitiesWithComponents(InputComponent.TYPE);
    
    // Process attack key presses (spacebar)
    for (let i = 0; i < this.inputEntities.length; i++) {
      const entityId = this.inputEntities[i];
      
      // Skip dead entities
      const health = this.world.getComponent<HealthComponent>(entityId, HealthComponent.TYPE);
      if (health && health.isDead()) continue;
      
      const inputComponent = this.world.getComponent<InputComponent>(entityId, InputComponent.TYPE);
      const attackComponent = this.world.getComponent<AttackComponent>(entityId, AttackComponent.TYPE);
      
      if (attackComponent) {
        // Update cooldown for this entity
        let cooldown = this.attackCooldowns.get(entityId) || 0;
        cooldown = Math.max(0, cooldown - deltaTime);
        this.attackCooldowns.set(entityId, cooldown);
        
        // If space is pressed and we're not on cooldown, trigger attack
        if (inputComponent?.keyState[' '] && cooldown <= 0) {
          // Only start new attack if not already attacking
          if (!attackComponent.isAttacking) {
            // Start attack
            attackComponent.isAttacking = true;
            
            // Set cooldown for next attack
            this.attackCooldowns.set(entityId, this.attackInterval);
            
            // Auto-end attack after 500ms to ensure we're ready for the next one
            setTimeout(() => {
              if (attackComponent.isAttacking) {
                attackComponent.isAttacking = false;
              }
            }, 500); // End slightly before next possible attack to avoid overlap
          }
        }
      }
    }
  }
  
  public cleanup(): void {
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    for (const entityId of this.inputEntities) {
      const inputComponent = this.world.getComponent<InputComponent>(entityId, InputComponent.TYPE);
      if (inputComponent) {
        inputComponent.keyState[event.key.toLowerCase()] = true;
      }
    }
  }
  
  private handleKeyUp(event: KeyboardEvent): void {
    for (const entityId of this.inputEntities) {
      const inputComponent = this.world.getComponent<InputComponent>(entityId, InputComponent.TYPE);
      if (inputComponent) {
        inputComponent.keyState[event.key.toLowerCase()] = false;
      }
    }
  }
}
