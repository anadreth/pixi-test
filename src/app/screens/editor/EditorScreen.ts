import { Container, Rectangle } from "pixi.js";
import { Grid } from "./components/Grid";
import { EditorUI } from "./components/EditorUI";
import { EditorInteractions } from "./components/EditorInteractions";
import { GridModel, TilePosition } from "./models/GridModel";
import { SelectionModel } from "./models/SelectionModel";

export class EditorScreen extends Container {
  public static assetBundles = ["game"];

  // Main components
  private gridModel: GridModel;
  private selectionModel: SelectionModel;
  private grid: Grid;
  private editorUI: EditorUI;
  private interactions: EditorInteractions;

  // Container for the editor content
  public editorContainer: Container;

  constructor() {
    super();

    // Initialize models
    this.gridModel = new GridModel();
    this.selectionModel = new SelectionModel();

    // Create containers
    this.editorContainer = new Container();
    this.addChild(this.editorContainer);

    // Create grid component with selection model
    this.grid = new Grid(this.gridModel, this.selectionModel);
    this.editorContainer.addChild(this.grid);

    // Set up selection change handler using events
    this.grid.on('selection-changed', (selectedTiles: TilePosition[]) => {
      // Get the count of selected tiles
      const selectionCount = selectedTiles.length;

      // Update UI with selected tile info and count
      if (selectionCount > 0) {
        // Use the first selected tile for display
        const lastTile = selectedTiles[0]; // Grid model returns tile positions
        this.editorUI.updateSelectionDisplay(lastTile.x, lastTile.y, selectionCount);
      } else {
        // Selection was cleared
        this.editorUI.updateSelectionDisplay(null, null, 0);
      }
    });

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

    // Initial setup - reset zoom and center
    this.interactions.resetZoom();
    this.interactions.centerOnScreen();
  }

  /**
   * Handle grid size change from UI
   */
  private handleGridSizeChange(cols: number, rows: number): void {
    // Update grid model
    this.gridModel.size = { cols, rows };

    // Create a new grid instance with the updated model
    const oldGrid = this.grid;
    this.grid = new Grid(this.gridModel, this.selectionModel);

    // Remove old grid and add new one
    this.editorContainer.removeChild(oldGrid);
    this.editorContainer.addChild(this.grid);

    // Set up selection change handler again
    this.grid.on('selection-changed', (selectedTiles: TilePosition[]) => {
      const selectionCount = selectedTiles.length;

      if (selectionCount > 0) {
        const lastTile = selectedTiles[0]; // Grid model returns tile positions
        this.editorUI.updateSelectionDisplay(lastTile.x, lastTile.y, selectionCount);
      } else {
        this.editorUI.updateSelectionDisplay(null, null, 0);
      }
    });

    this.resetGridView();

    // Clean up old grid
    oldGrid.destroy();
  }

  /**
   * Reset grid view
   */
  private resetGridView(): void {
    // Reset zoom and center
    this.interactions.resetZoom();
    this.interactions.centerOnScreen();
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
