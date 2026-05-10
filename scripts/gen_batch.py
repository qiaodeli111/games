#!/usr/bin/env python3
"""Generate images for specified themes. Cloudflare primary."""
import asyncio, sys, time
from pathlib import Path

SKILL = Path.home() / '.pi/agent/skills/text2image/scripts/generate.py'
PYTHON = sys.executable
OUT = Path(__file__).resolve().parent.parent / 'public/adventure-images'

THEMES = {
    'haunted-village': {
        'bg': {f'bg-{i}.jpg': '' for i in range(5,15)},
        'char': {f'char-{i}.jpg': '' for i in range(15)},
        'item': {f'item-{i}.jpg': '' for i in range(15)},
    },
}

# Load prompts from external file
import json
PROMPTS_FILE = Path(__file__).resolve().parent / 'image_prompts.json'
PROMPTS = json.loads(PROMPTS_FILE.read_text()) if PROMPTS_FILE.exists() else {}

async def gen_one(sem, theme, fname, prompt, idx, total):
    out = OUT / theme / fname
    if out.exists() and out.stat().st_size > 10000:
        print(f'[{idx}/{total}] ⏭️ {theme}/{fname}')
        return True
    out.parent.mkdir(parents=True, exist_ok=True)
    tag = f'[{idx}/{total}] {theme}/{fname}'
    async with sem:
        for attempt in range(3):
            cmd = [PYTHON, str(SKILL), '--purpose', 'auto', '--prompt', prompt, '--output', str(out), '--timeout', '120']
            p = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
            try:
                o, e = await asyncio.wait_for(p.communicate(), timeout=180)
                if p.returncode == 0 and out.exists() and out.stat().st_size > 10000:
                    print(f'{tag} ✅ {out.stat().st_size//1024}KB')
                    return True
                print(f'{tag} ❌ attempt {attempt+1}: {e.decode()[:80] if e else "no"}')
            except asyncio.TimeoutError:
                p.kill()
                print(f'{tag} ⏰ attempt {attempt+1}')
            if attempt < 2:
                await asyncio.sleep(10)
        print(f'{tag} ❌ FAILED')
        return False

async def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--themes', nargs='+', required=True)
    args = parser.parse_args()

    if not PROMPTS:
        print('ERROR: No image_prompts.json found!')
        print('Create scripts/image_prompts.json first.')
        sys.exit(1)

    tasks = []
    for theme in args.themes:
        for cat in ['bg','char','item']:
            for fname in PROMPTS.get(theme, {}).get(cat, {}):
                tasks.append((theme, fname, PROMPTS[theme][cat][fname]))
    
    total = len(tasks)
    print(f'Generating {total} images for {args.themes}')
    
    sem = asyncio.Semaphore(5)
    ok = 0
    for i, (theme, fname, prompt) in enumerate(tasks, 1):
        if await gen_one(sem, theme, fname, prompt, i, total):
            ok += 1
    
    print(f'\n✅ {ok}/{total}')

if __name__ == '__main__':
    asyncio.run(main())
