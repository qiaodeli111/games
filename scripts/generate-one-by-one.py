#!/usr/bin/env python3
"""
Generate one image at a time. Saves task IDs to tasks.json so we can resume 
if interrupted. Only generates truly missing files.
"""
import asyncio, json, os, sys
from pathlib import Path
from urllib.request import urlopen, Request
import shutil

API_BASE = 'https://www.runninghub.cn/openapi/v2'
TEXT_TO_IMAGE = '/rhart-image-n-g31-flash/text-to-image'
QUERY_PATH = '/query'
SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR.parent / 'public' / 'adventure-images'
TASKS_FILE = SCRIPT_DIR / 'image-tasks.json'

def get_api_key():
    k = os.environ.get('RUNNINGHUB_API_KEY')
    if k: return k
    env = SCRIPT_DIR / '.env'
    if env.exists():
        for line in env.read_text().splitlines():
            t = line.strip()
            if t.startswith('RUNNINGHUB_API_KEY='):
                return t.split('=',1)[1].strip()
    return None

def api_req(method, path, body):
    key = get_api_key()
    url = API_BASE + path
    data = json.dumps(body).encode()
    r = Request(url, data=data, method=method)
    r.add_header('Content-Type', 'application/json')
    r.add_header('Authorization', f'Bearer {key}')
    with urlopen(r, timeout=120) as resp:
        return json.loads(resp.read())

MISSING = {
    'apocalypse': {
        'bg-0.jpg': ('Post-apocalyptic wasteland with ruined buildings, broken roads, smoke in distance, grey sky, survival game background, no text, no UI, 16:9, grim atmosphere', '16:9'),
        'bg-1.jpg': ('Underground bunker interior with metal walls, fluorescent lights, supply crates, military equipment, survival game background, no text, no UI, 16:9, cold blue light', '16:9'),
        'bg-2.jpg': ('Abandoned ruined city with collapsed skyscrapers, overgrown streets, debris, rusty cars, post-apocalyptic game background, no text, no UI, 16:9, high detail', '16:9'),
    },
    'cyberpunk': {
        'characters.png': ('Create a 2x4 grid spritesheet for a cyberpunk game. Row 1: hacker with cybernetic implants and hoodie, floating AI companion hologram, corporate agent in suit, robotic cyber dog. Row 2: neon-glowing plant in pot, glowing data chip, plasma pistol, handheld cyberdeck device. Flat vector style, dark cyberpunk background, 1:1 square, game asset style, clean consistent lighting, each cell separated clearly, no text', '1:1'),
        'elements.png': ('Create a 2x4 grid spritesheet for a cyberpunk game. Row 1: glowing neon star icon, holographic moon projection, grey concrete block, futuristic security door. Row 2: glowing encryption key hologram, neon city map hologram, metal data vault, digital manual with screen. Flat vector style, dark cyberpunk background with neon accents, 1:1 square, game asset style, clean consistent lighting, each cell separated clearly, no text', '1:1'),
    },
    'deep-sea': {
        'elements.png': ('Create a 2x4 grid spritesheet for an underwater game. Row 1: floating air bubbles, underwater rock formation, glowing sea crystal, green kelp seaweed. Row 2: round submarine hatch door, sunken treasure chest open, swirling whirlpool, ancient rolled scroll. Flat vector style, ocean blue background, 1:1 square, game asset style, clean consistent lighting, each cell separated clearly, no text', '1:1'),
    },
    'tomb-raiding': {
        'bg-0.jpg': ('Ancient Egyptian tomb interior with hieroglyphics on walls, sarcophagus, torch light, dusty atmosphere, adventure game background, no text, no UI, 16:9, warm light', '16:9'),
        'elements.png': ('Create a 2x4 grid spritesheet for an adventure game. Row 1: burning torch on wall bracket, sacred water in ankh-shaped vessel, carved stone block, faceted red gemstone. Row 2: massive stone door with carvings, spiral stone staircase, ornate treasure chest, golden key with ornate head. Flat vector style, sandy beige background, 1:1 square, game asset style, clean consistent lighting, each cell separated clearly, no text', '1:1'),
    },
    'lost-civilization': {
        'bg-0.jpg': ('Ancient jungle temple covered in vines, stone carvings, moss, sunbeams through canopy, mysterious game background, no text, no UI, 16:9, golden hour light', '16:9'),
        'bg-1.jpg': ('Lost city plaza with stone pyramids, statues, overgrown with jungle, mysterious atmosphere, adventure game background, no text, no UI, 16:9, warm sunlight', '16:9'),
        'bg-2.jpg': ('Hanging gardens with waterfalls, exotic flowers, stone terraces, mist, ancient advanced civilization, game background, no text, no UI, 16:9, green and golden tones', '16:9'),
        'characters.png': ('Create a 2x4 grid spritesheet for an adventure game. Row 1: explorer with machete and hat, native guide with tribal markings, stone guardian statue come to life, black jaguar with golden eyes. Row 2: tropical monstera plant, ancient golden artifact with gems, wooden spear with stone tip, carved totem pole. Flat vector style, jungle green background, 1:1 square, game asset style, clean consistent lighting, each cell separated clearly, no text', '1:1'),
        'elements.png': ('Create a 2x4 grid spritesheet for an adventure game. Row 1: sacred fire in stone brazier, reflective sacred pool, tall stone monolith, glowing power crystal. Row 2: massive stone gate with carvings, pyramid stone steps, swirling mystical portal, ancient hieroglyphic scroll. Flat vector style, jungle green background, 1:1 square, game asset style, clean consistent lighting, each cell separated clearly, no text', '1:1'),
    },
}

