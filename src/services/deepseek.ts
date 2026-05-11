/**
 * Deepseek API service for story generation
 * Uses the deepseek-v4-flash model
 */

import { getLiteraryStyles } from './imageRegistry';

const API_BASE = 'https://api.deepseek.com';
const API_KEY = 'sk-69f46c11b69a401f9878dd00833bfa0e';
const MODEL = 'deepseek-v4-flash';

export interface DeepseekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepseekResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepseekRequest {
  model: string;
  messages: DeepseekMessage[];
  max_tokens: number;
  temperature: number;
  response_format?: { type: 'json_object' };
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick a literary style once, then reuse it for all subsequent calls.
 * If style is already chosen, inject it without randomizing again.
 */
export function pickLiteraryStyle(themeSlug: string): { name: string; author: string; description: string } | null {
  const styles = getLiteraryStyles(themeSlug);
  if (!styles || styles.length === 0) return null;
  return pickRandom(styles);
}

function injectLiteraryStyle(basePrompt: string, style: { name: string; author: string; description: string } | null): string {
  if (!style) return basePrompt;
  return `${basePrompt}\n\nLITERARY STYLE: Write in the narrative style inspired by "${style.name}" by ${style.author}. ${style.description}. Blend this literary flavor into your prose — the pacing, tone, and vocabulary should evoke this work. Make it feel like a great novel.`;
}

/** Inject image selection instructions */
function injectImagePrompt(prompt: string): string {
  return `${prompt}\n\nIMAGE SELECTION: Also include an "image" field in the JSON with the single best image filename for this scene. Choose from these categories:
- "bg-X.jpg" for scene/background shots (when describing a location or environment)
- "char-X.jpg" for character-focused scenes (when talking to or encountering someone)
- "item-X.jpg" when the scene revolves around a specific object or discovery

Pick the ONE image that best represents this moment. Make the image filename meaningful to the story content. Example: "image": "bg-3.jpg" or "image": "char-5.jpg"`;
}

/** Generate a random story length descriptor */
export function pickTurnLength(): string {
  const r = Math.random();
  if (r < 0.25) return 'very short';      // 25%: 1 paragraph, ~40 words
  if (r < 0.55) return 'short';           // 30%: 1-2 paragraphs, ~60 words
  if (r < 0.80) return 'moderate';        // 25%: 2 paragraphs, ~100 words
  return 'long';                            // 20%: 3 paragraphs, ~150 words
}

function injectLength(prompt: string, length: string): string {
  return `${prompt}\n\nSTORY LENGTH: This scene should be ${length}. ${length === 'very short' ? 'A brief moment, just a few sentences.' : length === 'short' ? 'A concise scene with just enough detail.' : length === 'moderate' ? 'A normal scene with good detail.' : 'A detailed scene with rich description.'} The pacing should vary between turns — some moments are quick, some are contemplative.`;
}

/**
 * Call Deepseek API for story generation
 */
export async function callDeepseek(
  messages: DeepseekMessage[],
  options: {
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  const { maxTokens = 2000, temperature = 0.8, jsonMode = true } = options;

  const requestBody: DeepseekRequest = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  if (jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepseek API error (${response.status}): ${errorText}`);
  }

  const data: DeepseekResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Deepseek returned empty response');
  }

  return content;
}

/**
 * Generate the initial story outline with 10 endings
 */
export async function generateStoryOutline(systemPrompt: string, themeName: string, literaryStyle: { name: string; author: string; description: string } | null): Promise<string> {
  const literaryPrompt = injectLiteraryStyle(systemPrompt, literaryStyle);

  const messages: DeepseekMessage[] = [
    {
      role: 'system',
      content: `${literaryPrompt}\n\nIMPORTANT: You are setting up a new game. Generate a story outline with 10 possible endings for a "${themeName}" adventure. The game should take approximately 100 turns to reach an ending.`,
    },
    {
      role: 'user',
      content: injectImagePrompt(`Generate a complete story outline for a "${themeName}" text adventure game with:
1. A compelling three-act story structure
2. Exactly 10 distinct endings (numbered 0-9), each with a title, description
3. The first scene description to start the adventure

Return JSON format:
{
  "title": "Episode title",
  "outline": "Three-act story outline...",
  "endings": [
    {"id": 0, "title": "Ending Title", "titleCn": "中文结局标题", "description": "How this ending happens...", "descriptionCn": "中文结局描述..."},
    ... (10 endings total)
  ],
  "firstScene": {
    "story": "The opening narrative...",
    "translation": "中文翻译...",
    "choices": [3 choices with text, translation, and flavor],
    "elements": ["element1", "element2", ...],
    "background": "background_key",
    "image": "bg-0.jpg"
  }
}`),
    },
  ];

  return callDeepseek(messages, { maxTokens: 2500, temperature: 0.85 });
}

/**
 * Generate next scene based on player choice
 */
export async function generateNextScene(
  systemPrompt: string,
  history: Array<{ story: string; choice?: string }>,
  choice: { text: string; flavor: string },
  turn: number,
  maxTurns: number,
  endings: Array<{ id: number; title: string; description: string }>,
  literaryStyle: { name: string; author: string; description: string } | null,
  turnLength?: string
): Promise<string> {
  const literaryPrompt = injectLiteraryStyle(systemPrompt, literaryStyle);
  const endingTypes = endings.map(e => `- Ending ${e.id}: ${e.title} — ${e.description}`).join('\n');

  const userMessage = injectLength(injectImagePrompt(`Continue the story. Turn ${turn + 1} of approximately ${maxTurns}.

The player chose: "${choice.text}" (${choice.flavor})

Based on this choice, advance the story. If the story is approaching its conclusion (turn > ${maxTurns - 10}), steer toward one of the endings.

Possible endings:
${endingTypes}

Return JSON:
{
  "story": "Narrative continuing from the choice...",
  "translation": "中文翻译...",
  "choices": [3 choices with text, translation, and flavor],
  "elements": ["element1", "element2", ...],
  "background": "background_key",
  "image": "bg-0.jpg",
  "endingHint": null or { "endingId": 0, "title": "Ending Title", "titleCn": "中文标题", "description": "How the story concludes...", "descriptionCn": "中文描述..." }
}`), turnLength || pickTurnLength());

  const historyMessages: DeepseekMessage[] = [
    { role: 'system', content: literaryPrompt },
  ];

  for (const h of history) {
    historyMessages.push({ role: 'assistant', content: JSON.stringify({ story: h.story }) });
    if (h.choice) {
      historyMessages.push({ role: 'user', content: `I choose: ${h.choice}` });
    }
  }

  historyMessages.push({ role: 'user', content: userMessage });

  return callDeepseek(historyMessages, { maxTokens: 2000, temperature: 0.8 });
}

/**
 * Generate a short transition text based on the player's choice.
 * Quick call (max 50 tokens), lighthearted tone, independent of story context.
 */
export async function generateTransitionText(
  choiceText: string,
  flavor: string
): Promise<string> {
  const messages: DeepseekMessage[] = [
    {
      role: 'system',
      content: `You generate ONE short transition sentence (max 15 words) for a game. 
The player just made a choice and is waiting for the next scene. 
Describe what's happening in a lighthearted, immersive way based on their choice.

Example:
Choice: "Jump into the dark hole"
Response: "Plunging into darkness..."

Choice: "Draw your weapon and confront the enemy"
Response: "Steel meets steel!"

Choice: "Run away"
Response: "Feet pounding against the ground..."

Return ONLY the transition text, no quotes, no JSON, no explanation. One line.`,
    },
    {
      role: 'user',
      content: `Choice (${flavor}): ${choiceText}`,
    },
  ];

  const result = await callDeepseek(messages, { maxTokens: 50, temperature: 0.9, jsonMode: false });
  return result.trim().replace(/^["']|["']$/g, '');
}
