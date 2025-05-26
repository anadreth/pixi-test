import { World } from './World';

/**
 * Base System class that all systems will extend
 * Systems contain the logic and behavior for processing entities with specific components
 */
export abstract class System {
  constructor(protected world: World) {}
  
  /**
   * Update method called each frame
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public abstract update(deltaTime: number): void;
  
  /**
   * Initialize the system
   */
  public initialize(): void {}
  
  /**
   * Clean up the system
   */
  public cleanup(): void {}
}
