#!/usr/bin/env python3
"""
Massive parallel image generation for adventure game.
Generates 45 images per theme × 10 themes = 450 images.
Uses 5 Cloudflare + 5 硅基流动 threads simultaneously.
"""
import asyncio, json, os, sys, time
from pathlib import Path

SKILL = Path.home() / '.pi/agent/skills/text2image/scripts/generate.py'
PYTHON = sys.executable
OUT = Path(__file__).resolve().parent.parent / 'public/adventure-images'

# ─── 45 images per theme ─────────────────────────────────────────
# Each entry: (filename, prompt, provider)
# provider 'auto' = CF SDXL, 'sf' = 硅基流动

THEME_IMAGES = {
    'center-earth': {
        'bg': [
            ('bg-0.jpg', 'Volcanic cave entrance with steam rising from cracks, dark rocks, orange glow from deep within, cinematic game background, 16:9', 'auto'),
            ('bg-1.jpg', 'Massive underground cavern with stalactites, underground river, bioluminescent moss, blue-green glow, cinematic game background, 16:9', 'auto'),
            ('bg-2.jpg', 'Underground prehistoric jungle with giant ferns, giant mushrooms, mist, strange plants, geothermal steam vents, game background, 16:9', 'auto'),
            ('bg-3.jpg', 'Crystal cavern filled with giant purple amethyst crystals, reflective surfaces, ethereal light, fantasy game background, 16:9', 'auto'),
            ('bg-4.jpg', 'Underground magma chamber with flowing lava rivers, intense orange glow, volcanic rock, heat haze, game background, 16:9', 'auto'),
            ('bg-5.jpg', 'Deep underground fossil cave with ancient bones embedded in walls, dim torch light, mysterious atmosphere, game background, 16:9', 'auto'),
            ('bg-6.jpg', 'Subterranean lake with still dark water, glowing crystals on ceiling reflecting off surface, cave walls, game background, 16:9', 'auto'),
            ('bg-7.jpg', 'Giant geode chamber with crystals lining every surface, rainbows of color, sparkling light, fantasy game background, 16:9', 'sf'),
            ('bg-8.jpg', 'Narrow tunnel with ancient carved steps descending into darkness, worn stone, torch sconces, game background, 16:9', 'sf'),
            ('bg-9.jpg', 'Massive underground chasm with a stone bridge crossing over endless darkness, mist below, game background, 16:9', 'sf'),
            ('bg-10.jpg', 'Fungal forest with giant glowing mushrooms in all colors, spore particles floating, bioluminescent, game background, 16:9', 'sf'),
            ('bg-11.jpg', 'Ancient underground ruins with fallen columns, moss-covered stone, mysterious glyphs, game background, 16:9', 'sf'),
            ('bg-12.jpg', 'Lava tube cave with smooth curved walls, red glow from cooling lava, steam, dramatic lighting, game background, 16:9', 'auto'),
            ('bg-13.jpg', 'Underground waterfall cascading into a crystal clear pool, rainbow in mist, cave opening above, game background, 16:9', 'auto'),
            ('bg-14.jpg', 'The Earth\'s core chamber with swirling molten rock, floating islands of crystal, ultimate destination, game background, 16:9', 'sf'),
        ],
        'char': [
            ('char-0.jpg', 'Brave explorer with leather jacket, backpack, holding a pickaxe, determined expression, torch light, character portrait', 'auto'),
            ('char-1.jpg', 'Wise old guide with white beard, staff, mining helmet with light, friendly weathered face, character portrait', 'auto'),
            ('char-2.jpg', 'Giant cave troll with rocky skin, small eyes, massive fists, menacing, creature design, full body', 'auto'),
            ('char-3.jpg', 'Giant underground snake with glowing scales, forked tongue, coiled to strike, monster design', 'auto'),
            ('char-4.jpg', 'Pterodactyl flying in cavern, wide wingspan, sharp beak, prehistoric, creature in flight', 'auto'),
            ('char-5.jpg', 'Giant ant with mandibles, multiple legs, chitinous armor, underground creature design', 'sf'),
            ('char-6.jpg', 'Crystal golem made of purple gems, humanoid shape, glowing joints, fantasy creature full body', 'sf'),
            ('char-7.jpg', 'Lava elemental with fiery body, molten rock limbs, burning eyes, elemental creature portrait', 'sf'),
            ('char-8.jpg', 'Dwarf miner with pickaxe, hard hat, sturdy build, covered in soot, character portrait', 'sf'),
            ('char-9.jpg', 'Giant subterranean centipede with many legs, chitin segments, glowing eyes, monster design', 'sf'),
            ('char-10.jpg', 'Dinosaur in underground jungle, raptor-like, sharp teeth, hunting stance, creature design', 'auto'),
            ('char-11.jpg', 'Glow worm swarm forming a shape in darkness, many tiny lights, eerie beautiful, creature', 'auto'),
            ('char-12.jpg', 'Ancient spirit made of mist and light, translucent, floating, ethereal being portrait', 'auto'),
            ('char-13.jpg', 'Giant bat with leathery wings, sharp claws, hanging upside down, cave creature design', 'auto'),
            ('char-14.jpg', 'Prehistoric fish with armored scales, sharp teeth, swimming in underground lake, creature', 'sf'),
        ],
        'item': [
            ('item-0.jpg', 'Iron pickaxe with wooden handle, well-used, mining tool on dark background, game item icon', 'auto'),
            ('item-1.jpg', 'Burning torch with orange flame, wooden stick wrapped in cloth, game item on dark background', 'auto'),
            ('item-2.jpg', 'Coiled rope with hook, climbing equipment, game item on dark background', 'auto'),
            ('item-3.jpg', 'Brass compass with glowing needle, open face, intricate details, game item on dark background', 'auto'),
            ('item-4.jpg', 'Old parchment treasure map with marked paths, burned edges, game item on dark background', 'auto'),
            ('item-5.jpg', 'Glowing purple crystal gem cut into shape, sparkling, magical, game item on dark background', 'sf'),
            ('item-6.jpg', 'Ancient fossil embedded in rock, spiral shell shape, prehistoric, game item on dark background', 'sf'),
            ('item-7.jpg', 'Giant glowing mushroom with blue bioluminescence, detailed gills, game item on dark background', 'sf'),
            ('item-8.jpg', 'Lava rock with glowing orange veins, still hot, smoking, game item on dark background', 'sf'),
            ('item-9.jpg', 'Ancient stone tablet with carved runes, worn edges, mysterious symbols, game item on dark background', 'sf'),
            ('item-10.jpg', 'Metal water flask with leather strap, dinted, practical, game item on dark background', 'auto'),
            ('item-11.jpg', 'Climbing gear with carabiners and harness, detailed equipment, game item on dark background', 'auto'),
            ('item-12.jpg', 'Oil lantern with glass shield, yellow flame, handle, game item on dark background', 'auto'),
            ('item-13.jpg', 'Leather backpack with straps and buckles, adventure gear, game item on dark background', 'auto'),
            ('item-14.jpg', 'Ancient key with ornate head, rusted, mysterious, game item on dark background', 'sf'),
        ],
    },
    # Other themes will be filled in the actual batch runs
    # For now, start with center-earth as prototype
}

