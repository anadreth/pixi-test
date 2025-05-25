import { Container, Rectangle } from "pixi.js";
import { Grid } from "./components/Grid";
import { EditorUI } from "./components/EditorUI";
import { EditorInteractions } from "./components/EditorInteractions";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { GridModel } from "./models/GridModel";

export class EditorScreen extends Container {
  public static assetBundles = ["game"];

  // Main components
  private gridModel: GridModel;
  private grid: Grid;
  private editorUI: EditorUI;
  private interactions: EditorInteractions;
  private loadingIndicator: LoadingIndicator;

  // Container for the editor content
  public editorContainer: Container;

  constructor() {
    super();

    // Initialize model
    this.gridModel = new GridModel();

    // Create containers
    this.editorContainer = new Container();
    this.addChild(this.editorContainer);

    // Create grid component
    this.grid = new Grid(this.gridModel);
    this.editorContainer.addChild(this.grid);

    // Set up interactions component
    this.interactions = new EditorInteractions(this, this.editorContainer, {
      minZoom: 0.3,
      maxZoom: 4,
      initialZoom: 1
    });

    // Set up hit area for interactions
    this.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);

    // Create UI component
    this.editorUI = new EditorUI();
    this.editorUI.onApplyClick(this.handleGridSizeChange.bind(this));

    // Create loading indicator
    this.loadingIndicator = new LoadingIndicator();

    // Initial draw
    this.drawGrid();
  }

  /**
   * Handle grid size change from UI
   */
  private handleGridSizeChange(cols: number, rows: number): void {
    this.gridModel.size = { cols, rows };

    // Reset zoom and center grid
    this.interactions.resetZoom();
    this.interactions.centerOnScreen();

    // For large grids, show loading indicator and draw in background
    const totalCells = this.gridModel.totalCells;
    if (totalCells > 10000) { // Threshold for background processing
      this.loadingIndicator.show('Building grid...');

      // Use setTimeout to defer the heavy work to the next frame
      setTimeout(() => {
        this.grid.drawAsync((percent) => {
          this.loadingIndicator.updateProgress(percent);
        }).then(() => {
          this.loadingIndicator.hide();
        });
      }, 50);
    } else {
      // Small grids can be drawn synchronously
      this.drawGrid();
    }
  }

  /**
   * Draw grid synchronously
   */
  private drawGrid(): void {
    // Reset zoom and center
    this.interactions.resetZoom();
    this.interactions.centerOnScreen();

    // Draw the grid
    this.grid.draw();
  }

  // Screen lifecycle methods
  public resize() { }
  public prepare() { }
  public update() { }
  public async pause() { }
  public async resume() { }
  public reset() { }

  public async show(): Promise<void> {
    // Center the grid when showing
    this.interactions.centerOnScreen();
  }

  public async hide() { }
  public blur() { }

  /**
   * Clean up resources when the screen is destroyed
   */
  public destroy(): void {
    // Clean up UI elements
    this.editorUI.destroy();

    // Remove event listeners
    // Note: EditorInteractions should ideally have a destroy method too

    super.destroy();
  }
}
