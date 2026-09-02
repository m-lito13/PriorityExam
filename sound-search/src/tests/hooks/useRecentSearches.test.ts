// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRecentSearches } from "../../hooks/useRecentSearches";

// Mirrors the hook's own private STORAGE_KEY — not exported, so the exact
// string has to be duplicated here to seed/inspect localStorage directly.
const STORAGE_KEY = "sound-search:recent-searches";

describe("useRecentSearches", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty list when nothing has ever been stored", () => {
    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
  });

  it("reads a previously stored history", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["Aphex Twin", "Boards of Canada"]));

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual(["Aphex Twin", "Boards of Canada"]);
  });

  it("falls back to an empty list when the stored value is malformed", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
  });

  it("adds a new search to the front of the list", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.recordSearch("Four Tet");
    });

    expect(result.current.recentSearches).toEqual(["Four Tet"]);
  });

  it("de-dupes case-insensitively, moving the repeated term back to the front", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["Radiohead", "Four Tet"]));
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.recordSearch("radiohead");
    });

    expect(result.current.recentSearches).toEqual(["radiohead", "Four Tet"]);
  });

  it("caps history at 5 entries, dropping the oldest", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      ["a", "b", "c", "d", "e", "f"].forEach((term) => result.current.recordSearch(term));
    });

    expect(result.current.recentSearches).toEqual(["f", "e", "d", "c", "b"]);
  });

  it("persists changes to localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.recordSearch("Floating Points");
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["Floating Points"]);
  });
});
