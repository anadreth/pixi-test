/**
 * Entity class - essentially just an ID with associated components
 * In ECS, entities are just identifiers that components are attached to
 */
export class Entity {
  private static nextId: number = 0;
  public readonly id: number;
  
  constructor() {
    this.id = Entity.nextId++;
  }
}
