# THE SCHOOL CHRONICLES

A third-person 3D anime-inspired school-life exploration game for web and Android.

## Current playable foundation

- React + TypeScript + Vite application.
- Three.js rendered through React Three Fiber.
- Live 3D academy courtyard with academy buildings, library, classrooms, trees, benches and fountain.
- Third-person follow camera and a simple player prototype.
- Keyboard movement: WASD / arrow keys; Shift to run.
- Clickable discovery markers for campus locations.
- Mobile touch movement pad.
- Cinematic title screen over a live 3D environment.
- Settings persisted locally in the browser.
- Capacitor configuration foundation for later Android packaging.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Vercel

Framework preset: Vite  
Build command: `npm run build`  
Output directory: `dist`  
Install command: `npm install`

## Architecture direction

- React / TypeScript: application and game systems.
- Three.js / React Three Fiber / Drei: 3D rendering and scene components.
- Rapier: planned physics and collision layer.
- Zustand: planned shared game state.
- IndexedDB: planned game-save persistence.
- Capacitor: planned Android packaging.

## Current limitations

This is an early playable 3D foundation, not the complete game. The academy uses procedural placeholder geometry and simple materials; final anime character models, detailed campus art, animations, NPC schedules, dialogue, school simulation, missions, relationships, story chapters, robust save slots, audio and Android APK packaging are still in development. The current player is a temporary prototype character. Mobile touch movement is basic and needs device testing.

## Project scope

This repository is independent and starts from zero. Do not merge code or assets from unrelated projects. Build the full game incrementally, keeping the web and Android targets performant.
