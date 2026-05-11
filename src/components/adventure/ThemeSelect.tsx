import type { AdventureTheme } from '../../types/adventure';

interface Props {
  themes: AdventureTheme[];
  onSelect: (theme: AdventureTheme) => void;
  hasSavedGame: boolean;
  onContinue: () => void;
}

export default function ThemeSelect({ themes, onSelect, hasSavedGame, onContinue }: Props) {
  return (
    <div className="theme-select">
      <div className="theme-select-header">
        <h1>AI Text Adventure</h1>
        <p>Choose your adventure theme to begin</p>
        <p className="theme-select-sub">
          Your choices shape the story &mdash; every path leads somewhere new
        </p>
      </div>

      {hasSavedGame && (
        <div className="continue-banner">
          <button className="continue-btn" onClick={onContinue}>
            <span className="continue-icon">▶</span>
            <span className="continue-text">Continue Adventure</span>
            <span className="continue-sub">Resume your last journey</span>
          </button>
        </div>
      )}

      <div className="theme-grid">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className="theme-card"
            onClick={() => onSelect(theme)}
          >
            <span className="theme-icon">{theme.icon}</span>
            <div className="theme-info">
              <h3 className="theme-name">{theme.name}</h3>
              <p className="theme-name-cn">{theme.nameCn}</p>
              <p className="theme-desc">{theme.description}</p>
              <p className="theme-desc-cn">{theme.descriptionCn}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
