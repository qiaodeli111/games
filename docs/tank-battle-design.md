# Tank Battle Game Design Document

## 1. Game Architecture

### 1.1 File Structure
```
public/games/tank/
├── game.html          # Self-contained HTML5 Canvas game (iframe embeddable)
├── sprites/           # Generated pixel art sprites
│   ├── tanks/         # Tank sprites (player, enemies, bosses)
│   ├── terrain/       # Tiles (brick, steel, water, grass, ice)
│   ├── effects/       # Explosions, smoke, muzzle flash
│   ├── powerups/      # Power-up icons
│   └── ui/            # HUD elements
└── levels/            # Seed-based level configs (JSON)
```

### 1.2 Rendering Pipeline
```
┌─────────────────────────────────────────────────────────────┐
│                     Game Loop (60fps)                        │
├─────────────────────────────────────────────────────────────┤
│  1. Input Processing    → Keyboard/Touch state              │
│  2. Game Logic          → Physics, AI, Collisions           │
│  3. Depth Sort          → Isometric Z-ordering              │
│  4. Render Pass:                                          │
│     a. Terrain Layer    → Ground tiles (no depth)          │
│     b. Object Layer     → Sorted entities (depth buffer)    │
│     c. Effects Layer    → Particles, explosions             │
│     d. UI Layer         → HUD, minimap, health bars         │
│  5. Audio Update        → SFX, music                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Core Modules
```javascript
// Module structure (all in single HTML file)
const CONFIG = { ... };           // Game constants
const Iso = { ... };               // Isometric math utilities
const Sprites = { ... };           // Sprite management
const LevelGen = { ... };         // Procedural level generation
const Terrain = { ... };          // Terrain types and rendering
const Tank = { ... };              // Tank entity class
const Projectile = { ... };       // Bullet/missile class
const PowerUp = { ... };           // Power-up system
const AI = { ... };                // Enemy AI behaviors
const Effects = { ... };           // Particle system
const UI = { ... };                // HUD and menus
const Game = { ... };              // Main game controller
```

---

## 2. 2.5D Isometric Rendering

### 2.1 Isometric Math
```javascript
const Iso = {
  // Tile dimensions (classic 2:1 ratio)
  TILE_WIDTH: 64,
  TILE_HEIGHT: 32,
  TILE_DEPTH: 16,   // Height of walls/obstacles

  // Convert grid (x, y) to screen coordinates
  toScreen(gridX, gridY, height = 0) {
    return {
      x: (gridX - gridY) * (this.TILE_WIDTH / 2) + offsetX,
      y: (gridX + gridY) * (this.TILE_HEIGHT / 2) - height * this.TILE_DEPTH + offsetY
    };
  },

  // Convert screen to grid coordinates
  toGrid(screenX, screenY) {
    const x = screenX - offsetX;
    const y = screenY - offsetY;
    return {
      gridX: Math.floor((x / (this.TILE_WIDTH / 2) + y / (this.TILE_HEIGHT / 2)) / 2),
      gridY: Math.floor((y / (this.TILE_HEIGHT / 2) - x / (this.TILE_WIDTH / 2)) / 2)
    };
  },

  // Depth value for sorting (painter's algorithm)
  getDepth(gridX, gridY, height = 0) {
    return gridX + gridY + height * 0.01;
  }
};
```

### 2.2 Depth Sorting Algorithm
```javascript
function depthSort(entities) {
  return entities.sort((a, b) => {
    // Sort by Y first (front-to-back), then X (left-to-right)
    const depthA = Iso.getDepth(a.gridX, a.gridY, a.height || 0);
    const depthB = Iso.getDepth(b.gridX, b.gridY, b.height || 0);
    return depthA - depthB;
  });
}
```

### 2.3 Isometric Tile Rendering
```
Screen Layout (16:9 canvas, 800x450 typical):
┌────────────────────────────────────────┐
│          Camera Offset                 │
│    ┌──────────────────────┐           │
│    │   Isometric Grid      │           │
│    │      ◇◇◇◇◇◇          │           │
│    │     ◇◇◇◇◇◇◇          │           │
│    │    ◇◇◇◇◇◇◇◇          │           │
│    │     ◇◇◇◇◇◇◇          │           │
│    │      ◇◇◇◇◇◇          │           │
│    └──────────────────────┘           │
│  [HUD: Score | Lives | Power-ups]     │
└────────────────────────────────────────┘
```

---

## 3. Level Generation Algorithm

### 3.1 Seed-Based Procedural Generation
```javascript
class LevelGenerator {
  constructor(seed) {
    this.seed = seed;
    this.rng = this.seededRandom(seed);
  }

