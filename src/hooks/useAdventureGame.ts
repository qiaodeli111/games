import { useState, useCallback, useRef, useEffect } from 'react';
import type { AdventureTheme, StoryScene, StoryChoice, StoryEnding, GameState } from '../types/adventure';
import { generateStoryOutline, generateNextScene, pickLiteraryStyle } from '../services/deepseek';
import { getFallbackStory, getFallbackEndings, hasFallbackStory } from '../services/storyFallback';

interface ParsedScene {
  story: string;
  translation: string;
  choices: Array<{
    text: string;
    translation: string;
    flavor: 'extreme-positive' | 'moderate-positive' | 'neutral' | 'moderate-negative' | 'extreme-negative';
  }>;
  elements: string[];
  background: string;
  image?: string;
  endingHint?: {
    endingId: number;
    title: string;
    titleCn?: string;
    description: string;
    descriptionCn?: string;
  } | null;
}

interface ParsedOutline {
  title: string;
  outline: string;
  endings: Array<{ id: number; title: string; titleCn?: string; description: string; descriptionCn?: string }>;
  firstScene: ParsedScene;
}

const MAX_TURNS = 100;
const USE_FALLBACK_ON_API_ERROR = true;

/** Cache for pre-generated scenes: choiceId → parsed scene data */
type PrefetchCache = Map<string, { scene: ParsedScene; choices: ParsedScene['choices'] }>;

function createInitialState(): GameState {
  return {
    theme: null, status: 'menu', currentScene: null, turn: 0,
    maxTurns: MAX_TURNS, history: [], endings: [], selectedEnding: null,
    showChinese: false, activeElements: new Set(), currentBackground: '',
  };
}

