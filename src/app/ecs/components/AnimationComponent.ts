import { Component } from '../core/Component';

/**
 * Component for handling animations
 */
export class AnimationComponent extends Component {
  public static readonly TYPE = 'Animation';
  
  // Animation state
  public isPlaying: boolean = false;
  public currentFrame: number = 0;
  public elapsedTime: number = 0;
  public frameDuration: number = 100; // Time between frames in milliseconds
  public currentAnimation: string = 'idle';
  
  // For attack animations
  public isAttacking: boolean = false;
  public attackFrameIndex: number = 0;
  
  constructor() {
    super();
  }
}
