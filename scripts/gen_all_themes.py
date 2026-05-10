#!/usr/bin/env python3
"""Generate 45 images per theme with parallel CF threads."""
import asyncio, sys, time
from pathlib import Path

SKILL = Path.home() / '.pi/agent/skills/text2image/scripts/generate.py'
PYTHON = sys.executable
OUT = Path(__file__).resolve().parent.parent / 'public/adventure-images'

# ─── Theme image definitions ──────────────────────────────────────
# Each theme: 15 bg + 15 char + 15 item = 45 images
# provider: 'cf' = Cloudflare SDXL, 'sf' = 硅基流动

THEMES = {
    'space': {
        'bg': [
            ('bg-0.jpg', 'High-tech starship bridge with holographic displays, starfield through window, blue ambient light, cinematic game background, 16:9', 'cf'),
            ('bg-1.jpg', 'Alien planet surface with strange rock formations, two moons in purple sky, exotic plants, game background, 16:9', 'cf'),
            ('bg-2.jpg', 'Colorful nebula with swirling cosmic gases, distant stars, deep space vista, pink and purple hues, game background, 16:9', 'cf'),
            ('bg-3.jpg', 'Alien world with bioluminescent forests, crystalline mountains reflecting twin moons, sci-fi game background, 16:9', 'cf'),
            ('bg-4.jpg', 'Dense asteroid field with rocks of various sizes, distant starfield, cosmic debris, sci-fi game background, 16:9', 'cf'),
            ('bg-5.jpg', 'Space station interior with long corridors, metal walls, zero-gravity indicators, sci-fi game background, 16:9', 'cf'),
            ('bg-6.jpg', 'Starship cockpit with instrument panels, navigation screens, pilot seat, view of space, game background, 16:9', 'cf'),
            ('bg-7.jpg', 'Barren moon surface with craters, Earth-like planet in sky, stars, lunar horizon, game background, 16:9', 'sf'),
            ('bg-8.jpg', 'Swirling wormhole in deep space, blue and purple energy rings, cosmic distortion, sci-fi background, 16:9', 'sf'),
            ('bg-9.jpg', 'Distant spiral galaxy with bright core, star clusters, cosmic dust lanes, space background, 16:9', 'sf'),
            ('bg-10.jpg', 'Starship hangar bay with ships docked, mechanical arms, technicians, sci-fi game background, 16:9', 'sf'),
            ('bg-11.jpg', 'Space debris field with broken satellite parts, floating wreckage, cosmic background, 16:9', 'sf'),
            ('bg-12.jpg', 'Alien atmosphere entry with fire and plasma around ship, clouds below, game background, 16:9', 'sf'),
            ('bg-13.jpg', 'Alien ocean world with water geysers, strange islands, colorful atmosphere, game background, 16:9', 'cf'),
            ('bg-14.jpg', 'Space station in high orbit above ringed planet, city lights on station, game background, 16:9', 'cf'),
        ],
        'char': [
            ('char-0.jpg', 'Brave astronaut in advanced space suit, helmet with visor reflecting stars, determined pose, character portrait', 'cf'),
            ('char-1.jpg', 'Friendly green alien with large black eyes, slender build, telepathic aura, alien character portrait', 'cf'),
            ('char-2.jpg', 'Menacing space pirate with cybernetic eye, laser pistol, scarred face, worn space suit, villain portrait', 'cf'),
            ('char-3.jpg', 'Robotic space dog with metal plates, glowing blue eyes, wagging mechanical tail, companion robot', 'cf'),
            ('char-4.jpg', 'Giant space creature with translucent body, floating tentacles, cosmic energy inside, alien monster', 'cf'),
            ('char-5.jpg', 'Mad scientist in lab coat with holographic display, wild hair, crazy eyes, character portrait', 'sf'),
            ('char-6.jpg', 'Ancient alien with crystalline skin, tall elegant form, wise eyes, glowing staff, wise being portrait', 'sf'),
            ('char-7.jpg', 'Space mercenary in combat armor with heavy weapons, scarred, tough expression, warrior portrait', 'sf'),
            ('char-8.jpg', 'Holographic AI assistant, translucent blue feminine form, digital particles, AI character', 'sf'),
            ('char-9.jpg', 'Giant space worm with armored segments, many teeth, emerging from asteroid, monster design', 'sf'),
            ('char-10.jpg', 'Colonist in casual space suit, civilian clothes under, hopeful expression, settler portrait', 'cf'),
            ('char-11.jpg', 'Alien queen with crown-like head crest, royal robes, commanding presence, ruler portrait', 'cf'),
            ('char-12.jpg', 'Android with synthetic skin exposed on face, red LED eye, emotionless expression, robot portrait', 'cf'),
            ('char-13.jpg', 'Space nomad with worn cloak, mysterious mask, carrying exotic weapon, wanderer portrait', 'cf'),
            ('char-14.jpg', 'Giant floating jellyfish-like alien, translucent bell, trailing tentacles, space creature', 'sf'),
        ],
        'item': [
            ('item-0.jpg', 'Glowing star-shaped crystal gem floating, blue energy, magical space artifact, game item on dark', 'cf'),
            ('item-1.jpg', 'Sci-fi laser pistol with sleek design, glowing energy core, weapon on dark background', 'cf'),
            ('item-2.jpg', 'Handheld scanner device with holographic display screen, tech tool on dark background', 'cf'),
            ('item-3.jpg', 'Magnetic keycard with holographic strip, access card on dark background', 'cf'),
            ('item-4.jpg', 'Holographic star map showing star systems, navigation data, game item on dark', 'cf'),
            ('item-5.jpg', 'Alien plant in glass terrarium, glowing leaves, exotic flora, game item on dark', 'sf'),
            ('item-6.jpg', 'Data chip with golden contacts, storage device, digital information, game item on dark', 'sf'),
            ('item-7.jpg', 'Energy shield generator, metallic disc with blue field, protective device on dark', 'sf'),
            ('item-8.jpg', 'Alien artifact with unknown symbols, stone material, ancient, game item on dark', 'sf'),
            ('item-9.jpg', 'Health pack with red cross, futuristic medical kit, healing item on dark', 'sf'),
            ('item-10.jpg', 'Jetpack with thrusters, backpack style, flying equipment on dark background', 'cf'),
            ('item-11.jpg', 'Communication device with antenna, radio, space walkie-talkie on dark', 'cf'),
            ('item-12.jpg', 'Oxygen tank with pressure gauge, life support equipment on dark background', 'cf'),
            ('item-13.jpg', 'Space suit helmet with gold visor, reflective surface, headgear on dark', 'cf'),
            ('item-14.jpg', 'Ancient scroll with alien writing, floating text, knowledge item on dark', 'sf'),
        ],
    },
    'haunted-village': {
        'bg': [
            ('bg-0.jpg', 'Abandoned village in thick fog, old wooden houses, broken windows, crooked fence, moonlight, horror game bg, 16:9', 'cf'),
            ('bg-1.jpg', 'Old cemetery with crooked tombstones, dead tree, iron gate, mist on ground, full moon, horror bg, 16:9', 'cf'),
            ('bg-2.jpg', 'Abandoned Victorian mansion overgrown with ivy, broken windows, dark clouds, horror game bg, 16:9', 'cf'),
            ('bg-3.jpg', 'Dark misty forest with twisted bare trees, fog between trunks, dim moonlight, horror game bg, 16:9', 'cf'),
            ('bg-4.jpg', 'Abandoned stone church with broken stained glass, crumbling walls, graveyard, horror game bg, 16:9', 'cf'),
            ('bg-5.jpg', 'Underground crypt with stone coffins, cobwebs, dim candlelight, dusty, horror game bg, 16:9', 'cf'),
            ('bg-6.jpg', 'Dark attic filled with old furniture, dusty trunks, single window with moonlight, horror bg, 16:9', 'cf'),
            ('bg-7.jpg', 'Stone cellar with wine racks, spider webs, dark corners, damp, horror game background, 16:9', 'sf'),
            ('bg-8.jpg', 'Overgrown graveyard with broken angel statues, fog, dead flowers, horror game bg, 16:9', 'sf'),
            ('bg-9.jpg', 'Ritual chamber with candles in circle, occult symbols on floor, dark altar, horror game bg, 16:9', 'sf'),
            ('bg-10.jpg', 'Foggy pond with dead trees reflecting in still water, mist, horror atmosphere bg, 16:9', 'sf'),
            ('bg-11.jpg', 'Old iron gate to the village, rusted, overgrown, warning signs, horror game bg, 16:9', 'sf'),
            ('bg-12.jpg', 'Abandoned bell tower with broken bell, pigeon nests, decaying wood, horror bg, 16:9', 'sf'),
            ('bg-13.jpg', 'Old stone bridge over foggy ravine, mossy, crumbling, horror game background, 16:9', 'cf'),
            ('bg-14.jpg', 'Sacrificial stone altar in forest clearing, blood stains, candles, horror game bg, 16:9', 'cf'),
        ],
        'char': [
            ('char-0.jpg', 'Investigator in trench coat with flashlight, determined expression, horror character portrait', 'cf'),
            ('char-1.jpg', 'Ghostly spirit guide in white flowing robe, translucent, kind eyes, supernatural being portrait', 'cf'),
            ('char-2.jpg', 'Translucent screaming ghost with hollow eyes, reaching hands, floating, horror creature design', 'cf'),
            ('char-3.jpg', 'Black cat with glowing green eyes, arched back, fur standing, supernatural animal', 'cf'),
            ('char-4.jpg', 'Witch with long black hair, dark robe, carrying a lantern, evil grin, villain portrait', 'cf'),
            ('char-5.jpg', 'Vampire with pale skin, red eyes, fangs, elegant black suit, charming evil, monster portrait', 'sf'),
            ('char-6.jpg', 'Werewolf in mid-transformation, fur and claws, glowing yellow eyes, beast portrait', 'sf'),
            ('char-7.jpg', 'Cultist in dark hooded robe, carrying a dagger, hidden face, menacing figure', 'sf'),
            ('char-8.jpg', 'Little ghost girl in old-fashioned white dress, hollow eyes, sad expression, spirit portrait', 'sf'),
            ('char-9.jpg', 'Giant spider with many eyes, hairy legs, venomous fangs, horror creature design', 'sf'),
            ('char-10.jpg', 'Priest with cross and holy water, brave expression, religious robes, protector portrait', 'cf'),
            ('char-11.jpg', 'Shadow figure with no distinct features, darkness personified, tall and thin, horror', 'cf'),
            ('char-12.jpg', 'Zombie with rotting flesh, torn clothes, reaching arms, shambling, undead creature', 'cf'),
            ('char-13.jpg', 'Banshee with long flowing white hair, pale blue skin, open mouth screaming, spirit', 'cf'),
            ('char-14.jpg', 'Dark entity made of swirling shadow and red eyes, floating, demonic, horror monster', 'sf'),
        ],
        'item': [
            ('item-0.jpg', 'Old flickering candle holder with wax drips, brass, dim flame, game item on dark', 'cf'),
            ('item-1.jpg', 'Ancient wooden cross with silver inlay, religious symbol on dark background', 'cf'),
            ('item-2.jpg', 'Handheld flashlight with bright beam, survival tool on dark background', 'cf'),
            ('item-3.jpg', 'Iron key with ornate head, rusted, old, mysterious, game item on dark background', 'cf'),
            ('item-4.jpg', 'Old parchment map of the village with markings, worn edges, game item on dark', 'cf'),
            ('item-5.jpg', 'Cursed amulet with red gem, dark energy emanating, occult item on dark background', 'sf'),
            ('item-6.jpg', 'Silver dagger with runes on blade, holy weapon, game item on dark background', 'sf'),
            ('item-7.jpg', 'Old leather-bound spell book with skull on cover, occult, game item on dark', 'sf'),
            ('item-8.jpg', 'Glass bottle with glowing blue liquid, potion, mysterious on dark background', 'sf'),
            ('item-9.jpg', 'Tarot card showing Death arcana, mysterious deck, divination item on dark', 'sf'),
            ('item-10.jpg', 'Wooden stake sharpened at tip, vampire killing tool on dark background', 'cf'),
            ('item-11.jpg', 'Bottle of holy water with cross symbol, blessed liquid on dark background', 'cf'),
            ('item-12.jpg', 'Old pocket watch with stopped hands, silver chain, mysterious on dark', 'cf'),
            ('item-13.jpg', 'Dusty lantern with yellow flame, glass shield, light source on dark', 'cf'),
            ('item-14.jpg', 'Ancient scroll with blood red seal, cursed manuscript on dark background', 'sf'),
        ],
    },
}

