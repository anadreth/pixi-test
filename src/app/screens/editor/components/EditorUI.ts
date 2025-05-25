export class EditorUI {
  private gridXInput!: HTMLInputElement;
  private gridYInput!: HTMLInputElement;
  private applyButton!: HTMLButtonElement;
  private container!: HTMLDivElement;
  private statusText!: HTMLDivElement;
  
  constructor() {
    this.createUI();
  }
  
  private createUI(): void {
    this.gridXInput = document.createElement("input");
    this.gridYInput = document.createElement("input");
    this.applyButton = document.createElement("button");
    this.statusText = document.createElement("div");

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
    this.container.appendChild(this.statusText);
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
   * Remove UI from DOM
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
