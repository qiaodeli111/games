import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../games.db');

const db = new Database(dbPath);

// 添加贪吃蛇游戏
const addSnakeGame = db.prepare(`
  INSERT OR REPLACE INTO games (name, slug, description, category_id, author, controls_keyboard, controls_touch)
  VALUES (@name, @slug, @description, @category_id, @author, @controls_keyboard, @controls_touch)
`);

// 获取 "经典游戏 > 街机" 分类
const arcadeCategory = db.prepare('SELECT id FROM categories WHERE slug = ?').get('classic-arcade') as { id: number } | undefined;

if (!arcadeCategory) {
  console.error('❌ 分类 "classic-arcade" 不存在');
  db.close();
  process.exit(1);
}

addSnakeGame.run({
  name: '贪吃蛇',
  slug: 'snake',
  description: '经典贪吃蛇游戏，控制蛇吃食物变长，避免撞墙和自身。支持键盘方向键、WASD 以及触摸滑动控制。',
  category_id: arcadeCategory.id,
  author: 'AI Games',
  controls_keyboard: '方向键 或 WASD',
  controls_touch: '滑动屏幕',
});

// 获取游戏ID并添加缩略图
const game = db.prepare('SELECT id FROM games WHERE slug = ?').get('snake') as { id: number } | undefined;

if (game) {
  const addScreenshot = db.prepare(`
    INSERT OR REPLACE INTO screenshots (game_id, path, is_thumbnail, display_order)
    VALUES (@game_id, @path, @is_thumbnail, @display_order)
  `);

  addScreenshot.run({
    game_id: game.id,
    path: '/games/snake/thumbnail.svg',
    is_thumbnail: 1,
    display_order: 0,
  });

  console.log('✅ 贪吃蛇游戏已添加到数据库');
} else {
  console.error('❌ 添加游戏失败');
}

// 查询结果
const allGames = db.prepare(`
  SELECT g.*, c.name as category_name
  FROM games g
  LEFT JOIN categories c ON g.category_id = c.id
`).all();

console.log('\n📋 所有游戏:');
console.table(allGames);

db.close();