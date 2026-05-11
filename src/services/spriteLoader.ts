/**
 * Image loader for adventure game.
 * Maps background keys → bg images, element types → char/item images.
 * All per-theme, so each theme has its own dedicated images.
 */



// ─── Per-theme: background key → bg-X.jpg ────────────────────────
const THEME_BG: Record<string, Record<string, string>> = {
  'center-earth': {
    cave: 'bg-0', cavern: 'bg-1', jungle: 'bg-2', crystal: 'bg-3', magma: 'bg-4',
    tunnel: 'bg-8', ruins: 'bg-11', lake: 'bg-6', waterfall: 'bg-13', chasm: 'bg-9',
    forest: 'bg-10', lava: 'bg-12', core: 'bg-14', fossil: 'bg-5', geode: 'bg-7',
  },
  'space': {
    ship: 'bg-0', planet: 'bg-1', nebula: 'bg-2', alien: 'bg-3', asteroid: 'bg-4',
    station: 'bg-5', cockpit: 'bg-6', moon: 'bg-7', wormhole: 'bg-8', galaxy: 'bg-9',
    hangar: 'bg-10', debris: 'bg-11', atmosphere: 'bg-12', surface: 'bg-13', orbit: 'bg-14',
  },
  'haunted-village': {
    village: 'bg-0', cemetery: 'bg-1', mansion: 'bg-2', forest: 'bg-3', church: 'bg-4',
    crypt: 'bg-5', attic: 'bg-6', cellar: 'bg-7', graveyard: 'bg-8', altar: 'bg-9',
    pond: 'bg-10', gate: 'bg-11', tower: 'bg-12', bridge: 'bg-13', sacrifice: 'bg-14',
  },
  'wild-west': {
    desert: 'bg-0', town: 'bg-1', canyon: 'bg-2', saloon: 'bg-3', ranch: 'bg-4',
    mine: 'bg-5', river: 'bg-6', prairie: 'bg-7', fort: 'bg-8', railway: 'bg-9',
    camp: 'bg-10', jail: 'bg-11', hotel: 'bg-12', bank: 'bg-13', ridge: 'bg-14',
  },
  'deep-sea': {
    coral: 'bg-0', trench: 'bg-1', ruin: 'bg-2', cave: 'bg-3', abyss: 'bg-4',
    reef: 'bg-5', kelp: 'bg-6', shipwreck: 'bg-7', volcano: 'bg-8', ice: 'bg-9',
    canyon: 'bg-10', grotto: 'bg-11', city: 'bg-12', vent: 'bg-13', temple: 'bg-14',
  },
  'tomb-raiding': {
    tomb: 'bg-0', temple: 'bg-1', chamber: 'bg-2', tunnel: 'bg-3', treasure: 'bg-4',
    pyramid: 'bg-5', corridor: 'bg-6', trap: 'bg-7', crypt: 'bg-8', offering: 'bg-9',
    stairway: 'bg-10', pillar: 'bg-11', sanctum: 'bg-12', entrance: 'bg-13', altar: 'bg-14',
  },
  'apocalypse': {
    wasteland: 'bg-0', bunker: 'bg-1', city: 'bg-2', ruins: 'bg-3', forest: 'bg-4',
    highway: 'bg-5', mall: 'bg-6', hospital: 'bg-7', camp: 'bg-8', plant: 'bg-9',
    tunnel: 'bg-10', bridge: 'bg-11', roof: 'bg-12', sewer: 'bg-13', military: 'bg-14',
  },
  'magic-academy': {
    hall: 'bg-0', library: 'bg-1', garden: 'bg-2', classroom: 'bg-3', tower: 'bg-4',
    courtyard: 'bg-5', dormitory: 'bg-6', potions: 'bg-7', observatory: 'bg-8', dungeon: 'bg-9',
    roof: 'bg-10', fountain: 'bg-11', gate: 'bg-12', forest: 'bg-13', chamber: 'bg-14',
  },
  'cyberpunk': {
    street: 'bg-0', lab: 'bg-1', rooftop: 'bg-2', club: 'bg-3', subway: 'bg-4',
    alley: 'bg-5', market: 'bg-6', arcade: 'bg-7', penthouse: 'bg-8', sewer: 'bg-9',
    bridge: 'bg-10', factory: 'bg-11', prison: 'bg-12', server: 'bg-13', plaza: 'bg-14',
  },
  'lost-civilization': {
    jungle: 'bg-0', temple: 'bg-1', garden: 'bg-2', plaza: 'bg-3', chamber: 'bg-4',
    pyramid: 'bg-5', bridge: 'bg-6', palace: 'bg-7', observatory: 'bg-8', tomb: 'bg-9',
    stairway: 'bg-10', fountain: 'bg-11', gate: 'bg-12', cave: 'bg-13', sanctum: 'bg-14',
  },
};