def load_tasks():
    if TASKS_FILE.exists():
        return json.loads(TASKS_FILE.read_text())
    return {}

def save_tasks(tasks):
    TASKS_FILE.write_text(json.dumps(tasks, indent=2, ensure_ascii=False))

async def process():
    if not get_api_key():
        print('ERROR: No RUNNINGHUB_API_KEY')
        sys.exit(1)

    tasks = load_tasks()
    
    # Count what needs doing
    total = 0
    for theme_id, files in MISSING.items():
        for fname in files:
            key = f'{theme_id}/{fname}'
            if key in tasks:
                continue  # already submitted previously
            total += 1

    if total == 0:
        # Check if previous tasks have results
        pending = {k: v for k, v in tasks.items() if 'url' not in v}
        if not pending:
            print('All images already generated!')
            return
        print(f'Checking {len(pending)} pending tasks from previous run...')
        for key, info in pending.items():
            tid = info['taskId']
            print(f'  Polling {key} (task {tid})...', flush=True)
            try:
                q = await asyncio.to_thread(api_req, 'POST', QUERY_PATH, {'taskId': tid})
                if q.get('status') == 'SUCCESS':
                    url = q.get('results', [{}])[0].get('url')
                    if url:
                        parts = key.split('/')
                        theme_id, fname = parts[0], parts[1]
                        outpath = OUTPUT_DIR / theme_id / fname
                        outpath.parent.mkdir(parents=True, exist_ok=True)
                        with urlopen(url) as dl:
                            with open(str(outpath), 'wb') as f:
                                shutil.copyfileobj(dl, f)
                        tasks[key]['url'] = url
                        tasks[key]['saved'] = str(outpath)
                        print(f'    ✅ Downloaded: {outpath.name}')
                        save_tasks(tasks)
                    else:
                        print(f'    ⚠ SUCCESS but no URL')
                elif q.get('status') == 'FAILED':
                    print(f'    ❌ Task failed, will resubmit')
                    del tasks[key]
                    save_tasks(tasks)
                else:
                    print(f'    ⏳ Still {q.get("status")}, needs more time')
            except Exception as e:
                print(f'    ⚠ Query error: {e}')
        
        save_tasks(tasks)
        return

    print(f'Need to submit {total} new image tasks')
    print(f'Already have {len(tasks)} task records')
    print()

    done = 0
    for theme_id, files in MISSING.items():
        for fname, (prompt, aspect) in files.items():
            key = f'{theme_id}/{fname}'
            if key in tasks:
                continue
            
            done += 1
            outpath = OUTPUT_DIR / theme_id / fname
            label = f'[{done}/{total}] {key}'
            
            try:
                print(f'{label} Submitting...', flush=True)
                res = await asyncio.to_thread(api_req, 'POST', TEXT_TO_IMAGE, {
                    'prompt': prompt, 'aspectRatio': aspect, 'resolution': '2k'
                })
                tid = res.get('taskId')
                if not tid:
                    print(f'{label} ❌ No taskId: {res}')
                    continue
                
                tasks[key] = {'taskId': tid, 'prompt': prompt[:60] + '...'}
                save_tasks(tasks)
                print(f'{label} Task {tid}')
                
                # Poll
                for i in range(60):
                    await asyncio.sleep(5)
                    q = await asyncio.to_thread(api_req, 'POST', QUERY_PATH, {'taskId': tid})
                    st = q.get('status')
                    if st == 'SUCCESS':
                        url = q.get('results', [{}])[0].get('url')
                        if url:
                            outpath.parent.mkdir(parents=True, exist_ok=True)
                            with urlopen(url) as dl:
                                with open(str(outpath), 'wb') as f:
                                    shutil.copyfileobj(dl, f)
                            size = outpath.stat().st_size // 1024
                            tasks[key]['url'] = url
                            tasks[key]['saved'] = str(outpath)
                            save_tasks(tasks)
                            print(f'{label} ✅ Saved ({size}KB)')
                        else:
                            print(f'{label} ❌ No URL')
                        break
                    elif st == 'FAILED':
                        print(f'{label} ❌ Failed')
                        del tasks[key]
                        save_tasks(tasks)
                        break
                    if i % 6 == 0:
                        print(f'{label} Polling... ({st}, {i*5}s)', flush=True)
                
                if st not in ('SUCCESS', 'FAILED'):
                    print(f'{label} ⏳ Still processing, saved task for later')
                    
            except Exception as e:
                print(f'{label} ❌ Error: {e}')
            
            print()

    print(f'=== Done. Tasks saved to {TASKS_FILE} ===')

if __name__ == '__main__':
    asyncio.run(process())