  // Seeded random number generator (Mulberry32)
  seededRandom(seed) {
    let t = seed >>> 0;
    return function() {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ t >>> 15, t | 1);
      r ^= r + Math.imul(r ^ r >>> 7, r | 61);
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }

  // Generate complete level
  generate(levelNum) {
    const difficulty = Math.min(levelNum * 0.1 + 0.5, 2.0);
    const width = 13 + Math.floor(levelNum / 5) * 2;  // Grows with level
    const height = 13 + Math.floor(levelNum / 5) * 2;

    const level = {
      width,
      height,
      terrain: [],
      enemies: [],
      powerups: [],
      spawn: { x: 0, y: 0 },
      base: { x: width - 1, y: height - 1 }
    };

    // Fill with floor
    for (let y = 0; y < height; y++) {
      level.terrain[y] = [];
      for (let x = 0; x < width; x++) {
        level.terrain[y][x] = TERRAIN.FLOOR;
      }
    }

    // Add walls (procedural patterns)
    this.generateWalls(level, difficulty);
    
    // Ensure playability (pathfinding check)
    this.ensurePlayability(level);

    // Add water, ice, grass (terrain variety)
    this.addTerrainVariety(level, difficulty);

    // Spawn enemies based on difficulty
    this.spawnEnemies(level, levelNum, difficulty);

    // Add power-ups
    this.addPowerUps(level);

    return level;
  }
}
```

### 3.2 Wall Generation Patterns
```javascript
generateWalls(level, difficulty) {
  const { width, height, terrain } = level;
  const patterns = ['scatter', 'clusters', 'maze', 'fortress'];
  const pattern = patterns[Math.floor(this.rng() * patterns.length)];

  switch (pattern) {
    case 'scatter':
      // Random scattered blocks
      const wallCount = Math.floor(width * height * 0.15 * difficulty);
      for (let i = 0; i < wallCount; i++) {
        const x = 1 + Math.floor(this.rng() * (width - 2));
        const y = 1 + Math.floor(this.rng() * (height - 2));
        terrain[y][x] = this.rng() > 0.3 ? TERRAIN.BRICK : TERRAIN.STEEL;
      }
      break;

    case 'clusters':
      // Clustered wall formations
      const clusters = 3 + Math.floor(this.rng() * 4);
      for (let c = 0; c < clusters; c++) {
        const cx = 2 + Math.floor(this.rng() * (width - 4));
        const cy = 2 + Math.floor(this.rng() * (height - 4));
        const size = 2 + Math.floor(this.rng() * 3);
        for (let dy = -size; dy <= size; dy++) {
          for (let dx = -size; dx <= size; dx++) {
            if (Math.abs(dx) + Math.abs(dy) <= size && this.rng() > 0.3) {
              const tx = cx + dx, ty = cy + dy;
              if (tx > 0 && tx < width - 1 && ty > 0 && ty < height - 1) {
                terrain[ty][tx] = TERRAIN.BRICK;
              }
            }
          }
        }
      }
      break;

    case 'maze':
      // Maze-like corridors using recursive division
      this.divideMaze(terrain, 1, 1, width - 2, height - 2);
      break;

    case 'fortress':
      // Defensive structures around base
      this.buildFortress(level);
      break;
  }
}
```

### 3.3 Playability Guarantee
```javascript
ensurePlayability(level) {
  // BFS pathfinding from player spawn to base
  const visited = new Set();
  const queue = [level.spawn];
  
  while (queue.length > 0) {
    const pos = queue.shift();
    const key = `${pos.x},${pos.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);

    if (pos.x === level.base.x && pos.y === level.base.y) {
      return; // Path exists
    }

    // Check neighbors
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nx = pos.x + dx, ny = pos.y + dy;
      if (nx >= 0 && nx < level.width && ny >= 0 && ny < level.height) {
        const terrain = level.terrain[ny][nx];
        if (terrain !== TERRAIN.BRICK && terrain !== TERRAIN.STEEL && terrain !== TERRAIN.WATER) {
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }

  // No path found - carve one
  this.carvePath(level);
}

carvePath(level) {
  // A* pathfinding to create a guaranteed path
  let x = level.spawn.x, y = level.spawn.y;
  const target = level.base;
  
  while (x !== target.x || y !== target.y) {
    // Clear current cell if it's a wall
    if (level.terrain[y][x] === TERRAIN.BRICK) {
      level.terrain[y][x] = TERRAIN.FLOOR;
    }
    
    // Move toward target
    if (this.rng() > 0.3) {
      x += Math.sign(target.x - x);
    } else {
      y += Math.sign(target.y - y);
    }
    
    // Keep in bounds
    x = Math.max(0, Math.min(level.width - 1, x));
    y = Math.max(0, Math.min(level.height - 1, y));
  }
}
```

---

## 4. Gameplay Innovations

### 4.1 Tank Types (5 Varieties)

| Type | Speed | Armor | Fire Rate | Special Ability |
|------|-------|-------|-----------|-----------------|
| **Scout** | Fast | Low | Normal | Radar (reveals map) |
| **Heavy** | Slow | High | Slow | Shield (temp invincibility) |
| **Artillery** | Slow | Medium | Slow | Long range, splash damage |
| **Stealth** | Medium | Low | Fast | Invisibility (3s cooldown) |
| **Engineer** | Medium | Medium | Normal | Build walls, repair base |

### 4.2 Power-Up System

```javascript
const POWERUPS = {
  STAR: {
    name: 'Star',
    icon: '⭐',
    effect: (tank) => { tank.upgradeLevel = Math.min(tank.upgradeLevel + 1, 3); },
    duration: 0, // Permanent
    color: '#FFD700'
  },
  SHIELD: {
    name: 'Shield',
    icon: '🛡️',
    effect: (tank) => { tank.invincible = true; },
    duration: 10000, // 10 seconds
    color: '#4169E1'
  },
  BOMB: {
    name: 'Bomb',
    icon: '💣',
    effect: (tank, game) => { game.destroyAllEnemies(); },
    duration: 0,
    color: '#DC143C'
  },
  CLOCK: {
    name: 'Clock',
    icon: '⏱️',
    effect: (tank, game) => { game.freezeEnemies(5000); },
    duration: 5000,
    color: '#32CD32'
  },
  LIFE: {
    name: 'Extra Life',
    icon: '❤️',
    effect: (tank) => { tank.lives++; },
    duration: 0,
    color: '#FF69B4'
  },
  RAPID: {
    name: 'Rapid Fire',
    icon: '🔥',
    effect: (tank) => { tank.fireRate *= 0.5; },
    duration: 8000,
    color: '#FF4500'
  },
  MINE: {
    name: 'Land Mine',
    icon: '💥',
    effect: (tank) => { tank.mines = (tank.mines || 0) + 3; },
    duration: 0,
    color: '#8B0000'
  },
  TELEPORT: {
    name: 'Teleport',
    icon: '🌀',
    effect: (tank) => { tank.canTeleport = true; },
    duration: 15000,
    color: '#9400D3'
  }
};
```

### 4.3 Terrain Effects

| Terrain | Effect |
|---------|--------|
| **Brick** | Destructible (4 hits), blocks movement and shots |
| **Steel** | Indestructible, blocks movement and shots |
| **Water** | Blocks movement, shots pass over |
| **Grass** | Hides tanks (visual only), movement normal |
| **Ice** | Slippery movement (momentum-based) |
| **Mud** | Slows tanks by 50% |
| **Lava** | Damage over time (1 HP/sec) |
| **Teleporter** | Instant transport to paired tile |

### 4.4 Dynamic Weather System
```javascript
const WEATHER = {
  CLEAR: { visibility: 1.0, speedMod: 1.0 },
  RAIN: { visibility: 0.8, speedMod: 0.9, effect: 'puddles' },
  FOG: { visibility: 0.5, speedMod: 1.0, effect: 'limited_view' },
  SNOW: { visibility: 0.9, speedMod: 0.8, effect: 'ice_patches' },
  SANDSTORM: { visibility: 0.6, speedMod: 0.7, effect: 'damage_over_time' }
};

class WeatherSystem {
  constructor() {
    this.current = WEATHER.CLEAR;
    this.transitionTime = 30000; // Weather changes every 30s
  }

  update(dt) {
    // Particles, screen effects
    if (this.current === WEATHER.RAIN) {
      this.spawnRainDrops();
    }
  }

  change() {
    const weathers = Object.values(WEATHER);
    this.current = weathers[Math.floor(Math.random() * weathers.length)];
  }
}
```

### 4.5 Combo/Chain System
```javascript
class ComboSystem {
  constructor() {
    this.combo = 0;
    this.timer = 0;
    this.multiplier = 1;
  }

  onKill() {
    this.combo++;
    this.timer = 3000; // 3 second window
    this.multiplier = Math.min(1 + Math.floor(this.combo / 5) * 0.5, 4.0);
  }

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.combo = 0;
        this.multiplier = 1;
      }
    }
  }

  getScore(baseScore) {
    return Math.floor(baseScore * this.multiplier);
  }
}
```

---

## 5. Art & Texture Pipeline

### 5.1 Pixel Art Style Guidelines
```
- Resolution: 32x32 base sprites, scaled 2x for crisp pixels
- Color Palette: Limited 32-color palette per theme
- Style: Clean lines, strong silhouettes, readable at small scale
- Animation: 4-8 frames per action (idle, move, shoot, destroy)
- Shadows: Simple drop shadows for depth perception
```

### 5.2 Text2Image Prompts

```javascript
const SPRITE_PROMPTS = {
  // Player tanks (directional sprites)
  'tank-player-up': 'Pixel art tank top-down view facing up, military green with yellow accent, 32x32, retro game sprite style, clean edges, transparent background',
  'tank-player-down': 'Pixel art tank top-down view facing down, military green with yellow accent, 32x32, retro game sprite style, clean edges, transparent background',
  'tank-player-left': 'Pixel art tank isometric view facing left, military green with yellow accent, 32x32, retro game sprite style, clean edges, transparent background',
  'tank-player-right': 'Pixel art tank isometric view facing right, military green with yellow accent, 32x32, retro game sprite style, clean edges, transparent background',

  // Enemy tanks by type
  'tank-enemy-scout': 'Pixel art light tank, red body, fast scout vehicle, 32x32, top-down, game sprite, transparent background',
  'tank-enemy-heavy': 'Pixel art heavy tank, dark gray, thick armor, dual cannons, 32x32, top-down, game sprite, transparent background',
  'tank-enemy-artillery': 'Pixel artillery tank, long barrel, olive green, 32x32, top-down, game sprite, transparent background',
  'tank-enemy-stealth': 'Pixel art stealth tank, dark purple, sleek design, 32x32, top-down, game sprite, transparent background',

  // Terrain tiles
  'terrain-brick': 'Pixel art brick wall tile, red-brown bricks, top-down isometric, 64x32, retro game tile, seamless, transparent background',
  'terrain-steel': 'Pixel art steel wall tile, metallic gray, rivets, top-down isometric, 64x32, retro game tile, seamless, transparent background',
  'terrain-water': 'Pixel art water tile, animated waves, blue gradient, top-down isometric, 64x32, retro game tile, animated, transparent background',
  'terrain-grass': 'Pixel art grass tile, green with tufts, top-down isometric, 64x32, retro game tile, seamless, transparent background',
  'terrain-ice': 'Pixel art ice tile, light blue, reflective surface, top-down isometric, 64x32, retro game tile, transparent background',

  // Effects
  'explosion-1': 'Pixel art explosion, orange and yellow, 32x32, animation frame 1, game effect, transparent background',
  'explosion-2': 'Pixel art explosion, orange and yellow, expanding, 32x32, animation frame 2, game effect, transparent background',
  'explosion-3': 'Pixel art explosion, orange and yellow, maximum size, 32x32, animation frame 3, game effect, transparent background',
  'explosion-4': 'Pixel art explosion, dissipating smoke, 32x32, animation frame 4, game effect, transparent background',

  // Power-ups
  'powerup-star': 'Pixel art golden star icon, glowing, 16x16, game item sprite, transparent background',
  'powerup-shield': 'Pixel art shield icon, blue energy field, 16x16, game item sprite, transparent background',
  'powerup-bomb': 'Pixel art bomb icon, round black bomb, 16x16, game item sprite, transparent background',

  // UI elements
  'ui-heart': 'Pixel art heart icon, red, 16x16, game UI, transparent background',
  'ui-life': 'Pixel art tank life icon, small tank silhouette, 16x16, game UI, transparent background'
};
```

### 5.3 Sprite Sheet Generation Script
```javascript
// Script: scripts/generate_tank_sprites.js
const fs = require('fs');
const path = require('path');

async function generateSprites() {
  const outputDir = 'public/games/tank/sprites';
  const sprites = Object.entries(SPRITE_PROMPTS);

  for (const [name, prompt] of sprites) {
    const imageBuffer = await text2image(prompt, {
      width: name.includes('64') ? 64 : 32,
      height: name.includes('64') ? 32 : 32,
      style: 'pixel-art',
      // Using Cloudflare Workers AI or Silicon Flow
    });

    const outputPath = path.join(outputDir, `${name}.png`);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`Generated: ${name}.png`);
  }

  // Pack into sprite sheet
  await packSpriteSheet(outputDir);
}
```

---

## 6. Implementation Plan

### Phase 1: Core Engine (Week 1)
1. **Day 1-2**: Set up project structure, Canvas initialization
   - Create `game.html` with basic Canvas setup
   - Implement isometric coordinate system
   - Basic game loop with FPS counter

2. **Day 3-4**: Terrain rendering
   - Implement tile rendering system
   - Add brick, steel, water, grass, ice tiles
   - Depth sorting for multiple tile layers

3. **Day 5-7**: Tank movement and controls
   - Player tank with WASD/Arrow controls
   - Collision detection with terrain
   - Smooth movement interpolation

### Phase 2: Combat System (Week 2)
1. **Day 1-2**: Projectile system
   - Bullets with direction and speed
   - Bullet-terrain collision (brick destruction)
   - Bullet-tank collision

2. **Day 3-4**: Enemy AI
   - Basic pathfinding toward player/base
   - Shooting behavior
   - Different AI personalities (aggressive, defensive, patrol)

3. **Day 5-7**: Power-ups
   - Spawn system with random drops
   - Power-up effects implementation
   - UI indicators for active power-ups

### Phase 3: Level Generation (Week 3)
1. **Day 1-2**: Procedural generation
   - Implement seeded RNG
   - Wall pattern algorithms
   - Playability verification

2. **Day 3-4**: Difficulty scaling
   - Enemy count and type by level
   - Terrain complexity scaling
   - Boss tank introduction

3. **Day 5-7**: Level progression
   - Multiple stages per level
   - Level transition animations
   - High score and progress saving

### Phase 4: Polish & Art (Week 4)
1. **Day 1-3**: Sprite generation
   - Generate all sprites via Text2Image
   - Create sprite sheets
   - Animation frames

2. **Day 4-5**: Effects and particles
   - Explosion animations
   - Muzzle flash
   - Weather effects

3. **Day 6-7**: UI/UX
   - Menu screens
   - HUD refinement
   - Mobile touch controls

---

## 7. Controls & UI

### 7.1 Control Schemes

#### Keyboard (Desktop)
```
┌─────────────────────────────────────┐
│  Movement:     W/↑ = Up              │
│               S/↓ = Down            │
│               A/← = Left            │
│               D/→ = Right           │
│                                     │
│  Shoot:        Space/Enter          │
│  Special:      E (use power-up)     │
│  Pause:        P / Escape           │
│  Restart:      R (when game over)   │
└─────────────────────────────────────┘
```

#### Touch (Mobile)
```
┌─────────────────────────────────────┐
│                                     │
│  [Left Side]        [Right Side]    │
│   ┌───┐               ┌───┐         │
│   │ ↑ │               │ 🔫│ Shoot   │
│   └───┘               └───┘         │
│  ┌───┬───┐                          │
│  │ ← │ → │  D-Pad    [Special]      │
│  └───┴───┘            ⚡            │
│   │ ↓ │                             │
│   └───┘                             │
│                                     │
│  Swipe: Quick direction change      │
│  Double-tap: Use special ability     │
└─────────────────────────────────────┘
```

### 7.2 HUD Layout
```
┌──────────────────────────────────────────────────────────┐
│  ★ Score: 12,450    │    Lives: ❤️❤️❤️    │    Level: 5  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│                    [ GAME AREA ]                         │
│                                                          │
│                                                          │
│  ┌──────────┐                          ┌──────────┐      │
│  │ Minimap  │                          │ Power-ups│      │
│  │ (small)  │                          │ ⭐🛡️💣  │      │
│  └──────────┘                          └──────────┘      │
│                                                          │
│  [Current Tank: Scout  │  Combo: x2.5  │  Weather: 🌧️]  │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Responsive Design
```javascript
function resizeCanvas() {
  const container = document.getElementById('game-container');
  const maxWidth = Math.min(window.innerWidth - 20, 800);
  const maxHeight = Math.min(window.innerHeight - 150, 600);
  
  // Maintain 4:3 aspect ratio for game area
  const aspect = 4 / 3;
  let width = maxWidth;
  let height = width / aspect;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }
  
  canvas.width = Math.floor(width);
  canvas.height = Math.floor(height);
  
  // Recalculate isometric offset
  Iso.offsetX = canvas.width / 2;
  Iso.offsetY = canvas.height / 4;
}
```

---

## 8. Technical Specifications

### 8.1 Performance Targets
- **Frame Rate**: 60 FPS minimum on mobile
- **Memory**: < 50MB total
- **Load Time**: < 3 seconds on 3G
- **Bundle Size**: < 500KB (including sprites)

### 8.2 Browser Support
- Chrome 80+
- Safari 13+
- Firefox 75+
- Edge 80+
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

### 8.3 Save System
```javascript
const SaveSystem = {
  KEY: 'tank_battle_save',
  
  save(data) {
    const saveData = {
      highScore: data.highScore,
      unlockedTanks: data.unlockedTanks,
      currentLevel: data.currentLevel,
      settings: data.settings
    };
    localStorage.setItem(this.KEY, JSON.stringify(saveData));
  },
  
  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : this.getDefault();
    } catch (e) {
      return this.getDefault();
    }
  },
  
  getDefault() {
    return {
      highScore: 0,
      unlockedTanks: ['scout'],
      currentLevel: 1,
      settings: { sound: true, music: true, difficulty: 'normal' }
    };
  }
};
```

---

## 9. Future Expansion Ideas

### 9.1 Multiplayer Mode
- Split-screen local co-op
- Online WebSocket battles
- Team vs Team modes

### 9.2 Campaign Mode
- Story-driven levels
- Boss fights
- Unlockable tank upgrades

### 9.3 Editor Mode
- Custom level builder
- Share levels via URL hash
- Community levels

### 9.4 Achievements
- First Blood: Kill first enemy
- Survivor: Complete level without damage
- Speed Demon: Clear level under 60 seconds
- Demolition Expert: Destroy 100 walls
- Tank Master: Unlock all tank types

---

## 10. Database Integration

### 10.1 Game Entry (SQLite)
```sql
INSERT INTO games (name, slug, description, category_id, author, 
                   controls_keyboard, controls_touch, thumbnail)
