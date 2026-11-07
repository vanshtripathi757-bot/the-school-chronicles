export type MissionId = "meet-aiko" | "visit-library" | "visit-cafeteria";
export type MissionMap = Record<MissionId, boolean>;

export const MISSION_LABELS: Record<MissionId, string> = {
  "meet-aiko": "Meet Aiko in the courtyard",
  "visit-library": "Explore the library",
  "visit-cafeteria": "Visit the cafeteria"
};

const STORAGE_KEY = "tsc-missions-v1";
const EMPTY_MISSIONS: MissionMap = {
  "meet-aiko": false,
  "visit-library": false,
  "visit-cafeteria": false
};

function normalize(value: unknown): MissionMap {
  if (!value || typeof value !== "object") return { ...EMPTY_MISSIONS };
  const data = value as Record<string, unknown>;
  return {
    "meet-aiko": data["meet-aiko"] === true,
    "visit-library": data["visit-library"] === true,
    "visit-cafeteria": data["visit-cafeteria"] === true
  };
}

export function loadMissions(): MissionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : { ...EMPTY_MISSIONS };
  } catch {
    return { ...EMPTY_MISSIONS };
  }
}

export function saveMissions(missions: MissionMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(missions)));
  } catch {
    // Keep mission progress available for the current session.
  }
}

export function completeMission(missions: MissionMap, id: MissionId): MissionMap {
  if (missions[id]) return missions;
  return { ...missions, [id]: true };
}

export function resetMissions(): MissionMap {
  const empty = { ...EMPTY_MISSIONS };
  saveMissions(empty);
  return empty;
}
