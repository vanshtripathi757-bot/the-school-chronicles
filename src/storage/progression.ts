export interface PlayerProgression {
  experience: number;
  level: number;
}
const STORAGE_KEY = "tsc-progression-v1";
const DEFAULT_PROGRESSION: PlayerProgression = { experience: 0, level: 1 };

function normalize(value: unknown): PlayerProgression {
  if (!value || typeof value !== "object") return { ...DEFAULT_PROGRESSION };
  const data = value as Record<string, unknown>;
  const experience = typeof data.experience === "number" && Number.isFinite(data.experience)
    ? Math.max(0, Math.floor(data.experience))
    : 0;
  return { experience, level: Math.floor(experience / 100) + 1 };
}

export function loadProgression(): PlayerProgression {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : { ...DEFAULT_PROGRESSION };
  } catch {
    return { ...DEFAULT_PROGRESSION };
  }
}

export function saveProgression(value: PlayerProgression): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(value)));
  } catch {
    // Progress remains available for the current session.
  }
}

export function awardExperience(value: PlayerProgression, amount: number): PlayerProgression {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
  return normalize({ experience: value.experience + safeAmount });
}

export function resetProgression(): PlayerProgression {
  const empty = { ...DEFAULT_PROGRESSION };
  saveProgression(empty);
  return empty;
}
