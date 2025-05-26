import { Component } from '../core/Component';
import { Sprite, Container, Texture } from 'pixi.js';

/**
 * Component for visual representation using PIXI sprites
 */
export class SpriteComponent extends Component {
  public static readonly TYPE = 'Sprite';
  
  public container: Container;
  public sprite: Sprite;
  public animationFrames: {
    idle: Texture[];
    walking: Texture[];
    attackUp: Texture[];
    attackDown: Texture[];
    attackHorizontal: Texture[];
  };
  
  constructor(
    sprite: Sprite,
    container: Container = new Container(),
    frames?: {
      idle: Texture[];
      walking: Texture[];
      attackUp: Texture[];
      attackDown: Texture[];
      attackHorizontal: Texture[];
    }
  ) {
    super();
    this.sprite = sprite;
    this.container = container;
    this.container.addChild(this.sprite);
    
    // Setup default animation frames if not provided
    this.animationFrames = frames || {
      idle: [],
      walking: [],
      attackUp: [],
      attackDown: [],
      attackHorizontal: []
    };
  }
}
