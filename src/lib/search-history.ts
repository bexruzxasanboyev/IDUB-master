const STORAGE_KEY = "idub_search_history";
const MAX_ITEMS = 12;

export type SearchHistoryItem = {
  query: string;
  timestamp: number;
};

function read(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.query === "string" && item.query.trim()
    );
  } catch {
    return [];
  }
}

function write(items: SearchHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // ignore storage errors
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  return read();
}

export function addSearchHistory(query: string) {
  const clean = query.trim();
  if (!clean) return;
  const existing = read();
  const filtered = existing.filter(
    (item) => item.query.toLowerCase() !== clean.toLowerCase()
  );
  const next: SearchHistoryItem[] = [
    { query: clean, timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_ITEMS);
  write(next);
}

export function removeSearchHistory(query: string) {
  const existing = read();
  write(existing.filter((item) => item.query !== query));
}

export function clearSearchHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
