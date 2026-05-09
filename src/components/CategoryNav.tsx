import type { Category } from '../types';
import './CategoryNav.css';

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryNav({ categories, selectedId, onSelect }: Props) {
  return (
    <nav className="category-nav">
      <button
        className={`category-item ${selectedId === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className="category-icon">🎮</span>
        全部游戏
      </button>
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          selectedId={selectedId}
          onSelect={onSelect}
          level={0}
        />
      ))}
    </nav>
  );
}

interface ItemProps {
  category: Category;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  level: number;
}

function CategoryItem({ category, selectedId, onSelect, level }: ItemProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isActive = selectedId === category.id;

  return (
    <div className="category-group">
      <button
        className={`category-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(category.id)}
      >
        <span className="category-icon">{getCategoryIcon(category.slug)}</span>
        {category.name}
        {hasChildren && <span className="arrow">▸</span>}
      </button>
      {hasChildren && (
        <div className="category-children">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    classic: '🕹️',
    action: '⚔️',
    puzzle: '🧩',
    shooting: '🔫',
    strategy: '♟️',
    sports: '⚽',
    adventure: '🗺️',
    'classic-arcade': '👾',
    'classic-casual': '🎯',
  };
  return icons[slug] || '📁';
}