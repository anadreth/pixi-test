import { Component } from '../core/Component';

/**
 * Component for handling keyboard input
 */
export class InputComponent extends Component {
  public static readonly TYPE = 'Input';
  
  // Keyboard state
  public keyState: { [key: string]: boolean } = {};
  
  constructor() {
    super();
  }
}
