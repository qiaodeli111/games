/**
 * Image registry: 45 images per theme with descriptions.
 * Used by AI to select the single best image for each scene.
 */

export interface ImageEntry {
  file: string;       // e.g. "bg-3.jpg" or "char-5.jpg"
  type: 'scene' | 'character' | 'item';
  description: string; // What the image depicts
  keywords: string[];  // Tags for matching (locations, people, objects, moods)
}

type ThemeRegistry = Record<string, ImageEntry[]>;

export const imageRegistry: ThemeRegistry = {
  'center-earth': [
    // ── 15 Backgrounds (scene) ──
    { file: 'bg-0.jpg', type: 'scene', description: 'Volcanic cave entrance with steam rising from cracks', keywords: ['cave', 'entrance', 'volcanic', 'steam', 'rock'] },
    { file: 'bg-1.jpg', type: 'scene', description: 'Massive underground cavern with underground river and stalactites', keywords: ['cavern', 'underground', 'river', 'stalactite', 'water'] },
    { file: 'bg-2.jpg', type: 'scene', description: 'Underground prehistoric jungle with giant mushrooms and mist', keywords: ['jungle', 'prehistoric', 'mushroom', 'mist', 'plant'] },
    { file: 'bg-3.jpg', type: 'scene', description: 'Crystal cavern with giant purple amethyst crystals glowing', keywords: ['crystal', 'cavern', 'purple', 'glowing', 'amethyst'] },
    { file: 'bg-4.jpg', type: 'scene', description: 'Magma chamber with flowing lava rivers and intense orange glow', keywords: ['magma', 'lava', 'volcano', 'fire', 'heat'] },
    { file: 'bg-5.jpg', type: 'scene', description: 'Deep fossil cave with ancient bones embedded in walls', keywords: ['fossil', 'bone', 'ancient', 'cave', 'dim'] },
    { file: 'bg-6.jpg', type: 'scene', description: 'Subterranean lake with still dark water and glowing crystals on ceiling', keywords: ['lake', 'water', 'subterranean', 'glowing', 'reflection'] },
    { file: 'bg-7.jpg', type: 'scene', description: 'Giant geode chamber with rainbow crystals lining every surface', keywords: ['geode', 'crystal', 'rainbow', 'sparkling', 'chamber'] },
    { file: 'bg-8.jpg', type: 'scene', description: 'Narrow tunnel with ancient carved steps descending into darkness', keywords: ['tunnel', 'steps', 'descending', 'narrow', 'stair'] },
    { file: 'bg-9.jpg', type: 'scene', description: 'Massive underground chasm with stone bridge over endless darkness', keywords: ['chasm', 'bridge', 'darkness', 'abyss', 'stone'] },
    { file: 'bg-10.jpg', type: 'scene', description: 'Fungal forest with giant glowing mushrooms in all colors', keywords: ['fungus', 'mushroom', 'glowing', 'forest', 'colorful'] },
    { file: 'bg-11.jpg', type: 'scene', description: 'Ancient underground ruins with fallen columns and mysterious glyphs', keywords: ['ruins', 'ancient', 'columns', 'glyph', 'stone'] },
    { file: 'bg-12.jpg', type: 'scene', description: 'Lava tube cave with smooth curved walls and dim red glow', keywords: ['lava', 'tube', 'cave', 'smooth', 'red'] },
    { file: 'bg-13.jpg', type: 'scene', description: 'Underground waterfall cascading into crystal clear pool with rainbow', keywords: ['waterfall', 'pool', 'crystal', 'rainbow', 'water'] },
    { file: 'bg-14.jpg', type: 'scene', description: 'The Earth core chamber with swirling molten rock and floating crystal islands', keywords: ['core', 'earth', 'molten', 'floating', 'final'] },

    // ── 15 Characters ──
    { file: 'char-0.jpg', type: 'character', description: 'Brave explorer with leather jacket, backpack, holding a pickaxe', keywords: ['explorer', 'player', 'hero', 'adventurer', 'person'] },
    { file: 'char-1.jpg', type: 'character', description: 'Wise old guide with white beard, staff, mining helmet', keywords: ['guide', 'old', 'wise', 'mentor', 'person'] },
    { file: 'char-2.jpg', type: 'character', description: 'Giant cave troll with rocky skin and massive fists', keywords: ['troll', 'monster', 'giant', 'enemy', 'creature'] },
    { file: 'char-3.jpg', type: 'character', description: 'Giant underground snake with glowing scales coiled to strike', keywords: ['snake', 'serpent', 'reptile', 'danger', 'creature'] },
    { file: 'char-4.jpg', type: 'character', description: 'Pterodactyl flying in cavern with wide wingspan', keywords: ['pterodactyl', 'dinosaur', 'flying', 'wing', 'creature'] },
    { file: 'char-5.jpg', type: 'character', description: 'Giant ant with mandibles and chitinous armor', keywords: ['ant', 'insect', 'bug', 'giant', 'creature'] },
    { file: 'char-6.jpg', type: 'character', description: 'Crystal golem made of purple gems, glowing joints', keywords: ['golem', 'crystal', 'elemental', 'guardian', 'creature'] },
    { file: 'char-7.jpg', type: 'character', description: 'Lava elemental with fiery body and molten rock limbs', keywords: ['elemental', 'fire', 'lava', 'demon', 'creature'] },
    { file: 'char-8.jpg', type: 'character', description: 'Dwarf miner with pickaxe, hard hat, covered in soot', keywords: ['dwarf', 'miner', 'person', 'worker'] },
    { file: 'char-9.jpg', type: 'character', description: 'Giant subterranean centipede with many legs and glowing eyes', keywords: ['centipede', 'bug', 'many legs', 'glowing', 'creature'] },
    { file: 'char-10.jpg', type: 'character', description: 'Raptor-like dinosaur in underground jungle hunting stance', keywords: ['dinosaur', 'raptor', 'predator', 'hunting', 'creature'] },
    { file: 'char-11.jpg', type: 'character', description: 'Glow worm swarm forming shapes in darkness', keywords: ['worm', 'glow', 'swarm', 'light', 'creature'] },
    { file: 'char-12.jpg', type: 'character', description: 'Ancient spirit made of mist and light floating ethereally', keywords: ['spirit', 'ghost', 'mist', 'ethereal', 'supernatural'] },
    { file: 'char-13.jpg', type: 'character', description: 'Giant bat with leathery wings hanging upside down', keywords: ['bat', 'flying', 'cave', 'mammal', 'creature'] },
    { file: 'char-14.jpg', type: 'character', description: 'Prehistoric fish with armored scales swimming in underground lake', keywords: ['fish', 'prehistoric', 'armored', 'water', 'creature'] },

    // ── 15 Items ──
    { file: 'item-0.jpg', type: 'item', description: 'Iron pickaxe with wooden handle, well-used mining tool', keywords: ['pickaxe', 'tool', 'mining', 'weapon'] },
    { file: 'item-1.jpg', type: 'item', description: 'Burning torch with orange flame lighting the dark', keywords: ['torch', 'fire', 'light', 'fire'] },
    { file: 'item-2.jpg', type: 'item', description: 'Coiled rope with hook for climbing', keywords: ['rope', 'climbing', 'equipment', 'tool'] },
    { file: 'item-3.jpg', type: 'item', description: 'Brass compass with glowing needle for navigation', keywords: ['compass', 'navigation', 'direction', 'tool'] },
    { file: 'item-4.jpg', type: 'item', description: 'Old parchment treasure map with marked paths', keywords: ['map', 'treasure', 'parchment', 'paper'] },
    { file: 'item-5.jpg', type: 'item', description: 'Glowing purple crystal gem cut into shape, sparkling', keywords: ['crystal', 'gem', 'treasure', 'glowing', 'jewel'] },
    { file: 'item-6.jpg', type: 'item', description: 'Ancient fossil embedded in rock, spiral shell shape', keywords: ['fossil', 'shell', 'ancient', 'rock'] },
    { file: 'item-7.jpg', type: 'item', description: 'Giant glowing mushroom with blue bioluminescence', keywords: ['mushroom', 'glowing', 'plant', 'fungus'] },
    { file: 'item-8.jpg', type: 'item', description: 'Lava rock with glowing orange veins still hot and smoking', keywords: ['rock', 'lava', 'hot', 'volcanic', 'stone'] },
    { file: 'item-9.jpg', type: 'item', description: 'Ancient stone tablet with carved runes and symbols', keywords: ['tablet', 'rune', 'ancient', 'writing', 'stone'] },
    { file: 'item-10.jpg', type: 'item', description: 'Metal water flask with leather strap for travel', keywords: ['flask', 'water', 'container', 'equipment'] },
    { file: 'item-11.jpg', type: 'item', description: 'Climbing gear with carabiners and harness', keywords: ['gear', 'climbing', 'equipment', 'safety'] },
    { file: 'item-12.jpg', type: 'item', description: 'Oil lantern with glass shield and yellow flame', keywords: ['lantern', 'light', 'lamp', 'glass'] },
    { file: 'item-13.jpg', type: 'item', description: 'Leather backpack with straps and buckles', keywords: ['backpack', 'bag', 'storage', 'equipment'] },
    { file: 'item-14.jpg', type: 'item', description: 'Ancient key with ornate head, rusted and mysterious', keywords: ['key', 'ancient', 'rusted', 'door', 'mystery'] },
  ],

  // ── SPACE ──
  'space': [
    { file: 'bg-0.jpg', type: 'scene', description: 'High-tech starship bridge with holographic displays and starfield view', keywords: ['starship', 'bridge', 'holographic', 'space', 'ship'] },
    { file: 'bg-1.jpg', type: 'scene', description: 'Alien planet surface with strange rocks and two moons in sky', keywords: ['planet', 'alien', 'surface', 'moon', 'sky'] },
    { file: 'bg-2.jpg', type: 'scene', description: 'Colorful nebula with swirling cosmic gases and distant stars', keywords: ['nebula', 'cosmic', 'space', 'stars', 'colorful'] },
    { file: 'bg-3.jpg', type: 'scene', description: 'Alien world with bioluminescent forests and crystal mountains', keywords: ['alien', 'world', 'bioluminescent', 'forest', 'mountain'] },
    { file: 'bg-4.jpg', type: 'scene', description: 'Dense asteroid field with drifting rocks and stars', keywords: ['asteroid', 'field', 'rocks', 'space', 'debris'] },
    { file: 'bg-5.jpg', type: 'scene', description: 'Space station interior with long metal corridors', keywords: ['station', 'interior', 'corridor', 'metal', 'sci-fi'] },
    { file: 'bg-6.jpg', type: 'scene', description: 'Starship cockpit with instrument panels and navigation screens', keywords: ['cockpit', 'pilot', 'controls', 'navigation', 'ship'] },
    { file: 'bg-7.jpg', type: 'scene', description: 'Barren moon surface with craters and Earth-like planet in sky', keywords: ['moon', 'surface', 'crater', 'planet', 'sky'] },
    { file: 'bg-8.jpg', type: 'scene', description: 'Swirling wormhole with blue and purple energy rings', keywords: ['wormhole', 'portal', 'energy', 'vortex', 'space'] },
    { file: 'bg-9.jpg', type: 'scene', description: 'Distant spiral galaxy with bright core and cosmic dust', keywords: ['galaxy', 'spiral', 'stars', 'cosmic', 'distant'] },
    { file: 'bg-10.jpg', type: 'scene', description: 'Starship hangar bay with docked ships and technicians', keywords: ['hangar', 'ships', 'dock', 'bay', 'mechanical'] },
    { file: 'bg-11.jpg', type: 'scene', description: 'Space debris field with broken satellite parts floating', keywords: ['debris', 'satellite', 'wreckage', 'space', 'ruins'] },
    { file: 'bg-12.jpg', type: 'scene', description: 'Alien atmosphere entry with fire and plasma around ship', keywords: ['atmosphere', 'entry', 'fire', 'plasma', 'descent'] },
    { file: 'bg-13.jpg', type: 'scene', description: 'Alien ocean world with water geysers and strange islands', keywords: ['ocean', 'water', 'alien', 'island', 'planet'] },
    { file: 'bg-14.jpg', type: 'scene', description: 'Space station in orbit above ringed planet', keywords: ['orbit', 'station', 'planet', 'ring', 'space'] },
    { file: 'char-0.jpg', type: 'character', description: 'Brave astronaut in advanced space suit with reflective visor', keywords: ['astronaut', 'space suit', 'hero', 'explorer', 'person'] },
    { file: 'char-1.jpg', type: 'character', description: 'Friendly green alien with large black eyes', keywords: ['alien', 'friendly', 'green', 'extraterrestrial'] },
    { file: 'char-2.jpg', type: 'character', description: 'Menacing space pirate with cybernetic eye and laser pistol', keywords: ['pirate', 'space', 'villain', 'cybernetic', 'enemy'] },
    { file: 'char-3.jpg', type: 'character', description: 'Robotic space dog with metal plates and blue glowing eyes', keywords: ['robot', 'dog', 'mechanical', 'companion', 'machine'] },
    { file: 'char-4.jpg', type: 'character', description: 'Giant space creature with translucent body and tentacles', keywords: ['creature', 'giant', 'space', 'tentacle', 'alien'] },
    { file: 'char-5.jpg', type: 'character', description: 'Mad scientist with holographic display and wild hair', keywords: ['scientist', 'mad', 'hologram', 'inventor', 'person'] },
    { file: 'char-6.jpg', type: 'character', description: 'Ancient alien with crystalline skin and wise eyes', keywords: ['ancient', 'alien', 'wise', 'crystal', 'elder'] },
    { file: 'char-7.jpg', type: 'character', description: 'Space mercenary in combat armor with heavy weapons', keywords: ['mercenary', 'warrior', 'armor', 'combat', 'soldier'] },
    { file: 'char-8.jpg', type: 'character', description: 'Holographic AI assistant in translucent blue form', keywords: ['AI', 'hologram', 'assistant', 'digital', 'intelligence'] },
    { file: 'char-9.jpg', type: 'character', description: 'Giant space worm emerging from asteroid with armored segments', keywords: ['worm', 'giant', 'asteroid', 'monster', 'creature'] },
    { file: 'char-10.jpg', type: 'character', description: 'Colonist in casual space suit with hopeful expression', keywords: ['colonist', 'settler', 'civilian', 'person'] },
    { file: 'char-11.jpg', type: 'character', description: 'Alien queen with crown-like head crest and royal robes', keywords: ['queen', 'alien', 'royal', 'ruler', 'leader'] },
    { file: 'char-12.jpg', type: 'character', description: 'Android with exposed synthetic skin and red LED eye', keywords: ['android', 'robot', 'cyborg', 'artificial', 'machine'] },
    { file: 'char-13.jpg', type: 'character', description: 'Space nomad with worn cloak and mysterious mask', keywords: ['nomad', 'wanderer', 'cloak', 'mask', 'mysterious'] },
    { file: 'char-14.jpg', type: 'character', description: 'Giant floating jellyfish-like alien with translucent bell', keywords: ['jellyfish', 'floating', 'translucent', 'space', 'creature'] },
    { file: 'item-0.jpg', type: 'item', description: 'Glowing star-shaped crystal gem with blue energy', keywords: ['crystal', 'gem', 'star', 'energy', 'artifact'] },
    { file: 'item-1.jpg', type: 'item', description: 'Sci-fi laser pistol with sleek design and glowing core', keywords: ['laser', 'pistol', 'gun', 'weapon', 'sci-fi'] },
    { file: 'item-2.jpg', type: 'item', description: 'Handheld scanner device with holographic display', keywords: ['scanner', 'device', 'hologram', 'tool', 'tech'] },
    { file: 'item-3.jpg', type: 'item', description: 'Magnetic keycard with holographic strip for access', keywords: ['keycard', 'access', 'card', 'magnetic', 'security'] },
    { file: 'item-4.jpg', type: 'item', description: 'Holographic star map showing navigation data', keywords: ['map', 'star', 'navigation', 'hologram', 'space'] },
    { file: 'item-5.jpg', type: 'item', description: 'Alien plant in glass terrarium with glowing leaves', keywords: ['plant', 'alien', 'terrarium', 'glowing', 'flora'] },
    { file: 'item-6.jpg', type: 'item', description: 'Data chip with golden contacts for information storage', keywords: ['chip', 'data', 'storage', 'digital', 'tech'] },
    { file: 'item-7.jpg', type: 'item', description: 'Energy shield generator as metallic disc with blue field', keywords: ['shield', 'energy', 'protection', 'device', 'force field'] },
    { file: 'item-8.jpg', type: 'item', description: 'Alien artifact with unknown symbols and stone material', keywords: ['artifact', 'ancient', 'alien', 'symbol', 'mystery'] },
    { file: 'item-9.jpg', type: 'item', description: 'Health pack with red cross for medical treatment', keywords: ['health', 'medical', 'pack', 'heal', 'aid'] },
    { file: 'item-10.jpg', type: 'item', description: 'Jetpack with thrusters for flying in zero gravity', keywords: ['jetpack', 'fly', 'thruster', 'equipment', 'space'] },
    { file: 'item-11.jpg', type: 'item', description: 'Communication device with antenna for space radio', keywords: ['radio', 'communication', 'antenna', 'device', 'talk'] },
    { file: 'item-12.jpg', type: 'item', description: 'Oxygen tank with pressure gauge for life support', keywords: ['oxygen', 'tank', 'breathing', 'life support', 'equipment'] },
    { file: 'item-13.jpg', type: 'item', description: 'Space suit helmet with gold visor reflecting light', keywords: ['helmet', 'visor', 'space suit', 'head', 'protection'] },
    { file: 'item-14.jpg', type: 'item', description: 'Ancient scroll with alien writing and floating text', keywords: ['scroll', 'ancient', 'writing', 'alien', 'knowledge'] },
  ],
};

