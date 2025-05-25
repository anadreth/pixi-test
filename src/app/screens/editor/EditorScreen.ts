import { Container, Rectangle, Point } from 'pixi.js';
import { EditorUI } from './components/EditorUI';
import { Grid } from './components/Grid';
import { GridModel } from './models/GridModel';
import { EditorInteractions } from './components/EditorInteractions';
import { SelectionModel, TilePosition } from './models/SelectionModel';
import { TilePropertiesPopup, TilePropertiesUpdateEvent } from './components/TilePropertiesPopup';
import { DialogManager } from '../../utils/DialogManager';

export class EditorScreen extends Container {
  public static assetBundles = ["game"];

  // Main components
  private gridModel: GridModel;
  private selectionModel: SelectionModel;
  private grid: Grid;
  private editorUI: EditorUI;
  private interactions: EditorInteractions;
  private tilePropertiesPopup: TilePropertiesPopup;

  // Timer for delaying popup appearance
  private popupShowTimer: any = null;

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
        
        // Show tile properties popup when tiles are selected
        this.showPropertiesPopup(selectedTiles);
      } else {
        // Selection was cleared
        this.editorUI.updateSelectionDisplay(null, null, 0);
        
        // Hide the properties popup when no tiles are selected
        this.tilePropertiesPopup.hide();
      }
    });

    // Set up interactions component
    this.interactions = new EditorInteractions(this, this.editorContainer, {
      minZoom: 0.01,
      maxZoom: 4,
      initialZoom: 1
    });

    // Set up hit area for interactions
    this.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);

    // Create UI component
    this.editorUI = new EditorUI();
    this.editorUI.onApplyClick(this.handleGridSizeChange.bind(this));
    
    // Create tile properties popup
    this.tilePropertiesPopup = new TilePropertiesPopup();
    this.tilePropertiesPopup.on('properties-updated', this.handlePropertiesUpdate.bind(this));
    this.addChild(this.tilePropertiesPopup);

    // Initial setup - reset zoom and center
    this.interactions.resetZoom();
    this.interactions.centerOnScreen();

    // Setup map save/load buttons
    this.editorUI.onSaveMapClick(this.handleSaveMap.bind(this));
    this.editorUI.onLoadMapClick(this.handleLoadMap.bind(this));
    
    this.setupEvents();
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
        
        // Show tile properties popup when tiles are selected
        this.showPropertiesPopup(selectedTiles);
      } else {
        this.editorUI.updateSelectionDisplay(null, null, 0);
        
        // Hide the properties popup when no tiles are selected
        this.tilePropertiesPopup.hide();
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

  private setupEvents(): void {
    // Clear popup timer on any mousedown to prevent popup during drag operations
    window.addEventListener('mousedown', () => {
      if (this.popupShowTimer !== null) {
        clearTimeout(this.popupShowTimer);
        this.popupShowTimer = null;
      }
    });
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
  /**
   * Handle properties update from the popup
   */
  private handlePropertiesUpdate(event: TilePropertiesUpdateEvent): void {
    const selectedTiles = this.selectionModel.getSelectedTiles();
    const updatedProperties = event.properties;
    
    // Apply properties to all selected tiles
    for (const position of selectedTiles) {
      const tile = this.grid.getTile(position.x, position.y);
      if (tile) {
        tile.properties = updatedProperties;
      }
    }
    
    // Clear selection and close popup
    this.selectionModel.clearSelection();
    this.grid.clearSelection(); // Update visual states
    this.tilePropertiesPopup.hide();
    
    // Update UI to show no selection
    this.editorUI.updateSelectionDisplay(null, null, 0);
  }
  
  /**
   * Show the properties popup for the selected tiles
   */
  private showPropertiesPopup(selectedTiles: TilePosition[]): void {
    // Always clear any pending popup timer
    if (this.popupShowTimer !== null) {
      clearTimeout(this.popupShowTimer);
      this.popupShowTimer = null;
    }
    
    // Don't show popup if no tiles are selected
    if (selectedTiles.length === 0) {
      this.tilePropertiesPopup.hide();
      return;
    }
    
    // Always hide immediately during any selection change
    this.tilePropertiesPopup.hide();
    
    // Schedule the popup to appear after a short delay (300ms)
    // This ensures we're not in the middle of a drag operation
    this.popupShowTimer = setTimeout(() => {
      // Double-check we're not selecting when the timer fires
      if (this.grid.isBoxSelecting) return;
      
      // And make sure we still have selected tiles
      const currentSelectedTiles = this.selectionModel.getSelectedTiles();
      if (currentSelectedTiles.length === 0) return;
      
      // Get the last selected tile (where drag ended) to determine popup position
      // But still use first tile for properties
      const lastTilePosition = currentSelectedTiles[currentSelectedTiles.length - 1];
      const firstTilePosition = currentSelectedTiles[0];
      const firstTile = this.grid.getTile(firstTilePosition.x, firstTilePosition.y);
      
      if (!firstTile) return;
      
      // Calculate a good position for the popup next to where the drag ended
      const tileSize = this.gridModel.tileSize;
      const worldPos = new Point(
        lastTilePosition.x * tileSize + tileSize * 1.5, 
        lastTilePosition.y * tileSize
      );
      
      // Convert to screen coordinates
      const screenPos = this.editorContainer.toGlobal(worldPos);
      
      // Show the popup with the first tile's properties
      this.tilePropertiesPopup.show(firstTile.properties, screenPos.x, screenPos.y);
    }, 300);
  }
  
  /**
   * Handle saving the map with a name prompt
   */
  private handleSaveMap(): void {
    // Check if we can save maps
    this.getSavedMapsList(); // Just to ensure the function works
    
    // Show save dialog
    DialogManager.showSaveDialog('', (mapName) => {
      if (!mapName) return; // User canceled
      
      try {
        // Create a data structure to save grid size and tile properties
        const mapData: {
          name: string,
          date: string,
          gridSize: {
            cols: number,
            rows: number
          },
          tiles: Array<{
            x: number,
            y: number,
            properties: any
          }>
        } = {
          name: mapName,
          date: new Date().toLocaleString(),
          gridSize: {
            cols: this.gridModel.size.cols,
            rows: this.gridModel.size.rows
          },
          tiles: []
        };
        
        // Iterate through all tiles and save their properties
        for (let y = 0; y < this.gridModel.size.rows; y++) {
          for (let x = 0; x < this.gridModel.size.cols; x++) {
            const tile = this.grid.getTile(x, y);
            if (tile) {
              // Push tile data with position and properties
              mapData.tiles.push({
                x,
                y,
                properties: tile.properties
              });
            }
          }
        }
        
        // Get or create the maps storage object
        const mapsStorage = this.getOrCreateMapsStorage();
        
        // Add or update this map in the storage
        mapsStorage[mapName] = mapData;
        
        // Save the updated maps storage
        localStorage.setItem('pixiEditor_maps', JSON.stringify(mapsStorage));
        
        // Show feedback
        console.log(`Map "${mapName}" saved successfully!`);
      } catch (error) {
        console.error('Error saving map:', error);
        alert('Failed to save map. See console for details.');
      }
    });
  }
  
  /**
   * Get or create the maps storage object in localStorage
   */
  private getOrCreateMapsStorage(): Record<string, any> {
    const mapsData = localStorage.getItem('pixiEditor_maps');
    if (mapsData) {
      return JSON.parse(mapsData);
    }
    return {};
  }
  
  /**
   * Get a list of saved maps
   */
  private getSavedMapsList(): {name: string, date: string}[] {
    const mapsStorage = this.getOrCreateMapsStorage();
    return Object.keys(mapsStorage).map(key => ({
      name: key,
      date: mapsStorage[key].date || 'Unknown date'
    }));
  }
  
  /**
   * Handle loading a map by showing a selection dialog
   */
  private handleLoadMap(): void {
    try {
      // Get list of saved maps
      const savedMaps = this.getSavedMapsList();
      
      if (savedMaps.length === 0) {
        alert('No saved maps found.');
        return;
      }
      
      // Show load dialog with map selection
      DialogManager.showLoadDialog(savedMaps, (selectedMapName) => {
        if (!selectedMapName) return; // User canceled
        
        try {
          // Get map data for the selected map
          const mapsStorage = this.getOrCreateMapsStorage();
          const mapData = mapsStorage[selectedMapName];
          
          if (!mapData) {
            alert(`Map "${selectedMapName}" not found.`);
            return;
          }
          
          // Recreate the grid with the saved size
          this.handleGridSizeChange(mapData.gridSize.cols, mapData.gridSize.rows);
          
          // Update UI input fields to match loaded grid size
          this.editorUI.updateGridSizeInputs(mapData.gridSize.cols, mapData.gridSize.rows);
          
          // Apply properties to all tiles
          for (const tileData of mapData.tiles) {
            const tile = this.grid.getTile(tileData.x, tileData.y);
            if (tile) {
              tile.properties = tileData.properties;
            }
          }
          
          // Show feedback
          console.log(`Map "${selectedMapName}" loaded successfully!`);
        } catch (error) {
          console.error('Error loading selected map:', error);
          alert('Failed to load map. See console for details.');
        }
      });
    } catch (error) {
      console.error('Error showing load dialog:', error);
      alert('Failed to show load dialog. See console for details.');
    }
  }

  public destroy(): void {
    // Clean up UI elements
    this.editorUI.destroy();
    this.tilePropertiesPopup.destroy();

    // Remove event listeners
    // Note: EditorInteractions should ideally have a destroy method too

    super.destroy();
  }
}
