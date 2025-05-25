import * as PIXI from 'pixi.js';
import { TilePosition } from '../models/GridModel';

export enum TileState {
  DEFAULT,
  HOVERED,
  SELECTED
}

export class Tile extends PIXI.Container {
  private graphics: PIXI.Graphics;
  private _labelText: PIXI.Text | null = null;
  private _state: TileState = TileState.DEFAULT;
  
  // Colors and opacity
  private readonly DEFAULT_EVEN_COLOR = 0x222222;
  private readonly DEFAULT_ODD_COLOR = 0x333333;
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
        const isEvenTile = (this.gridPos.x + this.gridPos.y) % 2 === 0;
        fillColor = isEvenTile ? this.DEFAULT_EVEN_COLOR : this.DEFAULT_ODD_COLOR;
        fillAlpha = this.DEFAULT_ALPHA;
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
}
