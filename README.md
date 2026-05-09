# 🎮 AI Games

A collection of classic arcade games built with React + Vite + TypeScript.

## Games

| Game | Description | Controls |
|------|-------------|----------|
| 🐍 贪吃蛇 | Classic Snake game | Arrow keys / WASD |
| 🐦 Flappy Bird | Navigate a bird through pipes | Space / Tap |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/              # React frontend
  components/     # UI components (GameCard, CategoryNav)
  pages/          # Route pages (HomePage, GamePage)
  services/       # API / data services
  types/          # TypeScript types
public/
  data/           # Generated game data (JSON)
  games/          # Iframe game HTML files
    snake/        # Snake game
    flappy/       # Flappy Bird game
scripts/          # Database and data generation scripts
  seed.ts         # Initialize DB with categories and games
  generate-data.ts # Generate JSON from DB for frontend
```

## Adding a New Game

1. Add game files to `public/games/<slug>/`
2. Add the game to the database via scripts or directly
3. Run `npm run build` (auto-regenerates JSON data)

## Tech Stack

- **Frontend**: React 19, React Router 7, TypeScript
- **Games**: Vanilla HTML/JS (runs in iframes)
- **Build**: Vite 8
- **Data**: SQLite → JSON pipeline
