import { useState, useEffect } from 'react';
import type { AdventureTheme } from '../../types/adventure';
import { getBackgroundUrl } from '../../services/spriteLoader';
import { getImageForScene } from '../../services/imageRegistry';

interface Props {
  background: string;
  elements: Set<string>;
  theme: AdventureTheme;
  /** AI-selected image filename, e.g. "bg-3.jpg" or "char-5.jpg" */
  sceneImage?: string;
  /** The current scene text for fallback matching */
  sceneText?: string;
}

function useImageExists(url: string | null): boolean {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    if (!url) { setExists(false); return; }
    let cancelled = false;
    fetch(url, { method: 'HEAD' })
      .then(r => { if (!cancelled) setExists(r.ok); })
      .catch(() => { if (!cancelled) setExists(false); });
    return () => { cancelled = true; };
  }, [url]);
  return exists;
}

export default function StoryCanvas({ background, elements, theme, sceneImage, sceneText }: Props) {
  // Determine which image to show:
  // 1. If AI provided an image filename, use it
  // 2. Otherwise, fall back to keyword matching from registry
  // 3. Last resort: use background image

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;

    if (sceneImage) {
      // AI selected image
      url = `/adventure-images/${theme.slug}/${sceneImage}`;
    } else {
      // Fallback: keyword match scene text + elements against registry
      const text = sceneText || background;
      const elArray = Array.from(elements);
      const match = getImageForScene(theme.slug, text, elArray);
      if (match) {
        url = `/adventure-images/${theme.slug}/${match.file}`;
      } else {
        // Last resort: background image
        url = getBackgroundUrl(theme.slug, background);
      }
    }

    setImageUrl(url);
  }, [sceneImage, sceneText, background, elements, theme.slug]);

  const exists = useImageExists(imageUrl);

  return (
    <div className="story-canvas">
      {exists && imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="canvas-single-image"
          key={imageUrl}
        />
      ) : (
        <div className="bg-placeholder">
          <span className="bg-label">{sceneImage || background}</span>
        </div>
      )}
    </div>
  );
}
