# Adventure Game Enhancement

Upgrade the AI text adventure game with rich imagery and infinite play mode.

## Goals
- [x] Add infinite mode (continue after ending)
- [x] Image display system (bg + chars + items on canvas)
- [x] center-earth: 45/45 images + full mapping ✅
- [ ] Other 9 themes: generate 45 images each (405 total)

## Checklist
- [x] Game logic: infinite mode after ending
- [x] Image display system
- [x] spriteLoader: per-theme mapping
- [x] center-earth: 45/45 ✅
- [ ] space: 0/45
- [ ] haunted-village: 0/45
- [ ] wild-west: 0/45
- [ ] deep-sea: 0/45
- [ ] tomb-raiding: 0/45
- [ ] apocalypse: 0/45
- [ ] magic-academy: 0/45
- [ ] cyberpunk: 0/45
- [ ] lost-civilization: 0/45

## Notes
- Core redesign: ONE image per turn (AI selects, keyword fallback)
- Literary style: random famous work per theme injected in prompts
- imageRegistry.ts: 45 images with keywords per theme
- center-earth (45) + space (45) fully generated + registered
- Infinite mode implemented
- ✅ Prefetch system (PREFETCH_DEPTH=2, configurable)
- ✅ Cached choices load instantly — no transition
- ✅ Transition overlay opacity reduced to 0.3
- ✅ Cache miss still shows brief spinner
- ✅ Max tokens reduced
- Remaining: haunted-village needs 40 more, other 7 themes need 45 each
