import { useAdventureGame } from '../hooks/useAdventureGame';
import { adventureThemes } from '../services/adventureThemes';
import ThemeSelect from '../components/adventure/ThemeSelect';
import GameScene from '../components/adventure/GameScene';
import StoryCanvas from '../components/adventure/StoryCanvas';
import GameHeader from '../components/adventure/GameHeader';
import TransitionOverlay from '../components/adventure/TransitionOverlay';
import './AdventurePage.css';

export default function AdventurePage() {
  const { state, error, useFallbackMode, transitionVisible, selectTheme, makeChoice, continueAfterEnding, toggleChinese, resetGame, clearError, hasSavedGame, restoreSavedGame, clearSavedGame, exportStory } = useAdventureGame();

  const startNewGame = () => {
    clearSavedGame();
    resetGame();
  };

  const handleExport = () => {
    const md = exportStory();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adventure-${state.theme?.slug || 'story'}-${state.turn || 0}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (state.status === 'menu') {
    return (
      <div className="adventure-page">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="error-dismiss">✕</button>
          </div>
        )}
        <ThemeSelect
          themes={adventureThemes}
          onSelect={selectTheme}
          hasSavedGame={hasSavedGame()}
          onContinue={restoreSavedGame}
        />
      </div>
    );
  }

  if (state.status === 'generating') {
    return (
      <div className="adventure-page">
        <div className="generating-overlay">
          <div className="generating-spinner"></div>
          <h2>Generating Your Adventure...</h2>
          <p>The story begins to unfold...</p>
          <p className="generating-hint">Deepseek AI is creating your personalized journey</p>
        </div>
      </div>
    );
  }

  if (state.status === 'ending' || state.status === 'finished') {
    return (
      <div className="adventure-page">
        <GameHeader
          theme={state.theme!}
          turn={state.turn}
          showChinese={state.showChinese}
          onToggleChinese={toggleChinese}
          onReset={resetGame}
        />
        <StoryCanvas
          background={state.currentBackground}
          elements={state.activeElements}
          theme={state.theme!}
          sceneImage={state.currentScene?.image}
          sceneText={state.currentScene?.text}
        />
        <div className="ending-screen">
          <div className="ending-ornament">✦ ✦ ✦</div>
          <h1 className="ending-title">The End</h1>
          {state.selectedEnding && (
            <div className="ending-card">
              <h2>{state.selectedEnding.title}</h2>
              <p>{state.selectedEnding.description}</p>
              {state.showChinese && state.selectedEnding.titleCn && (
                <>
                  <h2 className="ending-cn">{state.selectedEnding.titleCn}</h2>
                  <p className="ending-cn">{state.selectedEnding.descriptionCn}</p>
                </>
              )}
            </div>
          )}
          <div className="ending-stats">
            <p>Theme: {state.theme?.nameCn || state.theme?.name}</p>
          </div>
          <div className="ending-actions">
            <button className="btn-continue" onClick={continueAfterEnding}>
              ♾️ Continue Adventure
            </button>
            <button className="btn-play-again" onClick={startNewGame}>
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adventure-page">
      <GameHeader
        theme={state.theme!}
        turn={state.turn}
        showChinese={state.showChinese}
        onToggleChinese={toggleChinese}
        onReset={resetGame}
        isInfinite={state.status === 'infinite'}
        onExport={handleExport}
      />
      {state.status === 'infinite' && (
        <div className="infinite-notice">
          <span>♾️ Infinite Adventure — the story continues beyond the ending</span>
        </div>
      )}
      {useFallbackMode && (
        <div className="fallback-notice">
          <span>📡 Offline mode — using local story templates (Deepseek API unavailable)</span>
        </div>
      )}
      {error && (
        <div className="error-notice">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="error-dismiss">✕</button>
        </div>
      )}
      <TransitionOverlay visible={transitionVisible} />
      <div className="game-layout">
        <StoryCanvas
          background={state.currentBackground}
          elements={state.activeElements}
          theme={state.theme!}
          sceneImage={state.currentScene?.image}
          sceneText={state.currentScene?.text}
        />
        <GameScene
          scene={state.currentScene!}
          showChinese={state.showChinese}
          onChoose={makeChoice}
        />
      </div>
    </div>
  );
}
