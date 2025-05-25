export type GridSize = {
  cols: number;
  rows: number;
};

export const DEFAULT_TILE_SIZE = 64;

export class GridModel {
  public size: GridSize = { cols: 10, rows: 10 };
  public tileSize: number = DEFAULT_TILE_SIZE;
  
  constructor(initialCols = 10, initialRows = 10, tileSize = DEFAULT_TILE_SIZE) {
    this.size = { cols: initialCols, rows: initialRows };
    this.tileSize = tileSize;
  }
  
  /**
   * Calculates the total number of cells in the grid
   */
  public get totalCells(): number {
    return this.size.cols * this.size.rows;
  }
  
  /**
   * Checks if the grid should be considered large
   */
  public get isLargeGrid(): boolean {
    return this.totalCells > 400;
  }
  
  /**
   * Checks if the grid should be considered very large
   */
  public get isVeryLargeGrid(): boolean {
    return this.totalCells > 40000; // 200x200
  }
  
  /**
   * Gets the appropriate frequency for coordinate labels based on grid size
   */
  public get labelFrequency(): number {
    if (this.isVeryLargeGrid) {
      return 20;
    } else if (this.isLargeGrid) {
      return 5;
    }
    return 1;
  }
}
