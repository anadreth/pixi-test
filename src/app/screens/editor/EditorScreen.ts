import { Container, Graphics, Point, Rectangle } from "pixi.js";

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
  private minZoom = 1;
  private maxZoom = 4;

  constructor() {
    super();

    this.editorContainer = new Container();
    this.gridOverlay = new Graphics();
    this.editorContainer.addChild(this.gridOverlay);
    this.addChild(this.editorContainer);
    
    // Set up interaction properties
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);
    
    // Draw grid and set up UI
    this.drawGrid();
    this.createDebugUI();
    this.setupZoomAndPan();
  }

  /** Draw the debug tile grid */
  private drawGrid() {
    const g = this.gridOverlay;
    g.clear();
    g.beginPath();
    g.stroke({
      color: "#fff",
      alpha: 0.5,
      width: 1 / this.zoomLevel, // dynamic width
    });

    // Vertical lines
    for (let x = 0; x <= this.gridSize.cols; x++) {
      const px = x * this.tileSize;
      g.moveTo(px, 0);
      g.lineTo(px, this.gridSize.rows * this.tileSize);
    }

    // Horizontal lines
    for (let y = 0; y <= this.gridSize.rows; y++) {
      const py = y * this.tileSize;
      g.moveTo(0, py);
      g.lineTo(this.gridSize.cols * this.tileSize, py);
    }

    g.stroke(); // Apply the stroke
  }

  /** Create basic HTML inputs for grid size */
  private createDebugUI() {
    const gridXInput = document.createElement("input");
    const gridYInput = document.createElement("input");
    const button = document.createElement("button");

    Object.assign(gridXInput, {
      placeholder: "Cols",
      type: "number",
      value: "10",
    });
    Object.assign(gridYInput, {
      placeholder: "Rows",
      type: "number",
      value: "10",
    });
    button.textContent = "Apply Grid Size";

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
    document.body.appendChild(container);

    button.onclick = () => {
      const cols = parseInt(gridXInput.value, 10);
      const rows = parseInt(gridYInput.value, 10);
      if (!isNaN(cols) && !isNaN(rows)) {
        this.gridSize = { cols, rows };
        this.drawGrid();
      }
    };
  }

  /** Setup zoom and pan interactions */
  private setupZoomAndPan() {
    // Simple zoom with mouse wheel
    window.addEventListener("wheel", (e) => {
      const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoomLevel = Math.min(
        this.maxZoom,
        Math.max(this.minZoom, this.zoomLevel + zoomAmount)
      );
      this.editorContainer.scale.set(this.zoomLevel);
      this.drawGrid();
    });
    
    // Manual implementation of drag and drop using direct DOM events
    document.addEventListener('mousedown', this.onDragStart.bind(this));
    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
  }
  
  private onDragStart(e: MouseEvent) {
    this.isDragging = true;
    this.lastPosition.set(e.clientX, e.clientY);
  }
  
  private onDragMove(e: MouseEvent) {
    if (!this.isDragging) return;
    
    // Calculate the distance moved since last position
    const dx = e.clientX - this.lastPosition.x;
    const dy = e.clientY - this.lastPosition.y;
    
    // Update editor container position
    this.editorContainer.position.x += dx;
    this.editorContainer.position.y += dy;
    
    // Store the updated position for other calculations
    this.editorOffset.x = this.editorContainer.position.x;
    this.editorOffset.y = this.editorContainer.position.y;
    
    // Update the last position for next move
    this.lastPosition.set(e.clientX, e.clientY);
  }
  
  private onDragEnd() {
    this.isDragging = false;
  }

  public resize() {}
  public prepare() {}
  public update() {}
  public async pause() {}
  public async resume() {}
  public reset() {}
  public async show(): Promise<void> {
    // Center the grid in the screen
    const appWidth = window.innerWidth;
    const appHeight = window.innerHeight;
    
    // Calculate the center position
    const gridWidth = this.gridSize.cols * this.tileSize;
    const gridHeight = this.gridSize.rows * this.tileSize;
    
    // Set initial position to center the grid
    this.editorOffset.x = (appWidth / 2) - (gridWidth / 2);
    this.editorOffset.y = (appHeight / 2) - (gridHeight / 2);
    
    // Apply the position
    this.editorContainer.position.set(this.editorOffset.x, this.editorOffset.y);
  }
  public async hide() {}
  public blur() {}
}
