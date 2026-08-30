// Domain types for Step 1 (UI scaffold with mock data).
// These will be reused as-is by the real data layer in a later step.

export interface Track {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  embedUrl: string;
}

export interface SearchHistoryEntry {
  term: string;
  searchedAt: number;
}

export type ViewMode = "list" | "tile";
