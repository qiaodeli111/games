import { useState, useEffect } from 'react';
import type { StoryScene, StoryChoice } from '../../types/adventure';

interface Props {
  scene: StoryScene;
  showChinese: boolean;
  onChoose: (choice: StoryChoice) => void;
}

const flavorIcons: Record<string, string> = {
  'extreme-positive': '🔥',
  'moderate-positive': '👍',
  'neutral': '➡️',
  'moderate-negative': '👎',
  'extreme-negative': '💀',
};

const flavorColors: Record<string, string> = {
  'extreme-positive': '#ffd700',
  'moderate-positive': '#4caf50',
  'neutral': '#90a4ae',
  'moderate-negative': '#ff9800',
  'extreme-negative': '#f44336',
};

export default function GameScene({ scene, showChinese, onChoose }: Props) {
  // Animate scene on change by using scene.id as key
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVisible(false);
    setLoading(true);
    const timer = setTimeout(() => {
      setVisible(true);
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [scene.id]);

  // Typewriter effect for story text
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!visible) return;
    setDisplayedText('');
    const words = scene.text.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(words.slice(0, i).join(' '));
      if (i >= words.length) clearInterval(interval);
    }, 30); // 30ms per word = ~15 words/sec
    return () => clearInterval(interval);
  }, [scene.id, visible]);

  return (
    <div className="game-scene">
      <div className="scene-turn">Turn {scene.turn}</div>

      {loading ? (
        <div className="scene-loading">
          <div className="scene-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : (
        <>
          <div className="scene-text">
            <p className="scene-story">{displayedText}</p>
            {showChinese && scene.textCn && (
              <p className="scene-story-cn">{scene.textCn}</p>
            )}
          </div>

          <div className="scene-choices">
            {scene.choices.map((choice, index) => (
              <button
                key={choice.id}
                className="choice-btn"
                style={{ 
                  borderColor: flavorColors[choice.flavor] || '#666',
                  animationDelay: `${index * 0.08}s`,
                }}
                onClick={() => onChoose(choice)}
              >
                <span className="choice-flavor">
                  {flavorIcons[choice.flavor] || '➡️'}
                </span>
                <span className="choice-content">
                  <span className="choice-text">{choice.text}</span>
                  {showChinese && choice.textCn && (
                    <span className="choice-text-cn">{choice.textCn}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
