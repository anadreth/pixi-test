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
    // Get all entities with health components
    const entities = this.world.getEntitiesWithComponents(HealthComponent.TYPE);

    // Update each health component's position and visibility
    for (const entityId of entities) {
      const health = this.world.getComponent<HealthComponent>(entityId, HealthComponent.TYPE);
      
      if (health) {
        // Make sure the health component has its world reference
        health.setWorld(this.world);
        
        // Update the health bar position
        health.updatePosition();
        
        // Force health bar to be visible unless entity is dead
        const container = health.getContainer();
        container.visible = true;
        container.zIndex = 100; // Keep a high z-index

        // Log health bar status every few seconds for debugging
        if (Math.random() < 0.01) { // Only log occasionally to avoid spam
          console.log(`Health bar visible for entity ${entityId}: ${container.visible}, zIndex: ${container.zIndex}`);
        }
      }
    }
  }
}
