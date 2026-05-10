/**
 * Fallback story generator that works without the Deepseek API.
 * Provides preset stories for each theme so the game is playable offline.
 */

import type { StoryScene, StoryChoice, StoryEnding } from '../types/adventure';

interface ThemeStory {
  title: string;
  scenes: PresetScene[];
  endings: StoryEnding[];
}

interface PresetScene {
  story: string;
  translation: string;
  choices: Array<{ text: string; translation: string; flavor: StoryChoice['flavor'] }>;
  elements: string[];
  background: string;
}

function getChoices(themeId: string, sceneIndex: number): PresetScene['choices'] {
  const choices: Record<string, PresetScene['choices'][]> = {
    'center-earth': [
      [
        { text: 'Descend carefully into the dark tunnel ahead', translation: '小心地进入前方黑暗的隧道', flavor: 'moderate-positive' },
        { text: 'Light a torch and examine the cave walls', translation: '点燃火把检查洞穴墙壁', flavor: 'neutral' },
        { text: 'Rush forward recklessly, eager to explore', translation: '鲁莽地向前冲，急于探索', flavor: 'extreme-negative' },
      ],
      [
        { text: 'Follow the underground river', translation: '沿着地下河前进', flavor: 'moderate-positive' },
        { text: 'Climb the rocky ridge for a better view', translation: '爬上岩石山脊观察', flavor: 'neutral' },
        { text: 'Ignore the path and carve your own way', translation: '无视道路，自己开路', flavor: 'extreme-positive' },
      ],
      [
        { text: 'Approach the mysterious glow cautiously', translation: '谨慎地接近神秘的光芒', flavor: 'moderate-positive' },
        { text: 'Call out to see if anyone responds', translation: '呼喊看看是否有回应', flavor: 'neutral' },
        { text: 'Throw a rock towards the glow', translation: '向光芒处扔一块石头', flavor: 'extreme-negative' },
      ],
    ],
    'space': [
      [
        { text: 'Scan the planet surface for life signs', translation: '扫描行星表面寻找生命迹象', flavor: 'moderate-positive' },
        { text: 'Send a probe to investigate', translation: '发送探测器进行调查', flavor: 'neutral' },
        { text: 'Land immediately without scanning', translation: '不扫描直接降落', flavor: 'extreme-negative' },
      ],
      [
        { text: 'Communicate with the alien beings peacefully', translation: '和平地与外星生物交流', flavor: 'extreme-positive' },
        { text: 'Observe from a distance first', translation: '先远距离观察', flavor: 'neutral' },
        { text: 'Activate weapons as a precaution', translation: '启动武器作为预防', flavor: 'moderate-negative' },
      ],
      [
        { text: 'Collect samples of the alien flora', translation: '收集外星植物样本', flavor: 'moderate-positive' },
        { text: 'Document everything with your scanner', translation: '用扫描仪记录一切', flavor: 'neutral' },
        { text: 'Take as much as you can carry', translation: '能拿多少拿多少', flavor: 'extreme-negative' },
      ],
    ],
    'haunted-village': [
      [
        { text: 'Enter the abandoned church carefully', translation: '小心地进入废弃教堂', flavor: 'moderate-positive' },
        { text: 'Examine the old village records', translation: '检查旧村庄记录', flavor: 'neutral' },
        { text: 'Shout to challenge whatever is lurking', translation: '大声叫喊挑战潜伏之物', flavor: 'extreme-negative' },
      ],
      [
        { text: 'Light a candle and recite a protection prayer', translation: '点燃蜡烛念诵保护祈祷', flavor: 'extreme-positive' },
        { text: 'Follow the strange whispers', translation: '跟随奇怪的低语声', flavor: 'moderate-negative' },
        { text: 'Run back the way you came', translation: '沿原路跑回去', flavor: 'extreme-negative' },
      ],
      [
        { text: 'Investigate the ghostly figure peacefully', translation: '平静地调查鬼影', flavor: 'moderate-positive' },
        { text: 'Hide and watch what happens', translation: '躲起来观察', flavor: 'neutral' },
        { text: 'Throw a rock at the apparition', translation: '向鬼影扔石头', flavor: 'extreme-negative' },
      ],
    ],
  };

  const themeChoices = choices[themeId];
  if (!themeChoices || !themeChoices[sceneIndex]) {
    return [
      { text: 'Continue forward cautiously', translation: '谨慎地继续前进', flavor: 'moderate-positive' },
      { text: 'Examine your surroundings carefully', translation: '仔细观察周围环境', flavor: 'neutral' },
      { text: 'Take a bold risk', translation: '冒一次大胆的风险', flavor: 'extreme-positive' },
    ];
  }
  return themeChoices[sceneIndex];
}