VALUES (
  'Tank Battle',
  'tank',
  'Classic tank warfare with a modern 2.5D twist! 
   Battle through procedurally generated levels, 
   collect power-ups, and defend your base.',
  (SELECT id FROM categories WHERE slug = 'action'),
  'AI Games',
  'WASD/Arrows: Move | Space: Shoot | E: Special | P: Pause',
  'D-Pad: Move | Fire Button: Shoot | Special: Use Power-up',
  'https://pics.dellyqiao.com/aigames/tank/thumbnail.jpg'
);
```

### 10.2 Screenshot Generation
Use Text2Image to generate promotional screenshots showing:
1. Title screen with tank
2. Action gameplay screenshot
3. Power-up collection moment
4. Boss fight scene

---

## Summary

This Tank Battle game combines classic tank warfare gameplay with modern innovations:

| Feature | Implementation |
|---------|---------------|
| **2.5D View** | True isometric projection with depth sorting |
| **Procedural Levels** | Seed-based generation with playability guarantee |
| **5 Tank Types** | Scout, Heavy, Artillery, Stealth, Engineer |
| **8 Power-ups** | Star, Shield, Bomb, Clock, Life, Rapid, Mine, Teleport |
| **7 Terrain Types** | Brick, Steel, Water, Grass, Ice, Mud, Lava |
| **Weather System** | Clear, Rain, Fog, Snow, Sandstorm |
| **Combo System** | Chain kills for score multipliers |
| **Mobile Support** | Touch controls with D-pad and buttons |

The game will be a single HTML file under 500KB, embeddable via iframe, with AI-generated pixel art sprites.