# Also generate center-earth if needed (already done, but include for completeness)
# Will be skipped if files already exist

async def gen_theme(sem, theme_id, images, idx_offset, total):
    """Generate all images for one theme."""
    count = 0
    for cat_name, items in images.items():
        for filename, prompt, provider in items:
            count += 1
            idx = idx_offset + count
            out_dir = OUT / theme_id
            out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / filename

            if out_path.exists() and out_path.stat().st_size > 10000:
                kb = out_path.stat().st_size // 1024
                print(f'[{idx}/{total}] ⏭️ {theme_id}/{filename} ({kb}KB)')
                continue

            tag = f'[{idx}/{total}] {theme_id}/{filename}'
            async with sem:
                for attempt in range(3):
                    cmd = [
                        PYTHON, str(SKILL),
                        '--purpose', 'auto',
                        '--prompt', prompt,
                        '--output', str(out_path),
                        '--timeout', '120',
                    ]
                    proc = await asyncio.create_subprocess_exec(
                        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
                    )
                    try:
                        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=180)
                        if proc.returncode == 0 and out_path.exists() and out_path.stat().st_size > 10000:
                            kb = out_path.stat().st_size // 1024
                            print(f'{tag} ✅ {kb}KB')
                            break
                        else:
                            err = stderr.decode()[:80] if stderr else 'unknown'
                            print(f'{tag} ❌ attempt {attempt+1}: {err}')
                    except asyncio.TimeoutError:
                        proc.kill()
                        print(f'{tag} ⏰ timeout attempt {attempt+1}')
                    
                    if attempt < 2:
                        await asyncio.sleep(5)
                else:
                    print(f'{tag} ❌ FAILED')
    
    return count

async def main():
    # Collect all tasks
    all_images = []
    for theme_id, data in THEMES.items():
        for cat, items in data.items():
            for fname, prompt, prov in items:
                all_images.append((theme_id, cat, fname, prompt, prov))
    
    total = len(all_images)
    print(f'Generating {total} images for {len(THEMES)} themes')
    
    # Use semaphore=5 to avoid rate limiting
    sem = asyncio.Semaphore(5)
    
    idx = 0
    for theme_id, data in THEMES.items():
        print(f'\n{"="*50}')
        print(f'{theme_id}: generating {sum(len(v) for v in data.values())} images')
        generated = await gen_theme(sem, theme_id, data, idx, total)
        idx += generated
    
    print(f'\n{"="*50}')
    print('Done!')

if __name__ == '__main__':
    asyncio.run(main())
