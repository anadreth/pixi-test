import * as PIXI from 'pixi.js';
import { GridModel, TilePosition } from '../models/GridModel';
import { SelectionModel } from '../models/SelectionModel';
import { Tile } from './Tile';

export class Grid extends PIXI.Container {
  private tiles: Map<string, Tile> = new Map();
  private selectionBox: PIXI.Graphics;

  private currentHoveredTile: Tile | null = null;

  constructor(
    private readonly model: GridModel,
    private readonly selectionModel: SelectionModel
  ) {
    super();

    // Create grid components
    this.selectionBox = new PIXI.Graphics();

    this.addChild(this.selectionBox);

    // Create all tiles
    this.createTiles();

    // Set up keyboard events
    this.setupKeyboardEvents();
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
  }
}
