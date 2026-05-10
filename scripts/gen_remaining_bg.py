#!/usr/bin/env python3
"""生成剩余的背景图，每个间隔5秒避免限流。重试失败项。"""
import subprocess, sys, time
from pathlib import Path

SKILL = Path.home() / '.pi/agent/skills/text2image/scripts/generate.py'
OUT = Path(__file__).resolve().parent.parent / 'public/adventure-images'

IMAGES = [
    # (theme, filename, prompt)
    ('wild-west', 'bg-3.jpg', 'Interior of a wild west saloon with wooden bar, swinging doors, oil lamps, piano in corner, sawdust floor, western game background art, no text, no UI, 16:9, warm lighting'),
    ('wild-west', 'bg-4.jpg', 'Ranch scene with wooden fence, barn, horses in corral, windmill, prairie stretching to horizon, western game background art, no text, no UI, 16:9, golden hour'),
    ('deep-sea', 'bg-3.jpg', 'Underwater cave with stalactites descending into crystal clear water, beams of light from above, colorful fish, submerged rock formations, underwater game background art, no text, no UI, 16:9, high detail'),
    ('deep-sea', 'bg-4.jpg', 'Deep sea abyss, complete darkness with occasional bioluminescent creatures, jagged underwater cliffs fading into blackness, pressure and depth feel, underwater game background art, no text, no UI, 16:9, dark atmospheric'),
    ('tomb-raiding', 'bg-3.jpg', 'Narrow underground tunnel with rough stone walls, torch light casting shadows, cobwebs, ancient carvings, adventure game background art, no text, no UI, 16:9, dim warm light'),
    ('tomb-raiding', 'bg-4.jpg', 'Hidden treasure chamber filled with gold coins, jeweled artifacts, precious gems, ornate chests, torch-lit, adventure game background art, no text, no UI, 16:9, warm golden glow'),
    ('apocalypse', 'bg-4.jpg', 'Dead forest with skeletal trees, toxic fog, barren ground, remnants of civilization, post-apocalyptic game background art, no text, no UI, 16:9, muted colors'),
    ('magic-academy', 'bg-3.jpg', 'Magical classroom with floating chalkboard, enchanted desks, potion ingredients on shelves, glowing windows, fantasy game background art, no text, no UI, 16:9, warm magical light'),
    ('magic-academy', 'bg-4.jpg', 'Tall wizard tower with spiral staircase, floating books, magical artifacts, starry night visible through arched windows, fantasy game background art, no text, no UI, 16:9, mystical blue light'),
    ('cyberpunk', 'bg-3.jpg', 'Neon night club interior with laser lights, holographic dancers, glowing bar, cyberpunk patrons, futuristic game background art, no text, no UI, 16:9, vibrant neon purple and pink'),
    ('cyberpunk', 'bg-4.jpg', 'Futuristic subway station with holographic ads, train arriving, neon signs, wet concrete, cyberpunk game background art, no text, no UI, 16:9, blue and pink neon lighting'),
    ('lost-civilization', 'bg-3.jpg', 'Ancient stone plaza with massive carved statues, overgrown central fountain, glyph-covered obelisks, jungle surrounding, adventure game background art, no text, no UI, 16:9, warm golden light'),
    ('lost-civilization', 'bg-4.jpg', 'Hidden chamber with advanced ancient technology, glowing crystal power source, stone mechanisms, mysterious blue light, adventure game background art, no text, no UI, 16:9, mysterious blue glow'),
]

def gen(theme, fname, prompt, retries=3):
    out = OUT / theme / fname
    if out.exists():
        print(f'⏭️  {theme}/{fname} already exists')
        return True
    out.parent.mkdir(parents=True, exist_ok=True)
    
    for attempt in range(retries):
        print(f'🎨 [{theme}/{fname}] attempt {attempt+1}...')
        r = subprocess.run(
            [sys.executable, str(SKILL), '--provider', 'siliconflow',
             '--prompt', prompt, '--output', str(out), '--timeout', '120'],
            capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            kb = out.stat().st_size // 1024
            print(f'   ✅ {kb}KB')
            return True
        print(f'   ❌ {r.stderr.split(chr(10))[-3][:100]}')
        if attempt < retries - 1:
            wait = 10 * (attempt + 1)
            print(f'   ⏳ retry in {wait}s...')
            time.sleep(wait)
    return False

def main():
    total = len(IMAGES)
    ok = 0
    for i, (theme, fname, prompt) in enumerate(IMAGES, 1):
        print(f'[{i}/{total}] ', end='')
        if gen(theme, fname, prompt):
            ok += 1
        if i < total:
            time.sleep(5)  # rate limit avoidance
    print(f'\nDone: {ok}/{total}')

if __name__ == '__main__':
    main()
