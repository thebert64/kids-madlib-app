// Remembers which player this browser is in each story, so refreshes and
// polling never swap one kid's identity for another's.

const key = (storyId: string) => `madlibs:player:${storyId}`;

export function rememberPlayer(storyId: string, playerId: string) {
  try {
    localStorage.setItem(key(storyId), playerId);
  } catch {
    // Storage can be blocked (private mode); the URL param still works.
  }
}

export function recallPlayer(storyId: string): string | null {
  try {
    return localStorage.getItem(key(storyId));
  } catch {
    return null;
  }
}
