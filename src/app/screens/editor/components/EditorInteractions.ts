import { Container, Point } from 'pixi.js';

export interface InteractionConfig {
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
}

export class EditorInteractions {
  private container!: Container;
  private targetContainer!: Container;
  private isDragging = false;
  private lastPosition = new Point();
  private offset = new Point();
  
  public zoomLevel!: number;
  private minZoom!: number;
  private maxZoom!: number;
  
  constructor(container: Container, targetContainer: Container, config: InteractionConfig) {
    this.container = container;
    this.targetContainer = targetContainer;
    this.zoomLevel = config.initialZoom;
    this.minZoom = config.minZoom;
    this.maxZoom = config.maxZoom;
    
    this.setupInteractions();
  }
  
  private setupInteractions(): void {
    // Set up container for interactions
    this.container.eventMode = 'static';
    this.container.interactive = true;
    
    // Setup zoom
    window.addEventListener("wheel", (e) => {
      const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoomLevel = Math.min(
        this.maxZoom,
        Math.max(this.minZoom, this.zoomLevel + zoomAmount)
      );
      this.targetContainer.scale.set(this.zoomLevel);
    });
    
    // Setup panning
    this.container.on('pointerdown', (e) => {
      this.isDragging = true;
      this.lastPosition.copyFrom(e.global);
    });
    
    this.container.on('pointermove', (e) => {
      if (!this.isDragging) return;
      
      // Calculate movement delta
      const dx = e.global.x - this.lastPosition.x;
      const dy = e.global.y - this.lastPosition.y;
      
      // Move the container
      this.targetContainer.position.x += dx;
      this.targetContainer.position.y += dy;
      
      // Update offset for other operations
      this.offset.x = this.targetContainer.position.x;
      this.offset.y = this.targetContainer.position.y;
      
      // Update last position
      this.lastPosition.copyFrom(e.global);
    });
    
    this.container.on('pointerup', () => {
      this.isDragging = false;
    });
    
    this.container.on('pointerupoutside', () => {
      this.isDragging = false;
    });
  }
  
  /**
   * Reset zoom to default level
   */
  public resetZoom(): void {
    this.zoomLevel = 1;
    this.targetContainer.scale.set(this.zoomLevel);
  }
  
  /**
   * Get current offset position
   */
  public getOffset(): Point {
    return this.offset;
  }
  
  /**
   * Set container position
   */
  public setPosition(x: number, y: number): void {
    this.offset.x = x;
    this.offset.y = y;
    this.targetContainer.position.set(x, y);
  }
  
  /**
   * Center the target container on the screen
   */
  public centerOnScreen(): void {
    const appWidth = window.innerWidth;
    const appHeight = window.innerHeight;
    
    // Center at origin point
    this.offset.x = appWidth / 2;
    this.offset.y = appHeight / 2;
    
    // Apply the position
    this.targetContainer.position.set(this.offset.x, this.offset.y);
  }
}