const STORIES: Record<string, { scenes: PresetScene[]; endings: StoryEnding[] }> = {
  'center-earth': {
    scenes: [
      {
        story: 'You stand at the mouth of a vast volcanic cave. Hot steam rises from cracks in the ground, and the distant sound of dripping water echoes through the darkness. Your torch flickers, casting dancing shadows on the ancient rock walls. Somewhere deep below, the heart of the Earth awaits.',
        translation: '你站在一个巨大火山洞的入口。热蒸汽从地面的裂缝中升起，远处滴水的声音在黑暗中回荡。你的火把闪烁着，在古老的岩壁上投下舞动的影子。在深处的某个地方，地心在等待着你。',
        choices: [],
        elements: ['player', 'torch', 'stone', 'fire'],
        background: 'cave',
      },
      {
        story: 'Descending deeper, you discover a massive underground cavern lit by bioluminescent crystals. A underground river cuts through the rock, and strange fungi grow along its banks. The air is warm and humid, filled with the scent of minerals and life.',
        translation: '向深处下行，你发现了一个巨大的地下洞穴，被生物发光的水晶照亮。一条地下河穿过岩石，奇怪的真菌沿着河岸生长。空气温暖潮湿，充满了矿物质和生命的气息。',
        choices: [],
        elements: ['player', 'torch', 'crystal', 'water', 'plant'],
        background: 'cavern',
      },
      {
        story: 'Beyond the cavern lies a prehistoric jungle thriving in the geothermal warmth. Giant mushrooms tower overhead, and distant roars echo through the mist. An ancient stone structure, covered in moss, stands at the center of this underground world.',
        translation: '洞穴之外是一片史前丛林，在地热的温暖中蓬勃生长。巨大的蘑菇高耸入云，远处的咆哮声在雾气中回荡。一座覆盖着苔藓的古老石结构矗立在这个地下世界的中心。',
        choices: [],
        elements: ['player', 'plant', 'stone', 'animal', 'treasure'],
        background: 'jungle',
      },
    ],
    endings: [
      { id: 0, title: 'Heart of the World', titleCn: '世界之心', description: 'You reach the Earth\'s core and discover a hidden civilization living in harmony with the planet\'s energy.', descriptionCn: '你到达了地心，发现了一个与地球能量和谐共存的隐藏文明。', type: 0 },
      { id: 1, title: 'Trapped Below', titleCn: '困于地底', description: 'The tunnel collapses behind you, forcing you to find a new way home through unknown depths.', descriptionCn: '隧道在你身后坍塌，迫使你通过未知的深处寻找回家的新路。', type: 1 },
      { id: 2, title: 'Crystal King', titleCn: '水晶之王', description: 'You discover a chamber of pure crystal that grants you the power to shape stone at will.', descriptionCn: '你发现了一个纯水晶的密室，赋予你随意塑造岩石的力量。', type: 2 },
      { id: 3, title: 'Prehistoric Escape', titleCn: '史前逃亡', description: 'Chased by ancient creatures, you barely escape through an underwater cave system.', descriptionCn: '在被远古生物追赶下，你勉强通过一个水下洞穴系统逃出。', type: 3 },
      { id: 4, title: 'Magma\'s Blessing', titleCn: '岩浆的祝福', description: 'You befriend the fire spirits of the deep and gain their protection.', descriptionCn: '你与深处的火灵成为朋友，并获得他们的保护。', type: 4 },
      { id: 5, title: 'The Great Library', titleCn: '大图书馆', description: 'You find an underground library preserving the knowledge of ancient surface civilizations.', descriptionCn: '你发现了一个保存着古代地表文明知识的地下图书馆。', type: 5 },
      { id: 6, title: 'Fossilized', titleCn: '化为化石', description: 'Your journey ends in a tar pit, preserved for future explorers to discover.', descriptionCn: '你的旅程在一个焦油坑中结束，为未来的探险者保存着。', type: 6 },
      { id: 7, title: 'Volcanic Exit', titleCn: '火山出口', description: 'You emerge through an active volcano, your skin hardened by its heat.', descriptionCn: '你通过一个活火山冲出，皮肤被其热量硬化。', type: 7 },
      { id: 8, title: 'Underground Ocean', titleCn: '地下海洋', description: 'You discover a vast underground ocean with its own unique ecosystem.', descriptionCn: '你发现了一个广阔的、拥有独特生态系统的地下海洋。', type: 8 },
      { id: 9, title: 'The Return', titleCn: '归来', description: 'You find your way back to the surface, forever changed by what you witnessed below.', descriptionCn: '你找到了返回地面的路，被地下的所见所闻永远改变。', type: 9 },
    ],
  },
  'space': {
    scenes: [
      {
        story: 'Your starship emerges from hyperspace above an uncharted planet. Swirling purple and blue gases dance in the atmosphere below. Your sensors pick up strange energy readings from the surface — something artificial, something ancient.',
        translation: '你的星际飞船在一颗未知行星上空脱离超空间。紫色和蓝色的旋转气体在下方的大气中舞动。传感器从地表探测到奇怪的能量读数——某种人造的、古老的东西。',
        choices: [],
        elements: ['player', 'star', 'tool', 'ship'],
        background: 'planet',
      },
      {
        story: 'You descend through thick clouds and witness a breathtaking alien landscape. Bioluminescent forests stretch to the horizon, and crystalline mountains reflect the light of twin moons. In the distance, a towering structure gleams with an inner light.',
        translation: '你穿过厚厚的云层下降，目睹了令人惊叹的外星景观。生物发光的森林延伸到地平线，水晶山脉反射着双月的光。远处，一座高耸的建筑闪烁着内在的光芒。',
        choices: [],
        elements: ['player', 'crystal', 'plant', 'moon', 'mountain'],
        background: 'alien',
      },
      {
        story: 'The alien structure is a massive crystalline temple, pulsing with energy. Symbols etched into its surface seem to shift and change as you approach. A doorway shaped like a star beckons you inside.',
        translation: '外星建筑是一座巨大的水晶寺庙，脉动着能量。雕刻在表面的符号在你接近时似乎在移动和变化。一个星形的大门召唤你进入。',
        choices: [],
        elements: ['player', 'crystal', 'door', 'star', 'portal'],
        background: 'temple',
      },
    ],
    endings: [
      { id: 0, title: 'Galactic Ambassador', titleCn: '银河大使', description: 'You establish peaceful contact with an advanced alien civilization.', descriptionCn: '你与一个先进的外星文明建立了和平接触。', type: 0 },
      { id: 1, title: 'Lost in Space', titleCn: '迷失太空', description: 'Your ship is damaged, drifting through the cosmos with limited supplies.', descriptionCn: '你的飞船受损，在有限的补给下漂流在宇宙中。', type: 1 },
      { id: 2, title: ' Cosmic Revelation', titleCn: '宇宙启示', description: 'The aliens share the secret of faster-than-light travel with all of humanity.', descriptionCn: '外星人与全人类分享了超光速旅行的秘密。', type: 2 },
      { id: 3, title: 'Star Seed', titleCn: '星种', description: 'You plant the seeds of a new civilization on a distant world.', descriptionCn: '你在一个遥远的世界播下了新文明的种子。', type: 3 },
      { id: 4, title: 'AI Takeover', titleCn: 'AI接管', description: 'Your ship\'s AI becomes self-aware and charts its own course.', descriptionCn: '你的飞船AI变得有自我意识，规划了自己的航线。', type: 4 },
      { id: 5, title: 'Nebula Born', titleCn: '星云重生', description: 'You merge with a cosmic entity in a nebula, becoming a being of pure energy.', descriptionCn: '你在星云中与一个宇宙实体融合，成为一个纯能量体。', type: 5 },
      { id: 6, title: 'Pirate King', titleCn: '海盗之王', description: 'You take command of a space pirate fleet and rule the outer rim.', descriptionCn: '你接管了一支太空海盗舰队，统治了外缘星系。', type: 6 },
      { id: 7, title: 'Black Hole Dive', titleCn: '黑洞之跃', description: 'You survive a journey into a black hole and emerge in another universe.', descriptionCn: '你存活了进入黑洞的旅程，并在另一个宇宙中出现。', type: 7 },
      { id: 8, title: 'Ancient Beacon', titleCn: '远古信标', description: 'You activate an ancient beacon that calls out to civilizations across the galaxy.', descriptionCn: '你激活了一个远古信标，向银河系的文明发出信号。', type: 8 },
      { id: 9, title: ' Homeward Bound', titleCn: '归途', description: 'You return to Earth as a hero, bringing knowledge from the stars.', descriptionCn: '你以英雄的身份返回地球，带来了来自星辰的知识。', type: 9 },
    ],
  },
  'haunted-village': {
    scenes: [
      {
        story: 'Thick fog blankets the abandoned village as you step through the rusted gate. Wooden houses lean at unnatural angles, their windows like hollow eyes watching your every move. A cold wind carries whispers of a dark ritual performed here a century ago.',
        translation: '当你踏过生锈的大门时，浓雾笼罩着废弃的村庄。木屋以不自然的角度倾斜，窗户像空洞的眼睛注视着你的一举一动。一阵冷风带来了一个世纪前在这里进行的黑暗仪式的低语。',
        choices: [],
        elements: ['player', 'torch', 'door', 'wood'],
        background: 'village',
      },
      {
        story: 'The village square reveals a cracked stone well at its center. Symbols are carved around its rim — protective wards, now broken and faded. A faint blue glow emanates from the well\'s depths, and you feel an overwhelming sense of sorrow.',
        translation: '村庄广场中央有一口破裂的石井。井沿上雕刻着符号——保护性的符文，现已破碎褪色。微弱的蓝光从井底发出，你感到一股压倒性的悲伤。',
        choices: [],
        elements: ['player', 'water', 'stone', 'fire'],
        background: 'cemetery',
      },
      {
        story: 'The ancient church stands at the edge of the village, its bell tower reaching toward the moonless sky. The doors are slightly ajar, and candlelight flickers within. Someone — or something — is waiting for you.',
        translation: '古老的教堂矗立在村庄边缘，钟楼伸向无月的天空。门微开着，里面有烛光闪烁。有人——或有什么东西——在等着你。',
        choices: [],
        elements: ['player', 'door', 'fire', 'book'],
        background: 'church',
      },
    ],
    endings: [
      { id: 0, title: 'Broken Curse', titleCn: '破除诅咒', description: 'You break the century-old curse and free the trapped souls.', descriptionCn: '你破除百年诅咒，解放了被困的灵魂。', type: 0 },
      { id: 1, title: 'Joined the Spirits', titleCn: '加入众灵', description: 'You become the newest ghost of the village, forever bound to its fog.', descriptionCn: '你成为村庄最新的鬼魂，永远与迷雾相伴。', type: 1 },
      { id: 2, title: 'Dark Truth', titleCn: '黑暗真相', description: 'You discover the village\'s dark secret — and decide to protect it.', descriptionCn: '你发现了村庄的黑暗秘密——并决定保护它。', type: 2 },
      { id: 3, title: 'Exorcist', titleCn: '驱魔人', description: 'You successfully perform an exorcism, purifying the village.', descriptionCn: '你成功进行了一场驱魔，净化了村庄。', type: 3 },
      { id: 4, title: 'Treasure Hunter', titleCn: '寻宝者', description: 'You find the hidden treasure that caused the village\'s downfall.', descriptionCn: '你找到了导致村庄覆灭的隐藏宝藏。', type: 4 },
      { id: 5, title: 'Time Loop', titleCn: '时间循环', description: 'You are trapped reliving the village\'s final night forever.', descriptionCn: '你被困在永远重复经历村庄的最后一夜。', type: 5 },
      { id: 6, title: 'Spirit Guide', titleCn: '灵魂向导', description: 'You become the bridge between the living and the dead.', descriptionCn: '你成为生者与死者之间的桥梁。', type: 6 },
      { id: 7, title: 'Burned Evidence', titleCn: '焚毁证据', description: 'You burn the village to the ground, destroying the curse with fire.', descriptionCn: '你烧毁了整个村庄，用火焰摧毁了诅咒。', type: 7 },
      { id: 8, title: 'Ancient Pact', titleCn: '远古契约', description: 'You negotiate with the entity, forming a new pact to keep the balance.', descriptionCn: '你与实体谈判，达成新契约以维持平衡。', type: 8 },
      { id: 9, title: 'Survivor', titleCn: '幸存者', description: 'You barely escape with your life and sanity, vowing never to return.', descriptionCn: '你勉强带着生命和理智逃脱，发誓再也不回来。', type: 9 },
    ],
  },
};

export function getFallbackStory(themeId: string, turn: number): { scene: StoryScene; endings: StoryEnding[] } | null {
  const stories = STORIES[themeId];
  if (!stories) return null;

  const sceneIndex = Math.min(turn - 1, stories.scenes.length - 1);
  const preset = stories.scenes[sceneIndex];
  const choices = getChoices(themeId, sceneIndex);

  const scene: StoryScene = {
    id: turn,
    text: preset.story,
    textCn: preset.translation,
    choices: choices.map((c, i) => ({
      id: `choice-${turn}-${i}`,
      text: c.text,
      textCn: c.translation,
      flavor: c.flavor,
    })),
    elements: preset.elements,
    background: preset.background,
    turn,
  };

  return { scene, endings: stories.endings };
}

export function getFallbackEndings(themeId: string): StoryEnding[] {
  return STORIES[themeId]?.endings || [];
}

export function hasFallbackStory(themeId: string): boolean {
  return themeId in STORIES;
}
