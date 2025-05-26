import { Container, Graphics } from "pixi.js";
import { Component } from "../core/Component";
import { TransformComponent } from "./TransformComponent";
import { SpriteComponent } from "./SpriteComponent";
import { World } from "../core/World";

/**
 * HealthComponent manages entity health and displays a health bar
 */
export class HealthComponent extends Component {
    public static readonly TYPE = "health";
    public type = HealthComponent.TYPE;
    public entity: number = 0;
    private world: World | null = null;
    public _entityType: string | null = null;

    private maxHealth: number;
    private currentHealth: number;
    private healthBar: Graphics;
    private healthBarContainer: Container;
    private barWidth: number;
    private barHeight: number;
    private yOffset: number;

    /**
     * Create a health component
     * @param maxHealth Maximum health value
     * @param currentHealth Current health value (defaults to maxHealth)
     * @param barWidth Width of the health bar
     * @param barHeight Height of the health bar
     * @param yOffset Vertical offset from the entity's center
     * @param entityType Entity type (optional)
     */
    constructor(
        maxHealth: number,
        currentHealth: number = maxHealth,
        barWidth: number = 100,
        barHeight: number = 10,
        yOffset: number = -50,
        entityType: string | null = null
    ) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.barWidth = barWidth;
        this.barHeight = barHeight;
        this.yOffset = yOffset;
        this._entityType = entityType;

        // Create health bar visual components
        this.healthBarContainer = new Container();
        this.healthBarContainer.sortableChildren = true; // Enable sorting by zIndex
        this.healthBarContainer.zIndex = 1000; // Make sure health bars are always on top

        // Create background and health bar
        const background = new Graphics();
        this.healthBar = new Graphics();

        // Set z-indices to ensure proper layering
        background.zIndex = 0;
        this.healthBar.zIndex = 1;

        this.healthBarContainer.addChild(background);
        this.healthBarContainer.addChild(this.healthBar);

        // Initial drawing of the health bar
        this.updateHealthBar();
    }

    /**
     * Get the health bar container
     */
    public getContainer(): Container {
        return this.healthBarContainer;
    }

    /**
     * Set the world reference for position updates
     */
    public setWorld(world: World): void {
        this.world = world;
    }

    /**
     * Update the position of the health bar based on the entity's transform
     * Simple, direct positioning using the offset value
     */
    public updatePosition(): void {
        // Simply apply the vertical offset - the container is already a child of the entity's container
        // so it will move with the entity automatically
        this.healthBarContainer.position.set(0, this.yOffset);
    }

    /**
     * This method is called by the EntityFactory
     * Simple, reliable approach with manual updates
     */
    public startAutoUpdate(): void {
        // We'll use a manual update approach for reliability
        // The HealthSystem will handle the updates
    }

    /**
     * Get current health
     */
    public getHealth(): number {
        return this.currentHealth;
    }

    /**
     * Get maximum health
     */
    public getMaxHealth(): number {
        return this.maxHealth;
    }

    /**
     * Get entity type
     */
    public get entityType(): string | null {
        return this._entityType;
    }

    /**
     * Set current health value
     */
    public setHealth(value: number): void {
        this.currentHealth = Math.max(0, Math.min(value, this.maxHealth));
        this.updateHealthBar();
    }

    /**
     * Take damage
     * @param amount Damage amount
     */
    public takeDamage(amount: number): number {
        this.setHealth(this.currentHealth - amount);
        return this.currentHealth;
    }





    /**
     * Heal
     * @param amount Heal amount
     * @returns New health
     */
    public heal(amount: number): number {
        this.setHealth(this.currentHealth + amount);
        return this.currentHealth;
    }

    /**
     * Check if entity is dead
     */
    public isDead(): boolean {
        return this.currentHealth <= 0;
    }

    /**
     * Update the health bar visual representation
     */
    private updateHealthBar(): void {
        const healthPercentage = this.currentHealth / this.maxHealth;

        // Clear existing graphics
        this.healthBar.clear();

        // Get first child as background (black)
        const background = this.healthBarContainer.getChildAt(0) as Graphics;
        background.clear();
        background.beginFill(0x000000);
        background.drawRect(
            -this.barWidth / 2,
            0,
            this.barWidth,
            this.barHeight
        );
        background.endFill();

        // Health bar (red)
        this.healthBar.clear();
        this.healthBar.beginFill(0xFF0000);
        this.healthBar.drawRect(
            -this.barWidth / 2,
            0,
            this.barWidth * healthPercentage,
            this.barHeight
        );
        this.healthBar.endFill();

        // Force visibility and higher z-index
        this.healthBarContainer.visible = true;
        this.healthBarContainer.zIndex = 100;

        // Log health status for debugging
        console.log(`Health updated: ${this.currentHealth}/${this.maxHealth} for entity type: ${this._entityType}`);
    }
}
