import * as PIXI from 'pixi.js';
import { TileProperties, TEXTURE_OPTIONS } from '../models/TileProperties';

// Event types for communication
export interface TilePropertiesUpdateEvent {
  properties: Partial<TileProperties>;
}

export class TilePropertiesPopup extends PIXI.Container {
  private background!: PIXI.Graphics;
  private titleText!: PIXI.Text;
  private closeButton!: PIXI.Container;
  
  // Property UI elements
  private elevationLabel!: PIXI.Text;
  private elevationValue!: PIXI.Text;
  private elevationUpButton!: PIXI.Container;
  private elevationDownButton!: PIXI.Container;
  
  private textureLabel!: PIXI.Text;
  private textureButtons: Map<string, PIXI.Container> = new Map();
  private activeTextureId: string = 'grass';
  
  private walkableLabel!: PIXI.Text;
  private walkableCheckbox!: PIXI.Container;
  private walkableStatus: boolean = true;
  
  private applyButton!: PIXI.Container;
  
  // Current property values
  private currentProperties: TileProperties = {
    elevation: 0,
    texture: 'grass',
    walkable: true
  };
  
  // Styling constants
  private readonly POPUP_WIDTH = 220;
  private readonly POPUP_HEIGHT = 300;
  private readonly POPUP_PADDING = 10;
  private readonly SECTION_SPACING = 15;
  private readonly ROW_HEIGHT = 30;
  private readonly BUTTON_SIZE = 24;
  
  private readonly BACKGROUND_COLOR = 0x333333;
  private readonly BACKGROUND_ALPHA = 0.9;
  private readonly TEXT_COLOR = 0xFFFFFF;
  private readonly BUTTON_COLOR = 0x555555;
  private readonly BUTTON_HOVER_COLOR = 0x777777;
  
  constructor() {
    super();
    
    // Initialize graphics and layout
    this.initializePopup();
    
    // Hide by default until tiles are selected
    this.visible = false;
  }
  
  private initializePopup(): void {
    // Create popup background
    this.background = new PIXI.Graphics();
    this.drawBackground();
    this.addChild(this.background);
    
    // Create title
    this.titleText = this.createText('Tile Properties', 16, this.POPUP_PADDING, this.POPUP_PADDING);
    this.addChild(this.titleText);
    
    // Create close button
    this.closeButton = this.createButton('\u00d7', this.POPUP_WIDTH - 30, this.POPUP_PADDING, 20, 20);
    this.closeButton.on('pointerdown', this.hide.bind(this));
    this.addChild(this.closeButton);
    
    this.createElevationControls();
    this.createTextureControls();
    this.createWalkableControls();
    this.createApplyButton();
  }
  
  private createElevationControls(): void {
    let currentY = this.POPUP_PADDING + 30;
    
    // Create elevation label
    this.elevationLabel = this.createText('Elevation:', 14, this.POPUP_PADDING, currentY);
    this.addChild(this.elevationLabel);
    
    // Elevation value and buttons
    this.elevationValue = this.createText('0', 14, this.POPUP_PADDING + 90, currentY);
    this.addChild(this.elevationValue);
    
    this.elevationUpButton = this.createButton('+', this.POPUP_WIDTH - 60, currentY - 3, this.BUTTON_SIZE, this.BUTTON_SIZE);
    this.elevationUpButton.on('pointerdown', this.incrementElevation.bind(this));
    this.addChild(this.elevationUpButton);
    
    this.elevationDownButton = this.createButton('-', this.POPUP_WIDTH - 30, currentY - 3, this.BUTTON_SIZE, this.BUTTON_SIZE);
    this.elevationDownButton.on('pointerdown', this.decrementElevation.bind(this));
    this.addChild(this.elevationDownButton);
  }
  
  private createTextureControls(): void {
    let currentY = this.POPUP_PADDING + 30 + this.ROW_HEIGHT + this.SECTION_SPACING;
    
    // Create texture label
    this.textureLabel = this.createText('Texture:', 14, this.POPUP_PADDING, currentY);
    this.addChild(this.textureLabel);
    
    currentY += 25;
    
    // Create texture buttons grid
    const buttonsPerRow = 3;
    const buttonSpacing = 10;
    const buttonSize = 50;
    
    TEXTURE_OPTIONS.forEach((texture, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;
      
      const x = this.POPUP_PADDING + col * (buttonSize + buttonSpacing);
      const y = currentY + row * (buttonSize + buttonSpacing);
      
      const button = this.createTextureButton(texture.id, texture.name, x, y, buttonSize, buttonSize);
      this.textureButtons.set(texture.id, button);
      this.addChild(button);
    });
  }
  
