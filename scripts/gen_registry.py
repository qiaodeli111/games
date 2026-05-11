#!/usr/bin/env python3
"""Generate imageRegistry.ts entries for all themes."""
import json
from pathlib import Path

prompts = json.loads(Path('scripts/image_prompts.json').read_text())
existing = json.loads(Path('scripts/existing_registry.json').read_text()) if Path('scripts/existing_registry.json').exists() else {}

# Build registry entries for each theme
# We already have center-earth and space in the file, so we skip them
registry = {}

for theme_id, data in prompts.items():
    entries = []
    for cat, files in data.items():
        type_map = {'bg': 'scene', 'char': 'character', 'item': 'item'}
        etype = type_map[cat]
        for fname, prompt in files.items():
            # Generate keywords from prompt
            words = prompt.lower().replace(',', ' ').replace('.', ' ').split()
            keywords = list(set(w for w in words if len(w) > 3 and w not in 
                ['with', 'and', 'the', 'for', 'from', 'that', 'this', 'dark', 'game', 'background', 'portrait', 'underwater', 'adventure', 'fantasy', 'horror', 'survival', 'sci-fi', 'cyberpunk', 'on', '16:9']))
            entries.append({
                'file': fname,
                'type': etype,
                'description': prompt,
                'keywords': keywords[:8]
            })
    registry[theme_id] = entries

Path('scripts/registry_data.json').write_text(json.dumps(registry, ensure_ascii=False, indent=2))
print(f'Generated registry for {len(registry)} themes')
for t, e in registry.items():
    print(f'  {t}: {len(e)} entries')
