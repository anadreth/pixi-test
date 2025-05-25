import * as PIXI from 'pixi.js';
import { GridModel, TilePosition } from '../models/GridModel';
import { SelectionModel } from '../models/SelectionModel';
import { Tile } from './Tile';

export class Grid extends PIXI.Container {
  private tiles: Map<string, Tile> = new Map();
  private selectionBox: PIXI.Graphics;
  
  private currentHoveredTile: Tile | null = null;
  
  // Box selection properties
  private isBoxSelecting: boolean = false;
  private boxSelectionStartPosition: PIXI.Point | null = null;
  private boxSelectionCurrentPosition: PIXI.Point | null = null;

  constructor(
    private readonly model: GridModel,
    private readonly selectionModel: SelectionModel
  ) {
    super();

    // Create grid components
    this.selectionBox = new PIXI.Graphics();
    this.selectionBox.zIndex = 1; // Ensure selection box is drawn above tiles

    this.addChild(this.selectionBox);

    // Create all tiles
    this.createTiles();

    // Set up keyboard events
    this.setupKeyboardEvents();
    
    // Set up mouse events for box selection
    this.setupBoxSelectionEvents();
  }

  private createTiles(): void {
    const { rows, cols } = this.model.size;
    const tileSize = this.model.tileSize;
    const labelFrequency = this.model.labelFrequency;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Determine if this tile should show a label
        const showLabel = x % labelFrequency === 0 && y % labelFrequency === 0;

        // Create the tile
        const tile = new Tile({ x, y }, tileSize, showLabel);

        // Set up tile event handlers
        this.setupTileEvents(tile);

        // Add to container
        this.addChild(tile);

        // Store reference in map for quick access
        const key = this.getTileKey(x, y);
        this.tiles.set(key, tile);
      }
    }
  }

  private getTileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private getTile(x: number, y: number): Tile | undefined {
    return this.tiles.get(this.getTileKey(x, y));
  }

  private setupKeyboardEvents(): void {
    // Handle ESC key to clear selection
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.selectionModel.clearSelection();
        this.updateAllTileStates();
        this.emit('selection-changed', this.selectionModel.getSelectedTiles());
      }
    });
  }

  private setupTileEvents(tile: Tile): void {
    // Handle tile hover
    tile.on('tile-hover', (hoveredTile: Tile) => {
      this.currentHoveredTile = hoveredTile;
    });

    tile.on('tile-hover-end', (tile: Tile) => {
      if (this.currentHoveredTile === tile) {
        this.currentHoveredTile = null;
      }
    });

    // Handle tile selection
    tile.on('tile-select', (data: { tile: Tile, shiftKey: boolean, ctrlKey: boolean }) => {
      // If we're box selecting, don't process individual tile selections
      if (this.isBoxSelecting) return;
      
      const { tile, shiftKey, ctrlKey } = data;
      const { x, y } = tile.gridPosition;

      // If no modifier keys, clear selection
      if (!shiftKey && !ctrlKey) {
        this.selectionModel.clearSelection();
        this.updateAllTileStates();
      }

      // Toggle selection with Ctrl/Cmd key
      if (ctrlKey) {
        if (this.selectionModel.isTileSelected(x, y)) {
          this.selectionModel.deselectTile(x, y);
          tile.deselect();
        } else {
          this.selectionModel.selectTile(x, y);
          tile.select();
        }
      } else {
        // Simple selection
        this.selectionModel.selectTile(x, y);
        tile.select();
      }

      // Emit event for external listeners
      this.emit('selection-changed', this.selectionModel.getSelectedTiles());
    });
  }

  private updateAllTileStates(): void {
    // Update all tiles based on selection model
    const { rows, cols } = this.model.size;

    // Loop through all grid positions and update each tile
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = this.getTile(x, y);
        if (tile) {
          if (this.selectionModel.isTileSelected(x, y)) {
            tile.select();
          } else {
            tile.deselect();
          }
        }
      }
    }
  }

  // Public methods
  public getSelectedTiles(): TilePosition[] {
    return this.selectionModel.getSelectedTiles();
  }

  public selectTile(x: number, y: number, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.selectionModel.clearSelection();
    }

    this.selectionModel.selectTile(x, y);
    this.updateAllTileStates();
  }

  public clearSelection(): void {
    this.selectionModel.clearSelection();
    this.updateAllTileStates();
    this.clearSelectionBox();
  }
  
  // Box selection methods
  private setupBoxSelectionEvents(): void {
    // Use mouse events instead of pointer events as per user preference
    this.eventMode = 'static';
    
    // Start box selection on mouse down
    this.on('mousedown', this.onMouseDown.bind(this));
    
    // Update box selection on mouse move
    this.on('mousemove', this.onMouseMove.bind(this));
    
    // Complete box selection on mouse up
    this.on('mouseup', this.onMouseUp.bind(this));
    this.on('mouseupoutside', this.onMouseUp.bind(this));
  }
  
  private onMouseDown(event: PIXI.FederatedMouseEvent): void {
    // Only respond to left mouse button (button 0)
    if (event.button !== 0) return;
    
    // Get the mouse position in local coordinates
    const localPos = this.toLocal(event.global);
    
    // Start box selection
    this.isBoxSelecting = true;
    this.boxSelectionStartPosition = new PIXI.Point(localPos.x, localPos.y);
    
    // Convert screen position to grid position
    const tileSize = this.model.tileSize;
    const gridX = Math.floor(localPos.x / tileSize);
    const gridY = Math.floor(localPos.y / tileSize);
    
    // No need to store starting grid position as we use the selection model
    
    // Start box selection in the model
    this.selectionModel.startBoxSelection(gridX, gridY);
    
    // Initially, box selection current position is the same as start
    this.boxSelectionCurrentPosition = new PIXI.Point(localPos.x, localPos.y);
    
    // Draw initial selection box (it will be a single point)
    this.updateSelectionBox();
  }
  
  private onMouseMove(event: PIXI.FederatedMouseEvent): void {
    // If not currently box selecting, do nothing
    if (!this.isBoxSelecting) return;
    
    // Get the mouse position in local coordinates
    const localPos = this.toLocal(event.global);
    
    // Update current position
    this.boxSelectionCurrentPosition = new PIXI.Point(localPos.x, localPos.y);
    
    // Update the selection box visuals
    this.updateSelectionBox();
  }
  
  private onMouseUp(event: PIXI.FederatedMouseEvent): void {
    // If not currently box selecting, do nothing
    if (!this.isBoxSelecting) return;
    
    // Get the mouse position in local coordinates
    const localPos = this.toLocal(event.global);
    
    // Update current position one last time
    this.boxSelectionCurrentPosition = new PIXI.Point(localPos.x, localPos.y);
    
    // Convert screen position to grid position
    const tileSize = this.model.tileSize;
    const gridX = Math.floor(localPos.x / tileSize);
    const gridY = Math.floor(localPos.y / tileSize);
    
    // Complete the box selection in the model
    this.selectionModel.completeBoxSelection(gridX, gridY, event.shiftKey);
    
    // Reset box selection state
    this.isBoxSelecting = false;
    this.boxSelectionStartPosition = null;
    this.boxSelectionCurrentPosition = null;
    
    // Clear the selection box visual
    this.clearSelectionBox();
    
    // Update the states of all tiles
    this.updateAllTileStates();
    
    // Emit event for external listeners
    this.emit('selection-changed', this.selectionModel.getSelectedTiles());
  }
  
  private updateSelectionBox(): void {
    // If box selection isn't active or we don't have valid positions, do nothing
    if (!this.isBoxSelecting || !this.boxSelectionStartPosition || !this.boxSelectionCurrentPosition) {
      return;
    }
    
    // Clear the old selection box
    this.selectionBox.clear();
    
    // Calculate the rectangle coordinates
    const startX = Math.min(this.boxSelectionStartPosition.x, this.boxSelectionCurrentPosition.x);
    const startY = Math.min(this.boxSelectionStartPosition.y, this.boxSelectionCurrentPosition.y);
    const width = Math.abs(this.boxSelectionCurrentPosition.x - this.boxSelectionStartPosition.x);
    const height = Math.abs(this.boxSelectionCurrentPosition.y - this.boxSelectionStartPosition.y);
    
    // Draw selection box
    this.selectionBox.lineStyle(2, 0x3498db, 1);
    this.selectionBox.beginFill(0x3498db, 0.2);
    this.selectionBox.drawRect(startX, startY, width, height);
    this.selectionBox.endFill();
  }
  
  private clearSelectionBox(): void {
    this.selectionBox.clear();
  }
}
