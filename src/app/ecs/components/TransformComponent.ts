import { Component } from '../core/Component';

/**
 * Component for position, rotation, and scale
 */
export class TransformComponent extends Component {
  public static readonly TYPE = 'transform';
  public readonly type = TransformComponent.TYPE;

  public x: number = 0;
  public y: number = 0;
  public rotation: number = 0;
  public scale: number = 1;
  public direction: number = 1; // 1 = right, -1 = left

  constructor(x: number = 0, y: number = 0, direction: number = 1, rotation: number = 0, scale: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.rotation = rotation;
    this.scale = scale;
  }
}
