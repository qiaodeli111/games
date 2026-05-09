import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../games.db');

// Create DB (better-sqlite3 creates if not exists)
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ── Create tables ──
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER NOT NULL,
    author TEXT,
    controls_keyboard TEXT,
    controls_touch TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS screenshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id)
  );

  CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
  CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);
  CREATE INDEX IF NOT EXISTS idx_screenshots_game ON screenshots(game_id);
`);

// ── Seed categories ──
const upsertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, slug, parent_id)
  VALUES (@name, @slug, @parent_id)
`);

const categories = [
  { name: '经典游戏', slug: 'classic', parent_id: null },
  { name: '动作游戏', slug: 'action', parent_id: null },
  { name: '益智游戏', slug: 'puzzle', parent_id: null },
  { name: '射击游戏', slug: 'shooting', parent_id: null },
  { name: '策略游戏', slug: 'strategy', parent_id: null },
  { name: '体育游戏', slug: 'sports', parent_id: null },
  { name: '冒险游戏', slug: 'adventure', parent_id: null },
];

for (const cat of categories) {
  upsertCategory.run(cat);
}

// Create sub-categories under 经典游戏
const classic = db.prepare('SELECT id FROM categories WHERE slug = ?').get('classic') as { id: number } | undefined;
if (classic) {
  upsertCategory.run({ name: '街机', slug: 'classic-arcade', parent_id: classic.id });
  upsertCategory.run({ name: '休闲', slug: 'classic-casual', parent_id: classic.id });
}

const arcade = db.prepare('SELECT id FROM categories WHERE slug = ?').get('classic-arcade') as { id: number } | undefined;

// ── Seed games ──
const upsertGame = db.prepare(`
  INSERT OR REPLACE INTO games (name, slug, description, category_id, author, controls_keyboard, controls_touch)
  VALUES (@name, @slug, @description, @category_id, @author, @controls_keyboard, @controls_touch)
`);

const upsertScreenshot = db.prepare(`
  INSERT OR REPLACE INTO screenshots (game_id, path, is_thumbnail, display_order)
  VALUES (@game_id, @path, @is_thumbnail, @display_order)
`);

if (arcade) {
  // ── 贪吃蛇 ──
  upsertGame.run({
    name: '贪吃蛇',
    slug: 'snake',
    description: '经典贪吃蛇游戏，控制蛇吃食物变长，避免撞墙和自身。支持键盘方向键、WASD 以及触摸滑动控制。',
    category_id: arcade.id,
    author: 'AI Games',
    controls_keyboard: '方向键 或 WASD',
    controls_touch: '滑动屏幕',
  });

  const snake = db.prepare('SELECT id FROM games WHERE slug = ?').get('snake') as { id: number } | undefined;
  if (snake) {
    upsertScreenshot.run({ game_id: snake.id, path: '/games/snake/thumbnail.svg', is_thumbnail: 1, display_order: 0 });
  }

  // ── Flappy Bird ──
  upsertGame.run({
    name: 'Flappy Bird',
    slug: 'flappy',
    description: '控制小鸟穿过水管障碍，每穿过一个水管得一分。点击屏幕或按空格键让小鸟飞行。',
    category_id: arcade.id,
    author: 'AI Games',
    controls_keyboard: '空格键 / 上箭头',
    controls_touch: '点击屏幕',
  });

  const flappy = db.prepare('SELECT id FROM games WHERE slug = ?').get('flappy') as { id: number } | undefined;
  if (flappy) {
    upsertScreenshot.run({ game_id: flappy.id, path: '/games/flappy/thumbnail.svg', is_thumbnail: 1, display_order: 0 });
  }
}

console.log('✅ Database seeded:');
console.log(`   - Categories: ${(db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }).c}`);
console.log(`   - Games: ${(db.prepare('SELECT COUNT(*) as c FROM games').get() as { c: number }).c}`);

db.close();
