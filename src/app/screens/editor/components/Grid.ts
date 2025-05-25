import { Container, Graphics, Text } from 'pixi.js';
import { GridModel } from '../models/GridModel';

export class Grid extends Container {
  private gridOverlay!: Graphics;
  private model!: GridModel;

  constructor(model: GridModel) {
    super();
    this.model = model;
    this.gridOverlay = new Graphics();
    this.addChild(this.gridOverlay);
  }

  /**
   * Draw the grid synchronously (for small grids)
   */
  public draw(): void {
    // Clear graphics and remove children
    const g = this.gridOverlay;
    g.clear();

    while (g.children.length > 0) {
      g.removeChildAt(0);
    }

    const { cols, rows } = this.model.size;
    // No need for totalTiles here
    const labelFrequency = this.model.labelFrequency;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const px = x * this.model.tileSize;
        const py = y * this.model.tileSize;

        const isEvenTile = (x + y) % 2 === 0;
        const fillColor = isEvenTile ? 0x222222 : 0x333333;
        const fillAlpha = 0.3;

        g.beginFill(fillColor, fillAlpha);
        g.drawRect(px, py, this.model.tileSize, this.model.tileSize);
        g.endFill();

        if (this.model.isLargeGrid) {
          if (x % labelFrequency === 0 && y % labelFrequency === 0) {
            this.addCoordinateLabel(x, y, px, py);
          }
        } else {
          this.addCoordinateLabel(x, y, px, py);
        }
      }
    }
  }

  /**
   * Draw the grid asynchronously with chunking for large grids
   * This prevents browser freezing by breaking the work into smaller parts
   */
  public async drawAsync(onProgress?: (percent: number) => void): Promise<void> {
    // Clear graphics and remove children
    const g = this.gridOverlay;
    g.clear();

    // Remove all children
    while (g.children.length > 0) {
      g.removeChildAt(0);
    }

    const { cols } = this.model.size; // Only using cols here
    const totalTiles = this.model.totalCells;
    const labelFrequency = this.model.labelFrequency;
    
    // Process grid in chunks to avoid freezing the browser
    const CHUNK_SIZE = 1000; // Process this many cells at a time
    let processedCells = 0;
    
    // Process a chunk of the grid
    const processChunk = async () => {
      const chunkEndIndex = Math.min(processedCells + CHUNK_SIZE, totalTiles);
      
      while (processedCells < chunkEndIndex) {
        // Convert cell index to x,y coordinates
        const x = processedCells % cols;
        const y = Math.floor(processedCells / cols);
        
        const px = x * this.model.tileSize;
        const py = y * this.model.tileSize;

        const isEvenTile = (x + y) % 2 === 0;
        const fillColor = isEvenTile ? 0x222222 : 0x333333;
        const fillAlpha = 0.3;

        g.beginFill(fillColor, fillAlpha);
        g.drawRect(px, py, this.model.tileSize, this.model.tileSize);
        g.endFill();

        // Only add labels for certain cells to improve performance
        if (x % labelFrequency === 0 && y % labelFrequency === 0) {
          this.addCoordinateLabel(x, y, px, py);
        }
        
        processedCells++;
      }
      
      // Report progress if callback provided
      const percentComplete = Math.floor((processedCells / totalTiles) * 100);
      if (onProgress) {
        onProgress(percentComplete);
      }
      
      // If there are more cells to process, schedule the next chunk
      if (processedCells < totalTiles) {
        // Give browser time to update UI before next chunk
        return new Promise<void>(resolve => {
          setTimeout(() => processChunk().then(resolve), 0);
        });
      }
    };
    
    // Start processing the first chunk
    await processChunk();
  }

  private addCoordinateLabel(x: number, y: number, px: number, py: number): void {
    const coordText = `${x},${y}`;
    const textStyle = {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff
    };

    const text = new Text(coordText, textStyle);
    text.position.set(px + 2, py + 2);
    text.alpha = 0.7;
    this.gridOverlay.addChild(text);
  }
}
