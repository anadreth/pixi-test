import { World } from '../core/World';
import { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { InputComponent } from '../components/InputComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { AttackComponent } from '../components/AttackComponent';
import { HealthComponent } from '../components/HealthComponent';
import { Sprite, Container, Texture, Rectangle, Graphics } from 'pixi.js';
import { Assets } from 'pixi.js';
import { engine } from '../../getEngine';

/**
 * Factory class for creating game entities
 */
export class EntityFactory {


  public static async createCastle(world: World): Promise<Entity> {
    const castle = world.createEntity();
    const texture = await Assets.load('game/Factions/Knights/Buildings/Castle/Castle_Blue.png');
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.zIndex = 1;
    const container = new Container();
    container.x = engine().screen.width / 2;
    container.y = engine().screen.height / 2;
    container.addChild(sprite);
    world.addComponent(castle.id, new TransformComponent(container.x, container.y));
    world.addComponent(castle.id, new SpriteComponent(sprite, container));

    // Create hitbox for the goblin
    const hitbox = new Graphics();
    hitbox.rect(-140, -80, 280, 190).fill({ color: '#000', alpha: 0.5 });
    hitbox.zIndex = 2;
    container.addChild(hitbox);
    
    // Add health component with a larger health bar for the castle
    const healthComponent = new HealthComponent(500, 500, 200, 12, -100);
    world.addComponent(castle.id, healthComponent);
    container.addChild(healthComponent.getContainer());
    
    // Let the HealthComponent handle its own updating
    // This approach is simpler and more reliable than complex system queries
    healthComponent.startAutoUpdate();
    
    return castle;
  }
  /**
   * Create a goblin character entity
   */
  public static async createGoblin(world: World): Promise<Entity> {
    // Create base entity
    const goblin = world.createEntity();

    // Create container for the goblin at the center of the screen
    const container = new Container();
    container.x = engine().screen.width / 2;
    container.y = engine().screen.height / 2;
    container.zIndex = 1;

    // Load goblin texture
    const texture = await Assets.load('game/Factions/Goblins/Troops/Torch/Red/Torch_Red.png');

    // Extract frames for animations
    const frameWidth = 192;
    const frameHeight = 192;

    // Create initial sprite with first frame
    const rect = new Rectangle(0, 0, frameWidth, frameHeight);
    const frame = new Texture({ source: texture.baseTexture, frame: rect });
    const sprite = new Sprite(frame);
    sprite.anchor.set(0.5);
    sprite.zIndex = 1;

    // Create animation frames
    const idleFrames: Texture[] = [];
    for (let i = 0; i < 7; i++) { // Row 0 has 7 frames for idle
      const rect = new Rectangle(
        i * frameWidth,
        0, // Row 0
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: texture.baseTexture, frame: rect });
      idleFrames.push(frame);
    }

    // Create walking animation frames (row 1)
    const walkingFrames: Texture[] = [];
    const walkingFrameCount = 6; // Row 1 has 6 frames
    for (let i = 0; i < walkingFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        frameHeight, // Row 1
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: texture.baseTexture, frame: rect });
      walkingFrames.push(frame);
    }

    // Create attack animation frames for different directions
    const attackFrameCount = 6; // All attack animations have 6 frames

    // Left/Right attack (row 2)
    const horizontalAttackFrames: Texture[] = [];
    for (let i = 0; i < attackFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        frameHeight * 2, // Row 2
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: texture.baseTexture, frame: rect });
      horizontalAttackFrames.push(frame);
    }

    // Down attack (row 3)
    const downAttackFrames: Texture[] = [];
    for (let i = 0; i < attackFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        frameHeight * 3, // Row 3
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: texture.baseTexture, frame: rect });
      downAttackFrames.push(frame);
    }

    // Up attack (row 4)
    const upAttackFrames: Texture[] = [];
    for (let i = 0; i < attackFrameCount; i++) {
      const rect = new Rectangle(
        i * frameWidth,
        frameHeight * 4, // Row 4
        frameWidth,
        frameHeight
      );
      const frame = new Texture({ source: texture.baseTexture, frame: rect });
      upAttackFrames.push(frame);
    }

    // Create hitbox for the goblin
    const playerHitbox = new Graphics();
    playerHitbox.rect(-30, -30, 60, 60).fill({ color: '#000', alpha: 0.5 });
    playerHitbox.zIndex = 2;
    container.addChild(playerHitbox);

    // Add sprite to container
    container.addChild(sprite);

    // Add components to the entity
    world.addComponent(goblin.id, new TransformComponent(container.x, container.y));
    world.addComponent(goblin.id, new VelocityComponent(0, 0, 3)); // Default speed: 3

    // Add sprite component with animation frames
    world.addComponent(
      goblin.id,
      new SpriteComponent(
        sprite,
        container,
        {
          idle: idleFrames,
          walking: walkingFrames,
          attackUp: upAttackFrames,
          attackDown: downAttackFrames,
          attackHorizontal: horizontalAttackFrames
        }
      )
    );

    // Add input component for keyboard controls
    world.addComponent(goblin.id, new InputComponent());

    // Add animation component
    world.addComponent(goblin.id, new AnimationComponent());

    // Add attack component
    world.addComponent(goblin.id, new AttackComponent());
    
    // Add health component with a smaller health bar for the goblin
    const healthComponent = new HealthComponent(100, 100, 60, 8, -50);
    world.addComponent(goblin.id, healthComponent);
    container.addChild(healthComponent.getContainer());

    return goblin;
  }
}
