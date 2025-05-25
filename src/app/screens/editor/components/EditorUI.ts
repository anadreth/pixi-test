export class EditorUI {
  private gridXInput!: HTMLInputElement;
  private gridYInput!: HTMLInputElement;
  private applyButton!: HTMLButtonElement;
  private saveMapButton!: HTMLButtonElement;
  private loadMapButton!: HTMLButtonElement;
  private container!: HTMLDivElement;
  private statusText!: HTMLDivElement;
  private selectionDebug!: HTMLDivElement;
  
  constructor() {
    this.createUI();
  }
  
  private createUI(): void {
    this.gridXInput = document.createElement("input");
    this.gridYInput = document.createElement("input");
    this.applyButton = document.createElement("button");
    this.saveMapButton = document.createElement("button");
    this.loadMapButton = document.createElement("button");
    this.statusText = document.createElement("div");
    this.selectionDebug = document.createElement("div");

    Object.assign(this.gridXInput, {
      placeholder: "Cols",
      type: "number",
      value: "10",
      max: "1000",
      min: "1"
    });
    
    Object.assign(this.gridYInput, {
      placeholder: "Rows",
      type: "number",
      value: "10",
      max: "1000",
      min: "1"
    });
    
    this.applyButton.textContent = "Apply Grid Size";
    this.saveMapButton.textContent = "Save Map";
    this.loadMapButton.textContent = "Load Map";
    
    // Add some styling to the save/load buttons
    Object.assign(this.saveMapButton.style, {
      marginLeft: "10px",
      backgroundColor: "#2a6",
      border: "none",
      padding: "4px 8px",
      color: "white",
      borderRadius: "3px",
      cursor: "pointer"
    });
    
    Object.assign(this.loadMapButton.style, {
      marginLeft: "5px",
      backgroundColor: "#26a",
      border: "none",
      padding: "4px 8px",
      color: "white",
      borderRadius: "3px",
      cursor: "pointer"
    });
    this.statusText.style.color = "#aaa";
    this.statusText.style.marginTop = "5px";
    this.statusText.style.fontSize = "12px";
    this.statusText.textContent = "Max grid size: 1000 x 1000";

    this.container = document.createElement("div");
    Object.assign(this.container.style, {
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

    this.container.appendChild(this.gridXInput);
    this.container.appendChild(this.gridYInput);
    this.container.appendChild(this.applyButton);
    
    // Create a container div for the map buttons to keep them separate
    const mapButtonsContainer = document.createElement("div");
    mapButtonsContainer.style.marginTop = "8px";
    mapButtonsContainer.appendChild(this.saveMapButton);
    mapButtonsContainer.appendChild(this.loadMapButton);
    this.container.appendChild(mapButtonsContainer);
    
    this.container.appendChild(this.statusText);
    this.container.appendChild(this.selectionDebug);
    document.body.appendChild(this.container);
  }
  
  /**
   * Set callback for when Apply button is clicked
   */
  public onApplyClick(callback: (cols: number, rows: number) => void): void {

    this.applyButton.onclick = () => {
      let cols = parseInt(this.gridXInput.value, 10);
      let rows = parseInt(this.gridYInput.value, 10);
      
      // Apply size limits
      const MAX_SIZE = 1000;
      if (cols > MAX_SIZE) cols = MAX_SIZE;
      if (rows > MAX_SIZE) rows = MAX_SIZE;
      
      if (!isNaN(cols) && !isNaN(rows)) {
        // Update input values to reflect any clamping
        this.gridXInput.value = cols.toString();
        this.gridYInput.value = rows.toString();
        
        callback(cols, rows);
      }
    };
  }
  
  /**
   * Update the selection display with comprehensive information
   * about selected tiles and selection operations
   */
  public updateSelectionDisplay(x: number | null, y: number | null, selectedTilesCount?: number): void {
    // Style the selection display if not already styled
    if (!this.selectionDebug.style.backgroundColor) {
      Object.assign(this.selectionDebug.style, {
        marginTop: "10px",
        padding: "5px",
        backgroundColor: "#333",
        borderRadius: "3px",
        color: "#0f0",  // Green text for visibility
        maxHeight: "150px",
        overflowY: "auto",
        fontSize: "12px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap"
      });
    }
    
    const selectionGuide = 
      "Selection Controls:\n" +
      "• Click: Select single tile\n" +
      "• Shift+Click: Add to selection\n" +
      "• Ctrl+Click: Toggle selection\n" +
      "• Click+Drag: Box select\n" +
      "• ESC: Clear selection";
    
    // Display information about selections
    if (selectedTilesCount === 0 || (x === null && y === null && selectedTilesCount === undefined)) {
      this.selectionDebug.textContent = "No tiles selected\n\n" + selectionGuide;
    } else if (selectedTilesCount !== undefined && selectedTilesCount > 0) {
      // If we have a clicked tile, show it as the last interaction
      let message = `${selectedTilesCount} tile${selectedTilesCount !== 1 ? 's' : ''} selected`;
      
      if (x !== null && y !== null) {
        message += `\nLast action: (${x}, ${y})`;
      }
      
      message += "\n\n" + selectionGuide;
      
      this.selectionDebug.textContent = message;
    } else if (x !== null && y !== null) {
      // Fall back to just showing the clicked tile
      this.selectionDebug.textContent = `Tile: (${x}, ${y})\n\n${selectionGuide}`;
    }
  }

  /**
   * Set callback for when Save Map button is clicked
   */
  public onSaveMapClick(callback: () => void): void {
    this.saveMapButton.onclick = callback;
  }
  
  /**
   * Set callback for when Load Map button is clicked
   */
  public onLoadMapClick(callback: () => void): void {
    this.loadMapButton.onclick = callback;
  }
  
  /**
   * Update the grid size input values
   */
  public updateGridSizeInputs(cols: number, rows: number): void {
    this.gridXInput.value = cols.toString();
    this.gridYInput.value = rows.toString();
  }
  
  /**
   * Remove UI from DOM
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
