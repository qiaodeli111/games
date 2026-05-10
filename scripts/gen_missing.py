#!/usr/bin/env python3
"""Generate the 19 missing images for lost-civilization and magic-academy."""
import asyncio, sys
from pathlib import Path

SKILL = Path.home() / '.pi/agent/skills/text2image/scripts/generate.py'
PYTHON = sys.executable
OUT = Path(__file__).resolve().parent.parent / 'public/adventure-images'

# ─── Missing images ──────────────────────────────────────────────
# (theme, filename, prompt, provider)

MISSING = [
    # lost-civilization chars
    ('lost-civilization', 'char-12.jpg', 'Ancient spirit guardian with translucent body, glowing eyes, ethereal portrait', 'cf'),
    ('lost-civilization', 'char-13.jpg', 'Jaguar warrior in ceremonial jaguar skin, claws, fierce character portrait', 'cf'),
    ('lost-civilization', 'char-14.jpg', 'Giant sloth with long claws, slow movement, prehistoric animal portrait', 'sf'),
    # lost-civilization items
    ('lost-civilization', 'item-0.jpg', 'Golden sun disk artifact with engravings, treasure on dark background', 'cf'),
    ('lost-civilization', 'item-1.jpg', 'Carved jade mask with intricate patterns, ancient artifact on dark background', 'cf'),
    ('lost-civilization', 'item-2.jpg', 'Obsidian knife with sharp black blade, ceremonial weapon on dark background', 'cf'),
    ('lost-civilization', 'item-3.jpg', 'Feathered headdress with colorful plumes, ceremonial headwear on dark', 'cf'),
    ('lost-civilization', 'item-4.jpg', 'Ancient scroll with pictograms, bark paper, knowledge on dark background', 'cf'),
    ('lost-civilization', 'item-5.jpg', 'Gold and turquoise breastplate jewelry, treasure on dark background', 'sf'),
    ('lost-civilization', 'item-6.jpg', 'Carved stone calendar wheel with symbols, ancient on dark background', 'sf'),
    ('lost-civilization', 'item-7.jpg', 'Crystal skull with transparent quartz, mysterious on dark background', 'sf'),
    ('lost-civilization', 'item-8.jpg', 'Ceremonial drum with animal skin, carved wood on dark background', 'sf'),
    ('lost-civilization', 'item-9.jpg', 'Golden figurine of a deity, small statue on dark background', 'sf'),
    ('lost-civilization', 'item-10.jpg', 'Blowgun with darts, hunting weapon on dark background', 'cf'),
    ('lost-civilization', 'item-11.jpg', 'Jungle machete with wooden handle, cutting tool on dark background', 'cf'),
    ('lost-civilization', 'item-12.jpg', 'Ancient compass with unknown symbols, navigation on dark background', 'cf'),
    ('lost-civilization', 'item-13.jpg', 'Rope with vine material, natural fiber on dark background', 'cf'),
    ('lost-civilization', 'item-14.jpg', 'Crystal prism with glowing light inside, power source on dark', 'sf'),
    # magic-academy
    ('magic-academy', 'item-14.jpg', 'Ancient rune stone with carved symbols, magical on dark background', 'sf'),
]

async def gen_one(sem, theme, filename, prompt, provider, idx, total):
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
        
        print(f'{tag} ❌ FAILED')
        return False

async def main():
    total = len(MISSING)
    print(f'Generating {total} missing images...')
    
    sem = asyncio.Semaphore(5)
    
    coros = []
    for i, (theme, fname, prompt, provider) in enumerate(MISSING, 1):
        coros.append(gen_one(sem, theme, fname, prompt, provider, i, total))
    
    results = await asyncio.gather(*coros)
    ok = sum(1 for r in results if r)
    
    print(f'\n{"="*50}')
    print(f'Done: {ok}/{total} generated')

if __name__ == '__main__':
    asyncio.run(main())
