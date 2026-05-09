import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../games.db');
const outputDir = resolve(__dirname, '../public/data');

// 确保输出目录存在
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const db = new Database(dbPath, { readonly: true });

// 查询所有分类
const categories = db.prepare(`
  SELECT id, name, slug, parent_id, created_at
  FROM categories
  ORDER BY parent_id NULLS FIRST, slug
`).all() as Array<{
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  created_at: string;
}>;

// 查询所有游戏
const games = db.prepare(`
  SELECT
    g.id,
    g.name,
    g.slug,
    g.description,
    g.category_id,
    g.author,
    g.controls_keyboard,
    g.controls_touch,
    g.created_at,
    c.name as category_name,
    c.slug as category_slug
  FROM games g
  LEFT JOIN categories c ON g.category_id = c.id
  ORDER BY g.created_at DESC
`).all() as Array<{
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category_id: number;
  author: string | null;
  controls_keyboard: string | null;
  controls_touch: string | null;
  created_at: string;
  category_name: string;
  category_slug: string;
}>;

// 查询所有截图
const screenshots = db.prepare(`
  SELECT id, game_id, path, is_thumbnail, display_order
  FROM screenshots
  ORDER BY game_id, display_order
`).all() as Array<{
  id: number;
  game_id: number;
  path: string;
  is_thumbnail: number;
  display_order: number;
}>;

// 组装游戏数据（包含截图）
const gamesWithScreenshots = games.map(game => ({
  ...game,
  thumbnail: screenshots.find(s => s.game_id === game.id && s.is_thumbnail)?.path || null,
  screenshots: screenshots.filter(s => s.game_id === game.id && !s.is_thumbnail).map(s => s.path),
}));

// 构建分类树
interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children: Category[];
}

function buildCategoryTree(categories: typeof categories): Category[] {
  const categoryMap = new Map<number, Category>();
  const roots: Category[] = [];

  // 先创建所有节点
  for (const cat of categories) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      children: [],
    });
  }

  // 构建树结构
  for (const cat of categories) {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id === null) {
      roots.push(node);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return roots;
}

const categoryTree = buildCategoryTree(categories);

// 输出数据
const outputData = {
  categories: categoryTree,
  games: gamesWithScreenshots,
  allCategories: categories,
};

writeFileSync(resolve(outputDir, 'games.json'), JSON.stringify(outputData, null, 2));

console.log('✅ Data generated:');
console.log(`   - Categories: ${categories.length}`);
console.log(`   - Games: ${games.length}`);
console.log(`   - Screenshots: ${screenshots.length}`);
console.log(`   - Output: ${outputDir}/games.json`);

db.close();