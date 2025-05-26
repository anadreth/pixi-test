import { Component } from '../core/Component';

/**
 * Component for position, rotation, and scale
 */
export class TransformComponent extends Component {
  public static readonly TYPE = 'Transform';
  
  constructor(
    public x: number = 0,
    public y: number = 0,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1
  ) {
    super();
  }
}