// ─── Per-theme: element type → image file ────────────────────────
// Characters (char-*.jpg) and Items (item-*.jpg)
interface ElementImage {
  file: string;
  label: string;
  width?: number;
  height?: number;
}

const THEME_ELEMENTS: Record<string, Record<string, ElementImage>> = {
  'center-earth': {
    player: { file: 'char-0.jpg', label: 'Explorer', width: 100, height: 150 },
    companion: { file: 'char-1.jpg', label: 'Guide', width: 90, height: 140 },
    enemy: { file: 'char-2.jpg', label: 'Cave Troll', width: 120, height: 160 },
    animal: { file: 'char-10.jpg', label: 'Dinosaur', width: 110, height: 90 },
    treasure: { file: 'item-5.jpg', label: 'Crystal Gem', width: 50, height: 50 },
    weapon: { file: 'item-0.jpg', label: 'Pickaxe', width: 60, height: 30 },
    tool: { file: 'item-2.jpg', label: 'Rope', width: 50, height: 40 },
    key: { file: 'item-14.jpg', label: 'Ancient Key', width: 40, height: 40 },
    map: { file: 'item-4.jpg', label: 'Map', width: 60, height: 50 },
    fire: { file: 'item-1.jpg', label: 'Torch', width: 40, height: 60 },
    water: { file: 'item-10.jpg', label: 'Water Flask', width: 35, height: 45 },
    stone: { file: 'item-8.jpg', label: 'Lava Rock', width: 45, height: 45 },
    wood: { file: 'item-11.jpg', label: 'Climbing Gear', width: 50, height: 40 },
    crystal: { file: 'item-5.jpg', label: 'Crystal', width: 50, height: 60 },
    stairs: { file: 'item-11.jpg', label: 'Gear', width: 50, height: 40 },
    door: { file: 'bg-8.jpg', label: 'Tunnel', width: 80, height: 120 },
    chest: { file: 'item-13.jpg', label: 'Backpack', width: 60, height: 50 },
    scroll: { file: 'item-6.jpg', label: 'Fossil', width: 50, height: 40 },
    portal: { file: 'bg-14.jpg', label: 'Earth Core', width: 100, height: 130 },
    torch: { file: 'item-1.jpg', label: 'Torch', width: 35, height: 55 },
    sword: { file: 'item-0.jpg', label: 'Pickaxe', width: 55, height: 30 },
    shield: { file: 'item-13.jpg', label: 'Backpack', width: 55, height: 55 },
    potion: { file: 'item-10.jpg', label: 'Flask', width: 30, height: 40 },
    book: { file: 'item-9.jpg', label: 'Tablet', width: 45, height: 55 },
    star: { file: 'item-5.jpg', label: 'Gem', width: 30, height: 30 },
    moon: { file: 'bg-6.jpg', label: 'Lake', width: 60, height: 40 },
    sun: { file: 'bg-7.jpg', label: 'Geode', width: 55, height: 55 },
    mountain: { file: 'bg-9.jpg', label: 'Chasm', width: 100, height: 80 },
    tree: { file: 'char-7.jpg', label: 'Golem', width: 70, height: 100 },
    plant: { file: 'item-7.jpg', label: 'Glowing Mushroom', width: 40, height: 60 },
  },
  // Other themes will be filled as images are generated
};

