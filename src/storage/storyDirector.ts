export type StoryKind = "adventure" | "quiz" | "test" | "event";
export interface StoryPack {
  id: string;
  kind: StoryKind;
  title: string;
  summary: string;
  chapter: string;
  location: string;
  storyText: string;
  unlockAtXp: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  completed?: boolean;
  answered?: boolean;
}
export interface StoryDirectorState {
  lastGeneratedAt: number;
  items: StoryPack[];
}
const KEY = "tsc-story-director-v1";
const EMPTY: StoryDirectorState = { lastGeneratedAt: 0, items: [] };

export function loadStoryDirector(): StoryDirectorState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const value = JSON.parse(raw) as Partial<StoryDirectorState>;
    return {
      lastGeneratedAt: typeof value.lastGeneratedAt === "number" ? value.lastGeneratedAt : 0,
      items: Array.isArray(value.items) ? value.items.filter((item): item is StoryPack =>
        !!item && typeof item.id === "string" && typeof item.title === "string" &&
        typeof item.unlockAtXp === "number" && Array.isArray(item.options) &&
        item.options.length === 4 && typeof item.correctOption === "number"
      ).slice(-12) : []
    };
  } catch { return EMPTY; }
}
export function saveStoryDirector(state: StoryDirectorState): void {
  try { localStorage.setItem(KEY, JSON.stringify({ ...state, items: state.items.slice(-12) })); }
  catch { /* Story content remains usable for this session. */ }
}
export function canGenerateStory(state: StoryDirectorState): boolean {
  return Date.now() - state.lastGeneratedAt >= 24 * 60 * 60 * 1000;
}
