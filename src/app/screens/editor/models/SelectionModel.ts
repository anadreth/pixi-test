export interface TilePosition {
  x: number;
  y: number;
}

export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Helper function to create a unique key for a tile position
function getTileKey(x: number, y: number): string {
  return `${x},${y}`;
}

export class SelectionModel {
  // Map to store selected tiles by their position key
  private selectedTiles: Map<string, TilePosition> = new Map();
  
  // Store the last selected tile for reference
  private lastSelectedTile: TilePosition | null = null;
  
  // For box selection
  private boxSelectionStart: TilePosition | null = null;
  
  /**
   * Single-click selection (standard behavior)
   * - Normal click: Select only this tile, deselect others
   * - Ctrl+click: Toggle this tile in the selection
   * - Shift+click: Add this tile to the current selection
   */
  public selectTileWithModifiers(x: number, y: number, ctrlKey: boolean, shiftKey: boolean): void {
    const position = { x, y };
    const key = getTileKey(x, y);
    
    if (ctrlKey) {
      // Ctrl+click: Toggle this specific tile without affecting others
      if (this.selectedTiles.has(key)) {
        this.selectedTiles.delete(key);
      } else {
        this.selectedTiles.set(key, position);
      }
    } else if (shiftKey) {
      // Shift+click: Add to selection without deselecting others
      this.selectedTiles.set(key, position);
    } else {
      // Normal click: Select only this tile
      this.selectedTiles.clear();
      this.selectedTiles.set(key, position);
    }
    
    // Store as last selected tile
    this.lastSelectedTile = position;
  }
  
  /**
   * Toggle the selection state of a tile
   * Returns true if the tile was selected, false if it was deselected
   */
  public toggleTile(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const position = { x, y };
    
    if (this.selectedTiles.has(key)) {
      // Tile is already selected, so deselect it
      this.selectedTiles.delete(key);
      return false;
    } else {
      // Tile is not selected, so select it
      this.selectedTiles.set(key, position);
      this.lastSelectedTile = position;
      return true;
    }
  }
  
  /**
   * Select a specific tile (replacing current selection)
   */
  public selectTile(x: number, y: number): void {
    this.selectedTiles.clear();
    const position = { x, y };
    const key = getTileKey(x, y);
    this.selectedTiles.set(key, position);
    this.lastSelectedTile = position;
  }
  
  /**
   * Clear all selected tiles
   */
  public clearSelection(): void {
    this.selectedTiles.clear();
    this.lastSelectedTile = null;
    this.boxSelectionStart = null;
  }
  
  /**
   * Deselect a specific tile
   */
  public deselectTile(x: number, y: number): void {
    const key = getTileKey(x, y);
    this.selectedTiles.delete(key);
  }
  
  /**
   * Start a box selection from a specific tile
   */
  public startBoxSelection(x: number, y: number): void {
    console.log(x, y);
    this.boxSelectionStart = { x, y };
  }
  
  /**
   * Complete a box selection from the starting point to the given end point
   * @param endX The ending X coordinate
   * @param endY The ending Y coordinate
   * @param appendToSelection If true, adds to existing selection; if false, replaces it
   */
  public completeBoxSelection(endX: number, endY: number, appendToSelection: boolean = false): void {
    console.log(endX, endY, "END");
    if (!this.boxSelectionStart) return;
    
    // If start and end points are the same, this isn't a real drag operation, just a click
    // In this case, we should rely on the selectTileWithModifiers method, which was already called
    if (this.boxSelectionStart.x === endX && this.boxSelectionStart.y === endY) {
      // Just clear the box selection state and return without changing selection
      this.boxSelectionStart = null;
      return;
    }
    
    // Determine the rectangle corners (normalize coordinates)
    // Important: We need to make sure we use the exact same calculation as in the Grid.updateSelectionBox method
    const startX = Math.min(this.boxSelectionStart.x, endX);
    const startY = Math.min(this.boxSelectionStart.y, endY);
    const endBoxX = Math.max(this.boxSelectionStart.x, endX);
    const endBoxY = Math.max(this.boxSelectionStart.y, endY);
    console.log(startX, startY, endBoxX, endBoxY, "BOX");
    // Clear existing selection if not appending
    if (!appendToSelection) {
      this.selectedTiles.clear();
    }
    
    // Select all tiles within the box - making sure we include the end tile
    // The loop should go from startX to endBoxX (inclusive) and startY to endBoxY (inclusive)
    for (let x = startX; x <= endBoxX; x++) {
      for (let y = startY; y <= endBoxY; y++) {
        const key = getTileKey(x, y);
        this.selectedTiles.set(key, { x, y });
      }
    }
    
    // Update last selected tile
    this.lastSelectedTile = { x: endX, y: endY };
    
    // Reset box selection start
    this.boxSelectionStart = null;
  }
  
  /**
   * Get the current box selection if one is in progress
   */
  public getBoxSelection(currentX: number, currentY: number): SelectionRect | null {
    if (!this.boxSelectionStart) return null;
    
    return {
      startX: this.boxSelectionStart.x,
      startY: this.boxSelectionStart.y,
      endX: currentX,
      endY: currentY
    };
  }
  
  /**
   * Get all currently selected tile positions
   */
  public getSelectedTiles(): TilePosition[] {
    return Array.from(this.selectedTiles.values());
  }
  
  /**
   * Get the last selected tile
   */
  public getLastSelectedTile(): TilePosition | null {
    return this.lastSelectedTile;
  }
  
  /**
   * Get the number of selected tiles
   */
  public getSelectionCount(): number {
    return this.selectedTiles.size;
  }
  
  /**
   * Check if a specific tile is currently selected
   */
  public isTileSelected(x: number, y: number): boolean {
    return this.selectedTiles.has(getTileKey(x, y));
  }
  
  /**
   * Check if any tile is selected
   */
  public hasSelection(): boolean {
    return this.selectedTiles.size > 0;
  }
}
