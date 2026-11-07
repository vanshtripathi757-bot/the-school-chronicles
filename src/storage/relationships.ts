export type FriendshipMap = Record<string, number>;

const STORAGE_KEY = "tsc-friendships-v1";
const DEFAULT_FRIENDS = ["Aiko", "Ren", "Mika"];

export function loadFriendships(): FriendshipMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Object.fromEntries(DEFAULT_FRIENDS.map((name) => [name, 0]));
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      DEFAULT_FRIENDS.map((name) => {
        const value = parsed[name];
        return [name, typeof value === "number" && Number.isFinite(value)
          ? Math.max(0, Math.min(100, Math.round(value)))
          : 0];
      })
    );
  } catch {
    return Object.fromEntries(DEFAULT_FRIENDS.map((name) => [name, 0]));
  }
}

export function saveFriendships(friendships: FriendshipMap): void {
  try {
    const safe = Object.fromEntries(
      DEFAULT_FRIENDS.map((name) => [name, Math.max(0, Math.min(100, Math.round(friendships[name] ?? 0)))])
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // Keep the current session playable if browser storage is unavailable.
  }
}

export function increaseFriendship(
  friendships: FriendshipMap,
  name: string,
  amount = 1
): FriendshipMap {
  if (!DEFAULT_FRIENDS.includes(name)) return friendships;
  return {
    ...friendships,
    [name]: Math.max(0, Math.min(100, (friendships[name] ?? 0) + amount))
  };
}

export function resetFriendships(): FriendshipMap {
  const empty = Object.fromEntries(DEFAULT_FRIENDS.map((name) => [name, 0]));
  saveFriendships(empty);
  return empty;
}
