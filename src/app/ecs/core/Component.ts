/**
 * Base Component class that all components will extend
 * Components are pure data containers with no behavior
 */
export abstract class Component {
  // Unique identifier for component type
  public static readonly TYPE: string;
  
  // Entity this component is attached to
  public entity: number = -1;
}
