/**
 * Simple modal dialog manager for the editor
 */
export class DialogManager {
  private static overlay: HTMLDivElement | null = null;
  private static activeDialog: HTMLDivElement | null = null;
  
  /**
   * Show a dialog with an input field for naming maps
   */
  public static showSaveDialog(initialName: string = '', callback: (name: string | null) => void): void {
    // Create the overlay if it doesn't exist
    this.createOverlay();
    
    // Create dialog
    const dialog = document.createElement('div');
    Object.assign(dialog.style, {
      backgroundColor: '#333',
      padding: '15px',
      borderRadius: '5px',
      width: '300px',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '10001',
      color: 'white',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
    });
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Save Map';
    title.style.margin = '0 0 15px 0';
    dialog.appendChild(title);
    
    // Input field
    const input = document.createElement('input');
    Object.assign(input.style, {
      width: '100%',
      padding: '8px',
      marginBottom: '15px',
      boxSizing: 'border-box',
      border: '1px solid #555',
      borderRadius: '3px',
      backgroundColor: '#222',
      color: 'white'
    });
    input.placeholder = 'Enter map name...';
    input.value = initialName;
    dialog.appendChild(input);
    
    // Set focus on the input when dialog appears
    setTimeout(() => input.focus(), 50);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      padding: '8px 15px',
      marginRight: '10px',
      border: 'none',
      borderRadius: '3px',
      backgroundColor: '#555',
      color: 'white',
      cursor: 'pointer'
    });
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
      this.closeDialog();
      callback(null);
    };
    buttonContainer.appendChild(cancelBtn);
    
    // Save button
    const saveBtn = document.createElement('button');
    Object.assign(saveBtn.style, {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '3px',
      backgroundColor: '#2a6',
      color: 'white',
      cursor: 'pointer'
    });
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => {
      const mapName = input.value.trim();
      if (mapName) {
        this.closeDialog();
        callback(mapName);
      } else {
        input.style.border = '1px solid red';
        input.focus();
      }
    };
    buttonContainer.appendChild(saveBtn);
    
    // Also submit when pressing Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveBtn.click();
      } else if (e.key === 'Escape') {
        cancelBtn.click();
      }
    });
    
    dialog.appendChild(buttonContainer);
    
    // Show the dialog
    this.activeDialog = dialog;
    document.body.appendChild(dialog);
  }
  
  /**
   * Show a dialog with a list of saved maps to load
   */
  public static showLoadDialog(maps: {name: string, date: string}[], callback: (mapName: string | null) => void): void {
    // Create the overlay if it doesn't exist
    this.createOverlay();
    
    // Create dialog
    const dialog = document.createElement('div');
    Object.assign(dialog.style, {
      backgroundColor: '#333',
      padding: '15px',
      borderRadius: '5px',
      width: '350px',
      maxHeight: '80vh',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '10001',
      color: 'white',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column'
    });
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Load Map';
    title.style.margin = '0 0 15px 0';
    dialog.appendChild(title);
    
    // Map list container
    const listContainer = document.createElement('div');
    Object.assign(listContainer.style, {
      overflowY: 'auto',
      maxHeight: '300px',
      marginBottom: '15px',
      border: '1px solid #555',
      borderRadius: '3px',
      backgroundColor: '#222'
    });
    
    if (maps.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No saved maps found.';
      emptyMessage.style.padding = '15px';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.color = '#aaa';
      listContainer.appendChild(emptyMessage);
    } else {
      // Create a list of saved maps
      maps.forEach(map => {
        const mapItem = document.createElement('div');
        Object.assign(mapItem.style, {
          padding: '10px 15px',
          borderBottom: '1px solid #444',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        });
        
        // Map name and date
        const nameEl = document.createElement('div');
        nameEl.textContent = map.name;
        nameEl.style.fontWeight = 'bold';
        
        const dateEl = document.createElement('div');
        dateEl.textContent = map.date;
        dateEl.style.fontSize = '12px';
        dateEl.style.color = '#aaa';
        
        mapItem.appendChild(nameEl);
        mapItem.appendChild(dateEl);
        
        // Hover effect
        mapItem.onmouseover = () => mapItem.style.backgroundColor = '#444';
        mapItem.onmouseout = () => mapItem.style.backgroundColor = 'transparent';
        
        // Click to select
        mapItem.onclick = () => {
          this.closeDialog();
          callback(map.name);
        };
        
        listContainer.appendChild(mapItem);
      });
    }
    
    dialog.appendChild(listContainer);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '3px',
      backgroundColor: '#555',
      color: 'white',
      cursor: 'pointer'
    });
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
      this.closeDialog();
      callback(null);
    };
    buttonContainer.appendChild(cancelBtn);
    
    dialog.appendChild(buttonContainer);
    
    // Show the dialog
    this.activeDialog = dialog;
    document.body.appendChild(dialog);
  }
  
  /**
   * Create the semi-transparent overlay
   */
  private static createOverlay(): void {
    if (this.overlay) return;
    
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '10000'
    });
    
    document.body.appendChild(this.overlay);
  }
  
  /**
   * Close the dialog and remove the overlay
   */
  private static closeDialog(): void {
    if (this.activeDialog && this.activeDialog.parentNode) {
      this.activeDialog.parentNode.removeChild(this.activeDialog);
      this.activeDialog = null;
    }
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}
