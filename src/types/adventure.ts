/** Adventure game type definitions */

export interface AdventureTheme {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  /** Slug for spritesheet image paths */
  slug: string;
  /** Story generation context prompt */
  systemPrompt: string;
}

export interface StoryScene {
  id: number;
  text: string;
  textCn: string;
  choices: StoryChoice[];
  /** Elements mentioned in this scene */
  elements: string[];
  /** Background image key */
  background: string;
  /** Single image to display (e.g. "bg-3.jpg" or "char-5.jpg") */
  image?: string;
  /** Current turn number */
  turn: number;
}

export interface StoryChoice {
  id: string;
  text: string;
  textCn: string;
  /** Personality flavor: extreme-positive, moderate-positive, neutral, moderate-negative, extreme-negative */
  flavor: 'extreme-positive' | 'moderate-positive' | 'neutral' | 'moderate-negative' | 'extreme-negative';
}

export interface GameState {
  theme: AdventureTheme | null;
  status: 'menu' | 'generating' | 'playing' | 'ending' | 'finished' | 'infinite';
  currentScene: StoryScene | null;
  turn: number;
  maxTurns: number;
  history: StoryScene[];
  endings: StoryEnding[];
  selectedEnding: StoryEnding | null;
  showChinese: boolean;
  /** Elements that have appeared in the story so far */
  activeElements: Set<string>;
  /** Current background */
  currentBackground: string;
}

export interface StoryEnding {
  id: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  /** Which ending type (0-9) */
  type: number;
}

export interface SpriteSheetConfig {
  /** Path to the spritesheet image */
  path: string;
  /** Width of the full spritesheet */
  width: number;
  /** Height of the full spritesheet */
  height: number;
  /** Named regions that can be cropped */
  regions: Record<string, SpriteRegion>;
}

export interface SpriteRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  labelCn: string;
}

/** All element types that can appear in the scene */
export type GameElement = 
  | 'player' | 'companion' | 'enemy' | 'animal' | 'plant'
  | 'treasure' | 'weapon' | 'tool' | 'key' | 'map'
  | 'fire' | 'water' | 'stone' | 'wood' | 'crystal'
  | 'stairs' | 'door' | 'chest' | 'scroll' | 'portal'
  | 'torch' | 'sword' | 'shield' | 'potion' | 'book'
  | 'star' | 'moon' | 'sun' | 'mountain' | 'tree';

/** Display element with position on canvas */
export interface DisplayElement {
  type: GameElement;
  x: number;
  y: number;
  width: number;
  height: number;
  flipX?: boolean;
}
