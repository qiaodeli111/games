#!/usr/bin/env python3
"""生成每个主题补充的2张背景图 (bg-3, bg-4)，用硅基流动 (Kolors 模型)。"""
import subprocess, sys, time
from pathlib import Path

SKILL_SCRIPT = Path.home() / '.pi/agent/skills/text2image/scripts/generate.py'
OUTPUT_DIR = Path(__file__).resolve().parent.parent / 'public/adventure-images'

# 每个主题的新背景
NEW_BGS = {
    'center-earth': [
        ('bg-3.jpg', 'Massive crystal cavern with giant purple amethyst crystals glowing with inner light, reflective crystal floor, ethereal atmosphere, cinematic game background art, no text, no UI, 16:9, high detail, fantasy'),
        ('bg-4.jpg', 'Underground magma chamber with flowing rivers of molten lava, intense orange-red glow, volcanic rock formations, heat haze, cinematic game background art, no text, no UI, 16:9, high detail'),
    ],
    'space': [
        ('bg-3.jpg', 'Alien world surface with strange colorful vegetation, exotic rock formations, purple sky with rings, two moons, sci-fi game background art, no text, no UI, 16:9, high detail'),
        ('bg-4.jpg', 'Dense asteroid field with rocks of various sizes drifting in space, distant starfield, a starship visible in the distance, cosmic game background art, no text, no UI, 16:9, high detail'),
    ],
    'haunted-village': [
        ('bg-3.jpg', 'Dark misty forest with twisted bare trees, fog creeping between trunks, dim moonlight, eerie atmosphere, horror game background art, no text, no UI, 16:9, dark moody'),
        ('bg-4.jpg', 'Abandoned stone church with broken stained glass windows, crumbling walls, overgrown with ivy, graveyard in front, horror game background art, no text, no UI, 16:9, dark moody'),
    ],
    'wild-west': [
        ('bg-3.jpg', 'Interior of a wild west saloon with wooden bar, swinging doors, oil lamps, piano in corner, sawdust floor, western game background art, no text, no UI, 16:9, warm lighting'),
        ('bg-4.jpg', 'Ranch scene with wooden fence, barn, horses in corral, windmill, prairie stretching to horizon, western game background art, no text, no UI, 16:9, golden hour'),
    ],
    'deep-sea': [
        ('bg-3.jpg', 'Underwater cave with stalactites descending into crystal clear water, beams of light from above, colorful fish, submerged rock formations, underwater game background art, no text, no UI, 16:9, high detail'),
        ('bg-4.jpg', 'Deep sea abyss, complete darkness with occasional bioluminescent creatures, jagged underwater cliffs fading into blackness, pressure and depth feel, underwater game background art, no text, no UI, 16:9, dark atmospheric'),
    ],
    'tomb-raiding': [
        ('bg-3.jpg', 'Narrow underground tunnel with rough stone walls, torch light casting shadows, cobwebs, ancient carvings, adventure game background art, no text, no UI, 16:9, dim warm light'),
        ('bg-4.jpg', 'Hidden treasure chamber filled with gold coins, jeweled artifacts, precious gems, ornate chests, torch-lit, adventure game background art, no text, no UI, 16:9, warm golden glow'),
    ],
    'apocalypse': [
        ('bg-3.jpg', 'Post-apocalyptic city ruins with collapsed skyscrapers, rusted cars, broken roads, smoke rising, grey sky, survival game background art, no text, no UI, 16:9, grim desolate'),
        ('bg-4.jpg', 'Dead forest with skeletal trees, toxic fog, barren ground, remnants of civilization, post-apocalyptic game background art, no text, no UI, 16:9, muted colors'),
    ],
    'magic-academy': [
        ('bg-3.jpg', 'Magical classroom with floating chalkboard, enchanted desks, potion ingredients on shelves, glowing windows, fantasy game background art, no text, no UI, 16:9, warm magical light'),
        ('bg-4.jpg', 'Tall wizard tower with spiral staircase, floating books, magical artifacts, starry night visible through arched windows, fantasy game background art, no text, no UI, 16:9, mystical blue light'),
    ],
    'cyberpunk': [
        ('bg-3.jpg', 'Neon night club interior with laser lights, holographic dancers, glowing bar, cyberpunk patrons, futuristic game background art, no text, no UI, 16:9, vibrant neon purple and pink'),
        ('bg-4.jpg', 'Futuristic subway station with holographic ads, train arriving, neon signs, wet concrete, cyberpunk game background art, no text, no UI, 16:9, blue and pink neon lighting'),
    ],
    'lost-civilization': [
        ('bg-3.jpg', 'Ancient stone plaza with massive carved statues, overgrown central fountain, glyph-covered obelisks, jungle surrounding, adventure game background art, no text, no UI, 16:9, warm golden light'),
        ('bg-4.jpg', 'Hidden chamber with advanced ancient technology, glowing crystal power source, stone mechanisms, mysterious blue light, adventure game background art, no text, no UI, 16:9, mysterious blue glow'),
    ],
}

def gen_one(theme_id, filename, prompt, index, total):
    output = OUTPUT_DIR / theme_id / filename
    output.parent.mkdir(parents=True, exist_ok=True)
    
    print(f'\n[{index}/{total}] {theme_id}/{filename}')
    print(f'  Prompt: {prompt[:60]}...')
    
    cmd = [
        sys.executable, str(SKILL_SCRIPT),
        '--purpose', 'background',
        '--prompt', prompt,
        '--output', str(output),
        '--timeout', '120',
    ]
    
    start = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    elapsed = time.time() - start
    
    if result.returncode == 0:
        size = output.stat().st_size // 1024 if output.exists() else 0
        print(f'  ✅ {elapsed:.0f}s, {size}KB')
        return True
    else:
        print(f'  ❌ {result.stderr[:200]}')
        return False

def main():
    total = sum(len(bgs) for bgs in NEW_BGS.values())
    print(f'=== Generating {total} new background images ===\n')
    
    count = 0
    ok = 0
    for theme_id, backgrounds in NEW_BGS.items():
        for filename, prompt in backgrounds:
            count += 1
            if gen_one(theme_id, filename, prompt, count, total):
                ok += 1
    
    print(f'\n{"="*40}')
    print(f'Done: {ok}/{total} succeeded')
    
    if ok > 0:
        print('\nNext: update bgMap in spriteLoader.ts')

if __name__ == '__main__':
    main()