  private createWalkableControls(): void {
    // Calculate Y position after texture controls
    const buttonsPerRow = 3;
    const buttonSpacing = 10;
    const buttonSize = 50;
    const textureRows = Math.ceil(TEXTURE_OPTIONS.length / buttonsPerRow);
    let currentY = this.POPUP_PADDING + 30 + this.ROW_HEIGHT + this.SECTION_SPACING + 25 + 
                  textureRows * (buttonSize + buttonSpacing) + this.SECTION_SPACING;
    
    // Create walkable label
    this.walkableLabel = this.createText('Walkable:', 14, this.POPUP_PADDING, currentY);
    this.addChild(this.walkableLabel);
    
    // Create walkable checkbox
    this.walkableCheckbox = this.createCheckbox(this.POPUP_PADDING + 90, currentY, this.walkableStatus);
    this.walkableCheckbox.on('pointerdown', this.toggleWalkable.bind(this));
    this.addChild(this.walkableCheckbox);
  }
  
  private createApplyButton(): void {
    // Calculate Y position after walkable controls
    const buttonsPerRow = 3;
    const buttonSpacing = 10;
    const buttonSize = 50;
    const textureRows = Math.ceil(TEXTURE_OPTIONS.length / buttonsPerRow);
    let currentY = this.POPUP_PADDING + 30 + this.ROW_HEIGHT + this.SECTION_SPACING + 25 + 
                  textureRows * (buttonSize + buttonSpacing) + this.SECTION_SPACING + 
                  this.ROW_HEIGHT + this.SECTION_SPACING * 1.5;
    
    // Create Apply button
    this.applyButton = this.createButton('Apply to Selection', this.POPUP_WIDTH / 2 - 70, currentY, 140, 35);
    this.applyButton.on('pointerdown', this.applyChanges.bind(this));
    this.addChild(this.applyButton);
  }
  
  private drawBackground(): void {
    this.background.clear();
    this.background.beginFill(this.BACKGROUND_COLOR, this.BACKGROUND_ALPHA);
    this.background.lineStyle(1, 0x666666, 1);
    this.background.drawRoundedRect(0, 0, this.POPUP_WIDTH, this.POPUP_HEIGHT, 8);
    this.background.endFill();
  }
  
  private createText(content: string, size: number, x: number, y: number): PIXI.Text {
    const text = new PIXI.Text(content, {
      fontFamily: 'Arial',
      fontSize: size,
      fill: this.TEXT_COLOR,
    });
    text.position.set(x, y);
    return text;
  }
  