export function useAdventureGame() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [error, setError] = useState<string | null>(null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [transitionVisible, setTransitionVisible] = useState(false);
  const historyRef = useRef<Array<{ story: string; choice?: string }>>([]);
  const prefetchCache = useRef<PrefetchCache>(new Map());
  const prefetchAbort = useRef(false);
  const literaryStyle = useRef<{ name: string; author: string; description: string } | null>(null);

  const resetGame = useCallback(() => {
    setState(createInitialState());
    setError(null);
    setUseFallbackMode(false);
    setTransitionVisible(false);
    historyRef.current = [];
    prefetchCache.current.clear();
    prefetchAbort.current = true;
    literaryStyle.current = null;
    // Don't clear saved game — user can resume later
  }, []);

  // ─── Prefetch system ─────────────────────────────────────────
  // ─── Prefetch: generate next 3 scenes in background ─────────
  const prefetchNext3 = useCallback(async (
    choices: StoryChoice[],
    theme: AdventureTheme,
    turn: number,
    endings: StoryEnding[],
    history: Array<{ story: string; choice?: string }>
  ) => {
    if (prefetchAbort.current) return;
    const promises = choices.map(async (choice) => {
      const key = choice.id;
      if (prefetchCache.current.has(key)) {
        return;
      }
      try {
        const raw = await generateNextScene(
          theme.systemPrompt, history,
          { text: choice.text, flavor: choice.flavor },
          turn, MAX_TURNS,
          endings.map(e => ({ id: e.type, title: e.title, description: e.description })),
          literaryStyle.current
        );
        if (!prefetchAbort.current) {
          const parsed: ParsedScene = JSON.parse(raw);
          prefetchCache.current.set(key, { scene: parsed, choices: parsed.choices });
        }
      } catch {
      }
    });
    
    await Promise.all(promises);
  }, []);

  // ─── Apply a parsed scene to state ────────────────────────────
  const applyScene = useCallback((
    parsedRaw: ParsedScene,
    nextTurn: number,
    newHistory: StoryScene[],
    _endings: StoryEnding[],
    status: 'playing' | 'ending' | 'infinite',
    selectedEnding?: StoryEnding | null
  ) => {
    const scene = parseScene(parsedRaw, nextTurn);
    setTransitionVisible(false);
    setState(prev => ({
      ...prev,
      status,
      currentScene: scene,
      turn: nextTurn,
      selectedEnding: selectedEnding ?? prev.selectedEnding,
      activeElements: new Set([...prev.activeElements, ...scene.elements]),
      currentBackground: scene.background,
      history: newHistory,
    }));
    return scene;
  }, []);

  // ─── Fallback story ───────────────────────────────────────────
  const advanceFallback = useCallback((_choice: StoryChoice) => {
    if (!state.theme) return;
    const nextTurn = state.turn + 1;
    const result = getFallbackStory(state.theme.id, nextTurn + 1);
    if (!result || nextTurn >= state.turn + 5) {
      const endings = getFallbackEndings(state.theme.id);
      setState(prev => ({ ...prev, status: 'ending', selectedEnding: endings[Math.random() * endings.length | 0], turn: nextTurn }));
      return;
    }
    const { scene } = result;
    const endings = state.endings.length > 0 ? state.endings : result.endings;
    setState(prev => ({
      ...prev, currentScene: scene, turn: nextTurn, endings,
      activeElements: new Set([...prev.activeElements, ...scene.elements]),
      currentBackground: scene.background, history: [...prev.history, scene],
    }));
  }, [state]);

  // ─── Select theme ─────────────────────────────────────────────
  const selectTheme = useCallback(async (theme: AdventureTheme) => {
    setState(prev => ({ ...prev, theme, status: 'generating' }));
    setError(null);
    prefetchAbort.current = false;
    historyRef.current = [];

    try {
      literaryStyle.current = pickLiteraryStyle(theme.slug);
      const outlineRaw = await generateStoryOutline(theme.systemPrompt, theme.name, literaryStyle.current);
      const outline: ParsedOutline = JSON.parse(
        outlineRaw.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || outlineRaw
      );

      const endings: StoryEnding[] = outline.endings.map(e => ({
        id: e.id, title: e.title, titleCn: e.titleCn || '',
        description: e.description, descriptionCn: e.descriptionCn || '', type: e.id,
      }));

      const scene = parseScene(outline.firstScene, 1);
      setState(prev => ({
        ...prev, status: 'playing', currentScene: scene, turn: 1, endings,
        activeElements: new Set(scene.elements), currentBackground: scene.background, history: [scene],
      }));
      historyRef.current = [{ story: scene.text }];

      // Start prefetching next turns
      prefetchNext3(
        scene.choices, theme, 1, endings, historyRef.current
      );
    } catch (err) {
      if (USE_FALLBACK_ON_API_ERROR && hasFallbackStory(theme.id)) {
        const result = getFallbackStory(theme.id, 1);
        if (result) {
          setUseFallbackMode(true);
          setState(prev => ({ ...prev, status: 'playing', currentScene: result.scene, turn: 1, endings: result.endings, activeElements: new Set(result.scene.elements), currentBackground: result.scene.background, history: [result.scene] }));
          setError(null);
          return;
        }
      }
      setError(`Failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      setState(prev => ({ ...prev, status: 'menu' }));
    }
  }, [prefetchNext3]);

  // ─── Make choice ──────────────────────────────────────────────
  const makeChoice = useCallback(async (choice: StoryChoice) => {
    if (!state.theme || !state.currentScene) return;
    if (useFallbackMode) { advanceFallback(choice); return; }

    const currentTurn = state.turn;
    const newHistory = [...state.history];
    const cacheKey = choice.id;

    // Check prefetch cache first
    const cached = prefetchCache.current.get(cacheKey);
    if (cached) {
      const nextTurn = currentTurn + 1;
      const scene = applyScene(cached.scene, nextTurn, [...newHistory, parseScene(cached.scene, nextTurn)], state.endings, state.status === 'infinite' ? 'infinite' : 'playing');
      historyRef.current.push({ story: state.currentScene.text, choice: choice.text }, { story: scene.text });

      // Prefetch from this scene's choices
      if (scene.choices.length > 0) {
        prefetchNext3(scene.choices, state.theme, nextTurn, state.endings, historyRef.current);
      }
      return;
    }

    // Cache miss: show transition, generate on demand
    setTransitionVisible(true);
    try {
      const sceneRaw = await generateNextScene(
        state.theme.systemPrompt, historyRef.current,
        { text: choice.text, flavor: choice.flavor },
        currentTurn, MAX_TURNS,
        state.endings.map(e => ({ id: e.type, title: e.title, description: e.description })),
        literaryStyle.current
      );

      const parsedRaw: ParsedScene = JSON.parse(
        sceneRaw.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || sceneRaw
      );

      const nextTurn = currentTurn + 1;
      const isInfinite = state.status === 'infinite';

      if (!isInfinite && parsedRaw.endingHint?.endingId !== undefined) {
        const ending = state.endings.find(e => e.type === parsedRaw.endingHint!.endingId);
        applyScene(parsedRaw, nextTurn, [...newHistory, parseScene(parsedRaw, nextTurn)], state.endings, 'ending', ending || null);
      } else if (!isInfinite && nextTurn >= MAX_TURNS) {
        const defaultEnding = state.endings[Math.random() * state.endings.length | 0];
        applyScene(parsedRaw, nextTurn, [...newHistory, parseScene(parsedRaw, nextTurn)], state.endings, 'ending', defaultEnding);
      } else {
        const scene = applyScene(parsedRaw, nextTurn, [...newHistory, parseScene(parsedRaw, nextTurn)], state.endings, isInfinite ? 'infinite' : 'playing');
        historyRef.current.push({ story: state.currentScene.text, choice: choice.text }, { story: scene.text });

        // Prefetch from this scene's choices
        if (scene.choices.length > 0) {
          prefetchNext3(scene.choices, state.theme, nextTurn, state.endings, historyRef.current);
        }
      }
    } catch (err) {
      setTransitionVisible(false);
      if (USE_FALLBACK_ON_API_ERROR && hasFallbackStory(state.theme.id)) {
        setUseFallbackMode(true); advanceFallback(choice); return;
      }
      setError('Failed to generate next scene.');
    }
  }, [state, useFallbackMode, advanceFallback, applyScene, prefetchNext3]);

  // ─── Infinite mode ────────────────────────────────────────────
  const continueAfterEnding = useCallback(async () => {
    if (!state.theme || !state.currentScene) return;
    setState(prev => ({ ...prev, status: 'infinite', selectedEnding: null }));

    const choice: StoryChoice = {
      id: 'continue-after-ending',
      text: 'Continue the journey beyond the ending...',
      textCn: '在结局之后继续旅程...', flavor: 'moderate-positive',
    };

    // Check cache
    const cached = prefetchCache.current.get('continue-after-ending');
    if (cached) {
      const scene = parseScene(cached.scene, state.turn + 1);
      setTransitionVisible(false);
      setState(prev => ({
        ...prev, currentScene: scene, turn: state.turn + 1,
        activeElements: new Set([...prev.activeElements, ...scene.elements]),
        currentBackground: scene.background, history: [...prev.history, scene],
      }));
      if (scene.choices.length > 0) {
        prefetchNext3(scene.choices, state.theme, state.turn + 1, state.endings, historyRef.current);
      }
      return;
    }

    setTransitionVisible(true);
    try {
      const sceneRaw = await generateNextScene(
        state.theme.systemPrompt, historyRef.current,
        { text: choice.text, flavor: choice.flavor },
        state.turn, 9999, [], literaryStyle.current
      );
      const parsedRaw: ParsedScene = JSON.parse(sceneRaw.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || sceneRaw);
      const scene = parseScene(parsedRaw, state.turn + 1);
      setTransitionVisible(false);
      setState(prev => ({
        ...prev, currentScene: scene, turn: state.turn + 1,
        activeElements: new Set([...prev.activeElements, ...scene.elements]),
        currentBackground: scene.background, history: [...prev.history, scene],
      }));
      historyRef.current.push({ story: state.currentScene.text, choice: choice.text }, { story: scene.text });
    } catch (err) {
      setTransitionVisible(false);
      setState(prev => ({ ...prev, status: 'ending' }));
    }
  }, [state, prefetchNext3]);

  // ─── Auto-save game state to localStorage ──────────────────
  const SAVE_KEY = 'aigame_save';

  useEffect(() => {
    if (!state.currentScene || !state.theme || prefetchAbort.current) return;
    if (state.status === 'menu' || state.status === 'generating') return;
    
    const saveData = {
      theme: state.theme,
      themeId: state.theme.id,
      turn: state.turn,
      status: state.status,
      currentScene: state.currentScene,
      history: state.history,
      endings: state.endings,
      selectedEnding: state.selectedEnding,
      activeElements: Array.from(state.activeElements),
      currentBackground: state.currentBackground,
      literaryStyle: literaryStyle.current,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('[Save] Game saved at turn', state.turn);
    } catch (e) { console.warn('[Save] Failed:', e); }
  }, [state.currentScene?.id, state.status]);

  // ─── Check for saved game ───────────────────────────────────
  const hasSavedGame = (): boolean => {
    try {
      const exists = localStorage.getItem(SAVE_KEY) !== null;
      console.log('[Save] hasSavedGame:', exists);
      return exists;
    } catch { return false; }
  };

  const restoreSavedGame = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      
      // Restore literary style
      if (data.literaryStyle) {
        literaryStyle.current = data.literaryStyle;
      }
      
      // Restore history ref
      if (data.history) {
        historyRef.current = data.history.map((s: any) => ({ story: s.text }));
      }
      
      setState(prev => ({
        ...prev,
        theme: data.theme,
        turn: data.turn,
        status: data.status === 'ending' ? 'ending' : 'playing',
        currentScene: data.currentScene,
        history: data.history || [],
        endings: data.endings || [],
        selectedEnding: data.selectedEnding || null,
        activeElements: new Set(data.activeElements || []),
        currentBackground: data.currentBackground || '',
      }));
      return true;
    } catch (e) {
      console.error('Failed to restore saved game:', e);
      return false;
    }
  }, []);

  const clearSavedGame = useCallback(() => {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  }, []);

  // ─── Auto-prefetch when scene changes ──────────────────────
  useEffect(() => {
    if (!state.currentScene || !state.theme || prefetchAbort.current) return;
    if (state.status !== 'playing' && state.status !== 'infinite') return;
    
    const choices = state.currentScene.choices;
    if (choices.length === 0) return;
    
    const history = historyRef.current;
    prefetchNext3(choices, state.theme, state.turn, state.endings, history);
  }, [state.currentScene?.id, state.theme, prefetchNext3]);

  const toggleChinese = useCallback(() => {
    setState(prev => ({ ...prev, showChinese: !prev.showChinese }));
  }, []);

  return {
    state, error, useFallbackMode, transitionVisible,
    selectTheme, makeChoice, continueAfterEnding, toggleChinese, resetGame,
    hasSavedGame, restoreSavedGame, clearSavedGame,
    clearError: () => setError(null),
  };
}

function parseScene(raw: ParsedScene, turn: number): StoryScene {
  const choices = raw.choices?.map((c, i) => ({
    id: `choice-${turn}-${i}`, text: c.text, textCn: c.translation || '',
    flavor: c.flavor || 'neutral',
  })) || [];
  return {
    id: turn, text: raw.story, textCn: raw.translation || '',
    choices, elements: raw.elements || [],
    background: raw.background || 'default', image: raw.image, turn,
  };
}
