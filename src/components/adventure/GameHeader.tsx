import type { AdventureTheme } from '../../types/adventure';

interface Props {
  theme: AdventureTheme;
  turn: number;
  showChinese: boolean;
  onToggleChinese: () => void;
  onReset: () => void;
  isInfinite?: boolean;
}

export default function GameHeader({ theme, turn, showChinese, onToggleChinese, onReset, isInfinite }: Props) {
  return (
    <header className="adventure-header">
      <div className="header-left">
        <button className="header-btn" onClick={onReset} title="Back to menu">
          ← Menu
        </button>
        <div className="header-theme">
          <span className="header-icon">{theme.icon}</span>
          <span className="header-title">{theme.nameCn}</span>
          {isInfinite && <span className="header-badge">♾️</span>}
        </div>
      </div>
      <div className="header-center">
        <div className="header-progress">
          <div className="progress-track">
            <span>Turn {turn}</span>
          </div>
        </div>
      </div>
      <div className="header-right">
        <button
          className={`header-btn lang-btn ${showChinese ? 'active' : ''}`}
          onClick={onToggleChinese}
        >
          {showChinese ? '🇨🇳 中文' : '🇬🇧 English'}
        </button>
      </div>
    </header>
  );
}