  private createButton(label: string, x: number, y: number, width: number, height: number): PIXI.Container {
    const container = new PIXI.Container();
    container.position.set(x, y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    const background = new PIXI.Graphics();
    background.beginFill(this.BUTTON_COLOR);
    background.drawRoundedRect(0, 0, width, height, 4);
    background.endFill();
    container.addChild(background);
    
    const text = new PIXI.Text(label, {
      fontFamily: 'Arial',
      fontSize: height < 30 ? height / 2 : 14,
      fill: this.TEXT_COLOR,
    });
    text.anchor.set(0.5);
    text.position.set(width / 2, height / 2);
    container.addChild(text);
    
    // Hover effects
    container.on('pointerover', () => {
      background.clear();
      background.beginFill(this.BUTTON_HOVER_COLOR);
      background.drawRoundedRect(0, 0, width, height, 4);
      background.endFill();
    });
    
    container.on('pointerout', () => {
      background.clear();
      background.beginFill(this.BUTTON_COLOR);
      background.drawRoundedRect(0, 0, width, height, 4);
      background.endFill();
    });
    
    return container;
  }
  
  private createTextureButton(id: string, name: string, x: number, y: number, width: number, height: number): PIXI.Container {
    const container = new PIXI.Container();
    container.position.set(x, y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    // Button background and border
    const background = new PIXI.Graphics();
    background.beginFill(this.getTextureColor(id));
    background.lineStyle(2, id === this.activeTextureId ? 0xFFFFFF : 0x666666);
    background.drawRoundedRect(0, 0, width, height, 4);
    background.endFill();
    container.addChild(background);
    
    // Texture name
    const text = new PIXI.Text(name, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF,
      align: 'center',
    });
    text.anchor.set(0.5);
    text.position.set(width / 2, height - 10);
    container.addChild(text);
    
    // Click handler to select texture
    container.on('pointerdown', () => {
      this.setTextureValue(id);
    });
    
    return container;
  }
  
  private createCheckbox(x: number, y: number, checked: boolean): PIXI.Container {
    const container = new PIXI.Container();
    container.position.set(x, y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    const size = 20;
    
    // Box
    const box = new PIXI.Graphics();
    box.lineStyle(2, 0xFFFFFF);
    box.beginFill(0x333333);
    box.drawRect(0, 0, size, size);
    box.endFill();
    container.addChild(box);
    
    // Check mark
    if (checked) {
      const check = new PIXI.Graphics();
      check.beginFill(0xFFFFFF);
      check.drawRect(4, 4, size - 8, size - 8);
      check.endFill();
      container.addChild(check);
    }
    
    return container;
  }
  
  private getTextureColor(textureId: string): number {
    switch (textureId) {
      case 'grass': return 0x33AA33;
      case 'stone': return 0x888888;
      case 'sand': return 0xF0E68C;
      case 'water': return 0x4444FF;
      case 'snow': return 0xEEEEEE;
      default: return 0x33AA33;
    }
  }
  
  // Event handlers
  private incrementElevation(): void {
    if (this.currentProperties.elevation < 10) {
      this.currentProperties.elevation += 1;
      this.updateElevationDisplay();
    }
  }
  
  private decrementElevation(): void {
    if (this.currentProperties.elevation > 0) {
      this.currentProperties.elevation -= 1;
      this.updateElevationDisplay();
    }
  }
  
  private updateElevationDisplay(): void {
    this.elevationValue.text = this.currentProperties.elevation.toString();
  }
  
  private setTextureValue(textureId: string): void {
    // Update active texture
    this.activeTextureId = textureId;
    this.currentProperties.texture = textureId;
    
    // Update button visuals
    this.textureButtons.forEach((button, id) => {
      const background = button.getChildAt(0) as PIXI.Graphics;
      background.clear();
      background.beginFill(this.getTextureColor(id));
      background.lineStyle(2, id === this.activeTextureId ? 0xFFFFFF : 0x666666);
      background.drawRoundedRect(0, 0, 50, 50, 4);
      background.endFill();
    });
  }
  
  private toggleWalkable(): void {
    this.walkableStatus = !this.walkableStatus;
    this.currentProperties.walkable = this.walkableStatus;
    
    // Update checkbox visual
    this.walkableCheckbox.removeChildren();
    
    const box = new PIXI.Graphics();
    box.lineStyle(2, 0xFFFFFF);
    box.beginFill(0x333333);
    box.drawRect(0, 0, 20, 20);
    box.endFill();
    this.walkableCheckbox.addChild(box);
    
    if (this.walkableStatus) {
      const check = new PIXI.Graphics();
      check.beginFill(0xFFFFFF);
      check.drawRect(4, 4, 12, 12);
      check.endFill();
      this.walkableCheckbox.addChild(check);
    }
  }
  
  private applyChanges(): void {
    // Emit event to notify parent components about the property changes
    this.emit('properties-updated', {
      properties: { ...this.currentProperties }
    } as TilePropertiesUpdateEvent);
  }
  
  // Public methods
  public show(properties: TileProperties, x: number, y: number): void {
    // Update UI with current properties
    this.currentProperties = { ...properties };
    this.activeTextureId = properties.texture;
    this.walkableStatus = properties.walkable;
    
    // Update UI elements
    this.updateElevationDisplay();
    this.setTextureValue(properties.texture);
    
    // Update checkbox
    this.walkableCheckbox.removeChildren();
    const box = new PIXI.Graphics();
    box.lineStyle(2, 0xFFFFFF);
    box.beginFill(0x333333);
    box.drawRect(0, 0, 20, 20);
    box.endFill();
    this.walkableCheckbox.addChild(box);
    
    if (properties.walkable) {
      const check = new PIXI.Graphics();
      check.beginFill(0xFFFFFF);
      check.drawRect(4, 4, 12, 12);
      check.endFill();
      this.walkableCheckbox.addChild(check);
    }
    
    // Position the popup
    this.position.set(x, y);
    
    // Make visible
    this.visible = true;
  }
  
  public hide(): void {
    this.visible = false;
  }
}
