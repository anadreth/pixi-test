export class LoadingIndicator {
  private element: HTMLDivElement | null = null;
  
  /**
   * Show loading indicator with message
   */
  public show(message: string = 'Loading...'): void {
    if (this.element) return;
    
    this.element = document.createElement('div');
    Object.assign(this.element.style, {
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
    this.element.textContent = message;
    document.body.appendChild(this.element);
  }
  
  /**
   * Update loading indicator message
   */
  public updateMessage(message: string): void {
    if (this.element) {
      this.element.textContent = message;
    }
  }
  
  /**
   * Update loading indicator with progress percentage
   */
  public updateProgress(percent: number): void {
    if (this.element) {
      this.element.textContent = `Building grid... ${percent}%`;
    }
  }
  
  /**
   * Hide loading indicator
   */
  public hide(): void {
    if (this.element) {
      document.body.removeChild(this.element);
      this.element = null;
    }
  }
}
