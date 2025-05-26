import { Component } from '../core/Component';
import { Graphics } from 'pixi.js';

/**
 * HitboxComponent manages entity hitboxes for collision detection
 */
export class HitboxComponent extends Component {
  public static readonly TYPE = 'hitbox';
  public type = HitboxComponent.TYPE;
  
  // The actual hitbox graphic
  private hitbox: Graphics;
  
  // Hitbox properties
  private width: number;
  private height: number;
  private offsetX: number;
  private offsetY: number;
  
  // Whether this is an attack hitbox
  private isAttackHitbox: boolean;
  
  // Damage amount (for attack hitboxes)
  private damage: number;
  
  // Time to live (for temporary hitboxes like attacks)
  private ttl: number = -1; // -1 means permanent
  
  /**
   * Create a hitbox component
   * @param hitbox The graphics object representing the hitbox
   * @param width Width of the hitbox
   * @param height Height of the hitbox
   * @param offsetX X offset from entity center
   * @param offsetY Y offset from entity center
   * @param isAttackHitbox Whether this is an attack hitbox
   * @param damage Damage amount (for attack hitboxes)
   * @param ttl Time to live in ms (for temporary hitboxes)
   */
  constructor(
    hitbox: Graphics,
    width: number,
    height: number,
    offsetX: number = 0,
    offsetY: number = 0,
    isAttackHitbox: boolean = false,
    damage: number = 0,
    ttl: number = -1
  ) {
    super();
    this.hitbox = hitbox;
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.isAttackHitbox = isAttackHitbox;
    this.damage = damage;
    this.ttl = ttl;
  }
  
  /**
   * Get the hitbox graphic
   */
  public getHitbox(): Graphics {
    return this.hitbox;
  }
  
  /**
   * Get hitbox bounds
   * @returns [x, y, width, height] representing the hitbox bounds
   */
  public getBounds(): [number, number, number, number] {
    const x = this.hitbox.x + this.offsetX;
    const y = this.hitbox.y + this.offsetY;
    return [x, y, this.width, this.height];
  }
  
  /**
   * Check if this is an attack hitbox
   */
  public isAttack(): boolean {
    return this.isAttackHitbox;
  }
  
  /**
   * Get damage amount
   */
  public getDamage(): number {
    return this.damage;
  }
  
  /**
   * Update TTL
   * @param deltaTime Time elapsed since last update
   * @returns True if hitbox is still alive, false if expired
   */
  public updateTTL(deltaTime: number): boolean {
    if (this.ttl === -1) return true; // Permanent hitbox
    
    this.ttl -= deltaTime;
    return this.ttl > 0;
  }
}
