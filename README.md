# THE SCHOOL CHRONICLES

A new 2D anime school-life simulation / visual novel / RPG project.

## Phase 1 foundation

- React + TypeScript + Vite application shell
- Phaser 3 scene bootstrap
- Main menu with New Game, Continue, Load Game, Settings and Credits
- Local settings persistence
- IndexedDB/save architecture is intentionally deferred; Phase 1 currently stores preferences in localStorage
- Capacitor configuration foundation

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

## Scope

This repository is independent and starts from zero. Dialogue, campus exploration, NPCs, relationships, missions, full save slots and Android packaging are future phases.

## Current limitations

- No original final art assets have been added yet; the menu uses an authored gradient environment.
- Save slots are not implemented; Continue accurately reports that no save is available.
- The Phase 1 storage implementation persists settings only. IndexedDB game-save schema is planned for a later foundation update.
- Android platform project/APK has not been generated.
