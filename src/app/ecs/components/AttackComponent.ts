import { Component } from '../core/Component';
import { Graphics } from 'pixi.js';
import { Entity } from '../core/Entity';

/**
 * Component for handling attack states and hitboxes
 */
export class AttackComponent extends Component {
  public static readonly TYPE = 'Attack';
  
  // Attack properties
  public isAttacking: boolean = false;
  public attackDirection: 'left' | 'right' | 'up' | 'down' = 'right';
  public facingDirection: 'left' | 'right' = 'right';
  public attackHitbox?: Graphics;
  
  // The entity ID of the attack hitbox entity
  public attackEntityId?: number;
  public readonly hitboxSize: number = 64;
  public hitboxAlpha: number = 0.3;
  
  constructor() {
    super();
  }
}
