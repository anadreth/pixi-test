import { Component } from './Component';
import { Entity } from './Entity';
import { System } from './System';

/**
 * World class - the main container for the ECS architecture
 * Manages entities, components, and systems
 */
export class World {
  private systems: System[] = [];
  private entities: Map<number, Entity> = new Map();
  private components: Map<string, Map<number, Component>> = new Map();
  private entitiesToDestroy: number[] = [];

  /**
   * Create a new entity
   */
  public createEntity(): Entity {
    const entity = new Entity();
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Destroy an entity and all its components
   */
  public destroyEntity(entityId: number): void {
    // Queue entity for destruction at the end of the update cycle
    this.entitiesToDestroy.push(entityId);
  }

  /**
   * Actually destroy entities (called at the end of update)
   */
  private processEntityDestruction(): void {
    for (const entityId of this.entitiesToDestroy) {
      // Remove all components
      for (const [_, componentMap] of this.components) {
        componentMap.delete(entityId);
      }
      // Remove entity
      this.entities.delete(entityId);
    }
    // Clear the queue
    this.entitiesToDestroy = [];
  }

  /**
   * Add a component to an entity
   */
  public addComponent<T extends Component>(entityId: number, component: T): T {
    // Get component type
    const componentType = (component.constructor as any).TYPE;
    
    // Ensure we have a map for this component type
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    
    // Set the entity reference on the component
    component.entity = entityId;
    
    // Add component to the map
    this.components.get(componentType)!.set(entityId, component);
    
    return component;
  }

  /**
   * Get a component for an entity
   */
  public getComponent<T extends Component>(entityId: number, componentType: string): T | undefined {
    // Check if we have components of this type
    const componentMap = this.components.get(componentType);
    if (!componentMap) {
      return undefined;
    }
    
    // Get the component for this entity
    return componentMap.get(entityId) as T | undefined;
  }

  /**
   * Remove a component from an entity
   */
  public removeComponent(entityId: number, componentType: string): boolean {
    // Check if we have components of this type
    const componentMap = this.components.get(componentType);
    if (!componentMap) {
      return false;
    }
    
    // Remove the component
    return componentMap.delete(entityId);
  }

  /**
   * Get all entities that have all of the specified component types
   */
  public getEntitiesWithComponents(...componentTypes: string[]): number[] {
    // If no component types are specified, return empty array
    if (componentTypes.length === 0) {
      return [];
    }
    
    // Get all entities that have the first component type
    const firstComponentType = componentTypes[0];
    const firstComponentMap = this.components.get(firstComponentType);
    if (!firstComponentMap) {
      return [];
    }
    
    // Start with all entities that have the first component
    const candidateEntities = Array.from(firstComponentMap.keys());
    
    // Filter out entities that don't have all required components
    return candidateEntities.filter(entityId => {
      // Check if entity has all component types
      for (let i = 1; i < componentTypes.length; i++) {
        const componentType = componentTypes[i];
        const componentMap = this.components.get(componentType);
        if (!componentMap || !componentMap.has(entityId)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Add a system to the world
   */
  public addSystem(system: System): System {
    this.systems.push(system);
    system.initialize();
    return system;
  }

  /**
   * Get a system by its class
   */
  public getSystem<T extends System>(systemClass: new (...args: any[]) => T): T | undefined {
    return this.systems.find(system => system instanceof systemClass) as T | undefined;
  }

  /**
   * Update all systems
   */
  public update(deltaTime: number): void {
    // Update all systems
    for (const system of this.systems) {
      system.update(deltaTime);
    }
    
    // Process entity destruction
    this.processEntityDestruction();
  }

  /**
   * Clean up all systems and resources
   */
  public cleanup(): void {
    for (const system of this.systems) {
      system.cleanup();
    }
    this.systems = [];
    this.entities.clear();
    this.components.clear();
    this.entitiesToDestroy = [];
  }
}
