import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { GamesData, Category } from '../types';
import CategoryNav from '../components/CategoryNav';
import GameCard from '../components/GameCard';
import './HomePage.css';

interface Props {
  data: GamesData;
}

export default function HomePage({ data }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤游戏
  const filteredGames = useMemo(() => {
    let games = data.games;

    // 按分类过滤
    if (selectedCategory !== null) {
      // 获取选中分类及其所有子分类的 ID
      const categoryIds = getCategoryAndChildren(data.allCategories, selectedCategory);
      games = games.filter((g) => categoryIds.includes(g.category_id));
    }

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      games = games.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query)
      );
    }

    return games;
  }, [data.games, selectedCategory, searchQuery]);

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            🎮 AI Games
          </Link>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索游戏..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <h2>游戏分类</h2>
          <CategoryNav
            categories={data.categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </aside>

        <section className="game-section">
          <div className="section-header">
            <h2>
              {selectedCategory
                ? data.allCategories.find((c) => c.id === selectedCategory)?.name || '全部游戏'
                : '全部游戏'}
            </h2>
            <span className="game-count">{filteredGames.length} 个游戏</span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="empty-state">
              <p>暂无游戏</p>
              <p className="hint">选择其他分类或清除搜索词</p>
            </div>
          ) : (
            <div className="game-grid">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// 获取分类及其所有子分类的 ID
function getCategoryAndChildren(categories: Category[], parentId: number): number[] {
  const result = [parentId];
  const children = categories.filter((c) => c.parent_id === parentId);
  children.forEach((child) => {
    result.push(...getCategoryAndChildren(categories, child.id));
  });
  return result;
}