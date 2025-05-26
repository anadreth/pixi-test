import { System } from '../core/System';
import { World } from '../core/World';
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
  
  public update(deltaTime: number): void {
    // Get all entities with input components
    this.inputEntities = this.world.getEntitiesWithComponents(InputComponent.TYPE);
    
    // Process attack key presses (spacebar)
    for (const entityId of this.inputEntities) {
      const inputComponent = this.world.getComponent<InputComponent>(entityId, InputComponent.TYPE);
      
      if (inputComponent?.keyState[' ']) {
        const attackComponent = this.world.getComponent<AttackComponent>(entityId, AttackComponent.TYPE);
        
        if (attackComponent && !attackComponent.isAttacking) {
          // Start attack
          attackComponent.isAttacking = true;
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
