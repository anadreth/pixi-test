import { Component } from '../core/Component';

/**
 * Component for movement velocity
 */
export class VelocityComponent extends Component {
  public static readonly TYPE = 'Velocity';
  
  constructor(
    public velocityX: number = 0,
    public velocityY: number = 0,
    public speed: number = 3 // Default speed from original code
  ) {
    super();
  }
}
