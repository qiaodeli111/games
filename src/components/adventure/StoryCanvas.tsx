import { useState, useEffect } from 'react';
import type { AdventureTheme } from '../../types/adventure';
import { getBackgroundUrl } from '../../services/spriteLoader';
import { getImageForScene } from '../../services/imageRegistry';

const CDN = 'https://pics.dellyqiao.com/aigames';

interface Props {
  background: string;
  elements: Set<string>;
  theme: AdventureTheme;
  sceneImage?: string;
  sceneText?: string;
}

export default function StoryCanvas({ background, elements, theme, sceneImage, sceneText }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string | null = null;

    if (sceneImage) {
      url = `${CDN}/${theme.slug}/${sceneImage}`;
    } else {
      const text = sceneText || background;
      const elArray = Array.from(elements);
      const match = getImageForScene(theme.slug, text, elArray);
      if (match) {
        url = `${CDN}/${theme.slug}/${match.file}`;
      } else {
        url = getBackgroundUrl(theme.slug, background);
      }
    }

    console.log('[StoryCanvas] URL:', url);
    setImageUrl(url);
    setError(false);
  }, [sceneImage, sceneText, background, elements, theme.slug]);

  if (!imageUrl) {
    return (
      <div className="story-canvas">
        <div className="bg-placeholder"><span>{sceneImage || background}</span></div>
      </div>
    );
  }

  return (
    <div className="story-canvas">
      {error ? (
        <div className="bg-placeholder"><span>{sceneImage || background}</span></div>
      ) : (
        <img
          src={imageUrl}
          alt=""
          className="canvas-single-image"
          onError={() => setError(true)}
          key={imageUrl}
        />
      )}
    </div>
  );
}
