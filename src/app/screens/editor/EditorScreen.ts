import { Container, Graphics, Point, Rectangle, Text } from "pixi.js";

type GridSize = {
  cols: number;
  rows: number;
};

const DEFAULT_TILE_SIZE = 64;

export class EditorScreen extends Container {
  public static assetBundles = ["game"];

  public editorContainer: Container;
  private gridOverlay: Graphics;
  private gridSize: GridSize = { cols: 10, rows: 10 };
  private tileSize: number = DEFAULT_TILE_SIZE;

  // Drag state tracking
  private isDragging = false;
  private lastPosition = new Point();
  private editorOffset = new Point();

  private zoomLevel = 1;
  private minZoom = 0.3;
  private maxZoom = 4;

  constructor() {
    super();

    this.editorContainer = new Container();
    this.gridOverlay = new Graphics();
    this.editorContainer.addChild(this.gridOverlay);
    this.addChild(this.editorContainer);

    // Enable interactions
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);

    // Draw grid and set up UI
    this.drawGrid();
    this.createDebugUI();
    this.setupZoomAndPan();
  }

  /** Draw the debug tile grid */
  /**
   * Draw the grid synchronously (for small grids)
   */
  private drawGrid() {
    // Reset zoom to default
    this.zoomLevel = 1;
    this.editorContainer.scale.set(this.zoomLevel);
    
    // Clear graphics and remove children
    const g = this.gridOverlay;
    g.clear();

    while (g.children.length > 0) {
      g.removeChildAt(0);
    }
    
    // Center the grid with (0,0) at the center of screen
    this.centerGrid();

    const { cols, rows } = this.gridSize;
    const totalTiles = cols * rows;

    const isLargeGrid = totalTiles > 400;
    const labelFrequency = isLargeGrid ? 5 : 1;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        const isEvenTile = (x + y) % 2 === 0;
        const fillColor = isEvenTile ? 0x222222 : 0x333333;
        const fillAlpha = 0.3;

        g.beginFill(fillColor, fillAlpha);
        g.drawRect(px, py, this.tileSize, this.tileSize);
        g.endFill();

        if (isLargeGrid) {
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
  private async drawGridAsync(): Promise<void> {
    // Reset zoom to default
    this.zoomLevel = 1;
    this.editorContainer.scale.set(this.zoomLevel);
    
    // Clear graphics and remove children
    const g = this.gridOverlay;
    g.clear();

    // Remove all children
    while (g.children.length > 0) {
      g.removeChildAt(0);
    }
    
    // Center the grid with (0,0) at the center of screen
    this.centerGrid();

    const { cols, rows } = this.gridSize;
    const totalTiles = cols * rows;

    const isLargeGrid = totalTiles > 400;
    const labelFrequency = isLargeGrid ? 5 : 1;
    
    // For very large grids, increase label frequency even more
    const veryLargeGrid = totalTiles > 40000; // 200x200
    const labelFrequencyFinal = veryLargeGrid ? 20 : labelFrequency;
    
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
        
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        const isEvenTile = (x + y) % 2 === 0;
        const fillColor = isEvenTile ? 0x222222 : 0x333333;
        const fillAlpha = 0.3;

        g.beginFill(fillColor, fillAlpha);
        g.drawRect(px, py, this.tileSize, this.tileSize);
        g.endFill();

        // Only add labels for certain cells to improve performance
        if (x % labelFrequencyFinal === 0 && y % labelFrequencyFinal === 0) {
          this.addCoordinateLabel(x, y, px, py);
        }
        
        processedCells++;
      }
      
      // Update loading indicator with progress
      if (this.loadingIndicator) {
        const percentComplete = Math.floor((processedCells / totalTiles) * 100);
        this.loadingIndicator.textContent = `Building grid... ${percentComplete}%`;
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
  
  /**
   * Centers the grid so that cell (0,0) is at the center of the screen
   */
  private centerGrid() {
    const appWidth = window.innerWidth;
    const appHeight = window.innerHeight;
    
    // Calculate position to place (0,0) at center
    this.editorOffset.x = appWidth / 2;
    this.editorOffset.y = appHeight / 2;
    
    // Apply the position
    this.editorContainer.position.set(this.editorOffset.x, this.editorOffset.y);
  }

  private addCoordinateLabel(x: number, y: number, px: number, py: number) {
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

  // Create and track loading indicator
  private loadingIndicator: HTMLDivElement | null = null;
  
  private showLoadingIndicator() {
    if (this.loadingIndicator) return;
    
    this.loadingIndicator = document.createElement('div');
    Object.assign(this.loadingIndicator.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '5px',
      zIndex: '10000',
      fontFamily: 'monospace'
    });
    this.loadingIndicator.textContent = 'Building grid...';
    document.body.appendChild(this.loadingIndicator);
  }
  
  private hideLoadingIndicator() {
    if (this.loadingIndicator) {
      document.body.removeChild(this.loadingIndicator);
      this.loadingIndicator = null;
    }
  }

  private createDebugUI() {
    const gridXInput = document.createElement("input");
    const gridYInput = document.createElement("input");
    const button = document.createElement("button");
    const statusText = document.createElement("div");

    Object.assign(gridXInput, {
      placeholder: "Cols",
      type: "number",
      value: "10",
      max: "1000",
      min: "1"
    });
    Object.assign(gridYInput, {
      placeholder: "Rows",
      type: "number",
      value: "10",
      max: "1000",
      min: "1"
    });
    button.textContent = "Apply Grid Size";
    statusText.style.color = "#aaa";
    statusText.style.marginTop = "5px";
    statusText.style.fontSize = "12px";
    statusText.textContent = "Max grid size: 1000 x 1000";

    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: "9999",
      background: "#222",
      padding: "8px",
      color: "#fff",
      fontFamily: "monospace",
      borderRadius: "4px",
    });

    container.appendChild(gridXInput);
    container.appendChild(gridYInput);
    container.appendChild(button);
    container.appendChild(statusText);
    document.body.appendChild(container);

    button.onclick = () => {
      let cols = parseInt(gridXInput.value, 10);
      let rows = parseInt(gridYInput.value, 10);
      
      // Apply size limits
      const MAX_SIZE = 1000;
      if (cols > MAX_SIZE) cols = MAX_SIZE;
      if (rows > MAX_SIZE) rows = MAX_SIZE;
      
      if (!isNaN(cols) && !isNaN(rows)) {
        // Update input values to reflect any clamping
        gridXInput.value = cols.toString();
        gridYInput.value = rows.toString();
        
        this.gridSize = { cols, rows };
        
        // For large grids, show loading indicator and draw in background
        const totalCells = cols * rows;
        if (totalCells > 10000) { // Threshold for background processing
          this.showLoadingIndicator();
          
          // Use setTimeout to defer the heavy work to the next frame
          setTimeout(() => {
            this.drawGridAsync().then(() => {
              this.hideLoadingIndicator();
            });
          }, 50);
        } else {
          // Small grids can be drawn synchronously
          this.drawGrid();
        }
      }
    };
  }

  /** Setup zoom and pan interactions */
  private setupZoomAndPan() {
    window.addEventListener("wheel", (e) => {
      const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoomLevel = Math.min(
        this.maxZoom,
        Math.max(this.minZoom, this.zoomLevel + zoomAmount)
      );
      this.editorContainer.scale.set(this.zoomLevel);
    });

    this.on('pointerdown', (e) => {
      this.isDragging = true;
      this.lastPosition.copyFrom(e.global);
    });

    this.on('pointermove', (e) => {
      if (!this.isDragging) return;

      // Calculate movement delta
      const dx = e.global.x - this.lastPosition.x;
      const dy = e.global.y - this.lastPosition.y;

      // Move the container
      this.editorContainer.position.x += dx;
      this.editorContainer.position.y += dy;

      // Update offset for other operations
      this.editorOffset.x = this.editorContainer.position.x;
      this.editorOffset.y = this.editorContainer.position.y;

      // Update last position
      this.lastPosition.copyFrom(e.global);
    });

    this.on('pointerup', () => {
      this.isDragging = false;
    });

    this.on('pointerupoutside', () => {
      this.isDragging = false;
    });
  }

  public resize() { }
  public prepare() { }
  public update() { }
  public async pause() { }
  public async resume() { }
  public reset() { }
  public async show(): Promise<void> {
    // Center the grid when showing
    this.centerGrid();
  }
  public async hide() { }
  public blur() { }
}
