export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  dialogueSpeed: "slow" | "normal" | "fast";
}

const KEY = "tsc-settings-v1";
export const defaultSettings: GameSettings = {
  masterVolume: 80, musicVolume: 70, effectsVolume: 80, dialogueSpeed: "normal"
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const value = JSON.parse(raw) as Partial<GameSettings>;
    return { ...defaultSettings, ...value };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}