// Default fallback for themes without full element maps
function getDefaultElementMap(): Record<string, ElementImage> {
  return {
    player: { file: 'char-0.jpg', label: 'Player', width: 100, height: 150 },
    companion: { file: 'char-1.jpg', label: 'Companion', width: 90, height: 140 },
    enemy: { file: 'char-2.jpg', label: 'Enemy', width: 120, height: 160 },
    animal: { file: 'char-3.jpg', label: 'Creature', width: 100, height: 80 },
    treasure: { file: 'item-0.jpg', label: 'Treasure', width: 50, height: 50 },
    weapon: { file: 'item-1.jpg', label: 'Weapon', width: 55, height: 30 },
    plant: { file: 'item-2.jpg', label: 'Plant', width: 40, height: 60 },
    tool: { file: 'item-3.jpg', label: 'Tool', width: 50, height: 40 },
    key: { file: 'item-4.jpg', label: 'Key', width: 40, height: 40 },
    map: { file: 'item-5.jpg', label: 'Map', width: 60, height: 50 },
    fire: { file: 'item-6.jpg', label: 'Fire', width: 40, height: 60 },
    water: { file: 'item-7.jpg', label: 'Water', width: 35, height: 45 },
    stone: { file: 'item-8.jpg', label: 'Stone', width: 45, height: 45 },
    crystal: { file: 'item-9.jpg', label: 'Crystal', width: 50, height: 60 },
    torch: { file: 'item-6.jpg', label: 'Torch', width: 35, height: 55 },
    door: { file: 'bg-0.jpg', label: 'Door', width: 70, height: 110 },
    chest: { file: 'item-10.jpg', label: 'Chest', width: 55, height: 45 },
    scroll: { file: 'item-11.jpg', label: 'Scroll', width: 50, height: 40 },
    portal: { file: 'bg-0.jpg', label: 'Portal', width: 90, height: 120 },
    book: { file: 'item-12.jpg', label: 'Book', width: 45, height: 55 },
  };
}

// ─── Public API ──────────────────────────────────────────────────

const CDN = 'https://pics.dellyqiao.com/aigames';

/** Get background image URL for a theme + bgKey */
export function getBackgroundUrl(themeSlug: string, bgKey: string): string {
  const map = THEME_BG[themeSlug];
  const bgIdx = map?.[bgKey] || 'bg-0';
  return `${CDN}/${themeSlug}/${bgIdx}.jpg`;
}

/** Get element (character/item) image info */
export function getElementImage(
  themeSlug: string,
  elementType: string
): { url: string; label: string; width: number; height: number } | null {
  const themeMap = THEME_ELEMENTS[themeSlug] || getDefaultElementMap();
  const info = themeMap[elementType];
  if (!info) return null;
  return {
    url: `${CDN}/${themeSlug}/${info.file}`,
    label: info.label,
    width: info.width || 60,
    height: info.height || 60,
  };
}

/** Canvas positions for element display */
export function getElementPosition(
  elementType: string,
  index: number
): { x: number; y: number } {
  // Position character images at different spots on the canvas
  const positions: Record<string, { x: number; y: number }> = {
    player: { x: 80, y: 240 },
    companion: { x: 200, y: 250 },
    enemy: { x: 480, y: 220 },
    animal: { x: 350, y: 320 },
  };

  const base = positions[elementType];
  if (base) return base;

  // Auto-position by index
  const cols = 4;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return { x: 80 + col * 130, y: 280 + row * 80 };
}

/** Check if a theme has center-earth style images (full set) */
export function hasFullImageSet(themeSlug: string): boolean {
  return themeSlug === 'center-earth'; // others coming
}
