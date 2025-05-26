import { System } from "../core/System";
import { World } from "../core/World";
import { HealthComponent } from "../components/HealthComponent";

/**
 * HealthSystem updates health bars for entities
 * Using a simple, reliable implementation
 */
export class HealthSystem extends System {
  constructor(world: World) {
    super(world);
  }

  /**
   * Update all health bars
   * @param deltaTime Time since last update in ms
   */
  public update(_deltaTime: number): void {
    // Get all entities in the world
    for (let i = 0; i < 1000; i++) { // Loop through a reasonable number of entity IDs
      // Try to get a health component for this entity ID
      const health = this.world.getComponent<HealthComponent>(i, HealthComponent.TYPE);
      
      // If we found a health component, update its position
      if (health) {
        // Make sure the health component has its world reference
        // Always set it to be sure it's up-to-date
        health.setWorld(this.world);
        
        // Update the health bar position
        health.updatePosition();
      }
    }
  }
}