def get_provider_cmd(filename, prompt, provider):
    """Get the command to run for this image."""
    if provider == 'sf':
        return [PYTHON, str(SKILL), '--provider', 'siliconflow', '--prompt', prompt, '--output', 'PLACEHOLDER', '--timeout', '120']
    else:
        return [PYTHON, str(SKILL), '--purpose', 'auto', '--prompt', prompt, '--output', 'PLACEHOLDER', '--timeout', '120']

async def gen_one(sem, theme, category, filename, prompt, provider, idx, total):
    """Generate one image."""
    async with sem:
        out_dir = OUT / theme
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / filename
        
        if out_path.exists() and out_path.stat().st_size > 10000:
            kb = out_path.stat().st_size // 1024
            print(f'[{idx}/{total}] ⏭️ {theme}/{filename} ({kb}KB)')
            return True
        
        tag = f'[{idx}/{total}] {theme}/{filename}'
        
        cmd = [PYTHON, str(SKILL)]
        if provider == 'sf':
            cmd += ['--provider', 'siliconflow']
        else:
            cmd += ['--purpose', 'auto']
        cmd += ['--prompt', prompt, '--output', str(out_path), '--timeout', '120']
        
        for attempt in range(3):
            proc = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=180)
                if proc.returncode == 0 and out_path.exists() and out_path.stat().st_size > 10000:
                    kb = out_path.stat().st_size // 1024
                    print(f'{tag} ✅ {kb}KB ({provider})')
                    return True
                else:
                    err = stderr.decode()[:100] if stderr else 'unknown'
                    print(f'{tag} ❌ attempt {attempt+1}: {err}')
            except asyncio.TimeoutError:
                proc.kill()
                print(f'{tag} ⏰ timeout attempt {attempt+1}')
            
            if attempt < 2:
                await asyncio.sleep(5 * (attempt + 1))
        
        print(f'{tag} ❌ FAILED after 3 attempts')
        return False

async def main():
    # Collect all tasks
    tasks = []
    for theme_id, categories in THEME_IMAGES.items():
        for cat_name, images in categories.items():
            for filename, prompt, provider in images:
                tasks.append((theme_id, cat_name, filename, prompt, provider))
    
    total = len(tasks)
    print(f'Total images to generate: {total}')
    
    # Semaphore: 5 CF + 5 SF = 10 concurrent
    sem = asyncio.Semaphore(10)
    
    # Create all tasks
    coros = []
    for i, (theme, cat, fname, prompt, provider) in enumerate(tasks, 1):
        coros.append(gen_one(sem, theme, cat, fname, prompt, provider, i, total))
    
    results = await asyncio.gather(*coros)
    ok = sum(1 for r in results if r)
    
    print(f'\n{"="*50}')
    print(f'Done: {ok}/{total} generated')

if __name__ == '__main__':
    asyncio.run(main())
