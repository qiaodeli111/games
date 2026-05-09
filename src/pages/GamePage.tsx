import { useParams, Link } from 'react-router-dom';
import type { GamesData } from '../types';
import './GamePage.css';

interface Props {
  data: GamesData;
}

export default function GamePage({ data }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const game = data.games.find((g) => g.slug === slug);

  if (!game) {
    return (
      <div className="game-page error-page">
        <h1>游戏未找到</h1>
        <p>抱歉，找不到该游戏</p>
        <Link to="/" className="back-link">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <Link to="/" className="back-button">
          ← 返回
        </Link>
        <div className="game-title">
          <h1>{game.name}</h1>
          <span className="game-category-tag">{game.category_name}</span>
        </div>
        <div className="game-controls-info">
          {game.controls_keyboard && (
            <div className="control-item">
              <span className="control-label">⌨️ 键盘</span>
              <span className="control-value">{game.controls_keyboard}</span>
            </div>
          )}
          {game.controls_touch && (
            <div className="control-item">
              <span className="control-label">👆 触控</span>
              <span className="control-value">{game.controls_touch}</span>
            </div>
          )}
        </div>
      </header>

      <div className="game-container">
        <iframe
          src={`/games/${game.slug}/game.html`}
          title={game.name}
          className="game-iframe"
          allow="fullscreen"
        />
      </div>

      {game.description && (
        <div className="game-description-panel">
          <h3>游戏介绍</h3>
          <p>{game.description}</p>
        </div>
      )}
    </div>
  );
}