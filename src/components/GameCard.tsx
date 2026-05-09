import { Link } from 'react-router-dom';
import type { Game } from '../types';
import './GameCard.css';

interface Props {
  game: Game;
}

export default function GameCard({ game }: Props) {
  return (
    <Link to={`/game/${game.slug}`} className="game-card">
      <div className="game-thumbnail">
        {game.thumbnail ? (
          <img src={game.thumbnail} alt={game.name} />
        ) : (
          <div className="placeholder-thumbnail">
            <span>🎮</span>
          </div>
        )}
      </div>
      <div className="game-info">
        <h3 className="game-name">{game.name}</h3>
        <p className="game-category">{game.category_name}</p>
        {game.description && (
          <p className="game-description">{game.description}</p>
        )}
      </div>
    </Link>
  );
}