export interface SavedGame {
  version: 1;
  savedAt: number;
  interior: string | null;
}

const SAVE_KEY = "tsc-save-v1";
const POSITION_KEY = "tsc-player-position-v1";

export function saveGame(interior: string | null): SavedGame {
  const data: SavedGame = { version: 1, savedAt: Date.now(), interior };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  return data;
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SavedGame>;
    if (value.version !== 1 || typeof value.savedAt !== "number") return null;
    return { version: 1, savedAt: value.savedAt, interior: typeof value.interior === "string" ? value.interior : null };
  } catch {
    return null;
  }
}

export type PlayerPosition = { x: number; z: number };

export function savePlayerPosition(position: PlayerPosition): void {
  localStorage.setItem(POSITION_KEY, JSON.stringify(position));
}

export function loadPlayerPosition(): PlayerPosition {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return { x: 0, z: 7 };
    const value = JSON.parse(raw) as Partial<PlayerPosition>;
    if (typeof value.x !== "number" || typeof value.z !== "number") return { x: 0, z: 7 };
    return { x: Math.max(-58, Math.min(58, value.x)), z: Math.max(-58, Math.min(58, value.z)) };
  } catch {
    return { x: 0, z: 7 };
  }
}