export function getImageForScene(themeSlug: string, sceneText: string, elements: string[]): ImageEntry | null {
  const registry = imageRegistry[themeSlug];
  if (!registry || registry.length === 0) return null;

  // Score each image by keyword matching
  const textLower = sceneText.toLowerCase();
  const allKeywords = [...elements.map(e => e.toLowerCase())];

  let best: ImageEntry | null = null;
  let bestScore = -1;

  for (const entry of registry) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (textLower.includes(kw)) score += 2;
      if (allKeywords.includes(kw)) score += 5;
    }
    // Boost character images if elements mention the matching character
    if (entry.type === 'character') {
      for (const el of allKeywords) {
        if (entry.keywords.includes(el)) score += 10;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best;
}

/** Get the literary style references for a theme */
export function getLiteraryStyles(themeSlug: string): { name: string; author: string; description: string }[] {
  const styles: Record<string, { name: string; author: string; description: string }[]> = {
    'center-earth': [
      { name: 'Journey to the Center of the Earth', author: 'Jules Verne', description: 'Scientific wonder, detailed geological descriptions, French adventure novel style' },
      { name: 'The Descent', author: 'Jeff Long', description: 'Dark, primal horror beneath the Earth, survival against ancient evils' },
      { name: 'At the Mountains of Madness', author: 'H.P. Lovecraft', description: 'Eldritch dread, ancient alien architecture, cosmic horror beneath the ice' },
    ],
    'space': [
      { name: 'The Three-Body Problem', author: 'Liu Cixin', description: 'Hard sci-fi, grand cosmic scale, physics concepts woven into narrative' },
      { name: 'The Wandering Earth', author: 'Liu Cixin', description: 'Humanity facing extinction, bold engineering solutions, emotional and epic' },
      { name: '2001: A Space Odyssey', author: 'Arthur C. Clarke', description: 'Mysterious monoliths, evolution of consciousness, silent vastness of space' },
      { name: 'Dune', author: 'Frank Herbert', description: 'Political intrigue, desert planets, spice, mysticism and ecology' },
    ],
    'haunted-village': [
      { name: 'The Legend of Sleepy Hollow', author: 'Washington Irving', description: 'Folklore horror, headless horseman, misty rural atmosphere, dark fairy tale' },
      { name: 'The Turn of the Screw', author: 'Henry James', description: 'Psychological horror, ambiguous ghosts, creeping dread, unreliable narrator' },
      { name: 'Mexican Gothic', author: 'Silvia Moreno-Garcia', description: 'Decaying mansion, fungal horror, family secrets, gothic atmosphere' },
    ],
    'wild-west': [
      { name: 'Winnetou', author: 'Karl May', description: 'Noble Apache chief, friendship across cultures, adventure in the frontier' },
      { name: 'True Grit', author: 'Charles Portis', description: 'Gritty revenge, strong-willed protagonist, harsh frontier justice' },
      { name: 'Blood Meridian', author: 'Cormac McCarthy', description: 'Bleak, violent, philosophical western, stunning landscape descriptions' },
    ],
    'deep-sea': [
      { name: 'Twenty Thousand Leagues Under the Sea', author: 'Jules Verne', description: 'Underwater exploration, mysterious captain, marine biology wonders' },
      { name: 'Sphere', author: 'Michael Crichton', description: 'Underwater alien artifact, psychological thriller, hard sci-fi' },
      { name: 'The Deep', author: 'Rivers Solomon', description: 'Deep sea society, memory and trauma, unique aquatic world-building' },
    ],
    'tomb-raiding': [
      { name: 'The Tomb', author: 'F. Paul Wilson', description: 'Ancient secrets, hidden chambers, occult horror, family legacy' },
      { name: 'The Lost World', author: 'Arthur Conan Doyle', description: 'Daring expedition, discovery of prehistoric world, adventure and science' },
      { name: 'King Solomon\'s Mines', author: 'H. Rider Haggard', description: 'African adventure, hidden treasure, ancient kingdoms, perilous journey' },
    ],
    'apocalypse': [
      { name: 'The Road', author: 'Cormac McCarthy', description: 'Bleak survival, father and son, sparse prose, emotional devastation' },
      { name: 'World War Z', author: 'Max Brooks', description: 'Global pandemic, oral history format, geopolitical collapse' },
      { name: 'I Am Legend', author: 'Richard Matheson', description: 'Last man on Earth, vampire plague, isolation, scientific survival' },
    ],
    'magic-academy': [
      { name: 'Harry Potter', author: 'J.K. Rowling', description: 'Boarding school with magic, chosen one, friendship and courage' },
      { name: 'The Name of the Wind', author: 'Patrick Rothfuss', description: 'Lyrical prose, arcane magic system, university setting, framed narrative' },
      { name: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', description: 'Balance and shadow, wizards school, Taoist philosophy, sea voyage' },
    ],
    'cyberpunk': [
      { name: 'Neuromancer', author: 'William Gibson', description: 'Cyberspace, AI, street samurai, noir atmosphere, bleak future' },
      { name: 'Snow Crash', author: 'Neal Stephenson', description: 'Metaverse, virus, fast-paced, corporate power, ancient Sumerian mystery' },
      { name: 'Do Androids Dream of Electric Sheep?', author: 'Philip K. Dick', description: 'What is human? Empathy, androids, post-apocalyptic decay, identity crisis' },
    ],
    'lost-civilization': [
      { name: 'The Lost World', author: 'Arthur Conan Doyle', description: 'Plateau with dinosaurs, scientific expedition, adventure and discovery' },
      { name: 'The Jungle Book', author: 'Rudyard Kipling', description: 'Nature and civilization, wild boy, animal wisdom, colonialism' },
      { name: 'Heart of Darkness', author: 'Joseph Conrad', description: 'Journey upriver, colonial brutality, madness in the jungle, darkness within' },
    ],
  };

  return styles[themeSlug] || styles['center-earth'];
}
