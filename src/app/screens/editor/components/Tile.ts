import * as PIXI from 'pixi.js';
import { TilePosition } from '../models/GridModel';
import { TileProperties, DEFAULT_PROPERTIES } from '../models/TileProperties';

export enum TileState {
  DEFAULT,
  HOVERED,
  SELECTED
}

export class Tile extends PIXI.Container {
  private graphics: PIXI.Graphics;
  private _labelText: PIXI.Text | null = null;
  private _state: TileState = TileState.DEFAULT;
  
  // Tile properties
  private _properties: TileProperties = { ...DEFAULT_PROPERTIES };
  
  // Colors and opacity
  private readonly DEFAULT_ALPHA = 0.3;
  private readonly HOVER_COLOR = 0x3498db;
  private readonly HOVER_ALPHA = 0.6;
  private readonly SELECTION_COLOR = 0xf39c12;
  private readonly SELECTION_ALPHA = 0.8;

  constructor(
    private readonly gridPos: TilePosition,
    private readonly tileSize: number,
    showLabel: boolean = false
  ) {
    super();
    
    // Set position based on grid coordinates
    this.x = gridPos.x * tileSize;
    this.y = gridPos.y * tileSize;
    
    // Create graphics for the tile
    this.graphics = new PIXI.Graphics();
    this.addChild(this.graphics);
    
    // Draw initial state
    this.draw();
    
    // Add label if needed
    if (showLabel) {
      this.createLabel();
    }
    
    // Set up interactivity
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    // Set up event listeners
    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
    this.on('pointerdown', this.onPointerDown.bind(this));
  }
  
  // Getters
  // Return grid position instead of overriding the PIXI.Container position
  public get gridPosition(): TilePosition {
    return this.gridPos;
  }
  
  // State management
  private setState(state: TileState): void {
    if (this._state !== state) {
      this._state = state;
      this.draw();
    }
  }
  
  // Event handlers
  private onPointerOver(): void {
    if (this._state !== TileState.SELECTED) {
      this.setState(TileState.HOVERED);
    }
    
    this.emit('tile-hover', this);
  }
  
  private onPointerOut(): void {
    if (this._state === TileState.HOVERED) {
      this.setState(TileState.DEFAULT);
    }
    
    this.emit('tile-hover-end', this);
  }
  
  private onPointerDown(event: PIXI.FederatedPointerEvent): void {
    this.emit('tile-select', {
      tile: this,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey || event.metaKey
    });
  }
  
  // Visual methods
  private createLabel(): void {
    const labelText = `${this.gridPos.x},${this.gridPos.y}`;
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF
    });
    
    this._labelText = new PIXI.Text(labelText, style);
    this._labelText.anchor.set(0.5);
    this._labelText.position.set(this.tileSize / 2, this.tileSize / 2);
    this.addChild(this._labelText);
  }
  
  private draw(): void {
    this.graphics.clear();
    
    let fillColor: number;
    let fillAlpha: number;
    
    // Base color based on texture
    let baseColor: number;
    switch (this._properties.texture) {
      case 'grass':
        baseColor = 0x33AA33; // Green
        break;
      case 'stone':
        baseColor = 0x888888; // Gray
        break;
      case 'sand':
        baseColor = 0xF0E68C; // Sand yellow
        break;
      case 'water':
        baseColor = 0x4444FF; // Blue
        break;
      case 'snow':
        baseColor = 0xEEEEEE; // White
        break;
      default:
        baseColor = 0x33AA33; // Default green
    }
    
    // Adjust color based on elevation (brighter = higher)
    const elevationFactor = Math.max(0, Math.min(0.5, this._properties.elevation * 0.05));
    const adjustedColor = this.adjustColorForElevation(baseColor, elevationFactor);
    
    // Final color based on state
    switch (this._state) {
      case TileState.SELECTED:
        fillColor = this.SELECTION_COLOR;
        fillAlpha = this.SELECTION_ALPHA;
        break;
      case TileState.HOVERED:
        fillColor = this.HOVER_COLOR;
        fillAlpha = this.HOVER_ALPHA;
        break;
      default:
        fillColor = adjustedColor;
        fillAlpha = this._properties.walkable ? this.DEFAULT_ALPHA : this.DEFAULT_ALPHA * 2;
    }
    
    this.graphics.beginFill(fillColor, fillAlpha);
    this.graphics.drawRect(0, 0, this.tileSize, this.tileSize);
    this.graphics.endFill();
  }
  
  // Public methods
  public select(): void {
    this.setState(TileState.SELECTED);
  }
  
  public deselect(): void {
    this.setState(TileState.DEFAULT);
  }
  
  public isSelected(): boolean {
    return this._state === TileState.SELECTED;
  }
  
  // Properties getters and setters
  public get properties(): TileProperties {
    return { ...this._properties };
  }
  
  public set properties(newProps: Partial<TileProperties>) {
    // Update only the properties that are provided
    this._properties = { ...this._properties, ...newProps };
    
    // Redraw the tile to reflect property changes
    this.draw();
  }
  
  // Property-specific getters and setters
  public get elevation(): number {
    return this._properties.elevation;
  }
  
  public set elevation(value: number) {
    this._properties.elevation = value;
    this.draw();
  }
  
  public get texture(): string {
    return this._properties.texture;
  }
  
  public set texture(value: string) {
    this._properties.texture = value;
    this.draw();
  }
  
  public get walkable(): boolean {
    return this._properties.walkable;
  }
  
  public set walkable(value: boolean) {
    this._properties.walkable = value;
    this.draw();
  }
  
  // Helper method to adjust color based on elevation
  private adjustColorForElevation(color: number, factor: number): number {
    // Extract RGB components
    const r = (color >> 16) & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = color & 0xFF;
    
    // Brighten based on elevation
    const brightenR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const brightenG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const brightenB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    // Combine back to hex
    return (brightenR << 16) | (brightenG << 8) | brightenB;
  }
}
