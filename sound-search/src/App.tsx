import { useState } from "react";
import { Box } from "@mui/material";
import { SearchPanel } from "./components/SearchPanel";
import { ImagePanel } from "./components/ImagePanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import type { Track, ViewMode } from "./types";
import { mockRecentSearches } from "./mock/mockTracks";

/**
 * Step: the search results panel is now backed by `soundApiClient` (via
 * `useTrackSearch`) instead of a static mock array. Recent-searches
 * persistence and the view-mode-remembered-across-visits bonus still live
 * here as local state for now — those are the next step.
 */
export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(mockRecentSearches);

  const recordSearch = (term: string) => {
    setRecentSearches((prev) => {
      const deduped = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      return [term, ...deduped].slice(0, 5);
    });
  };

  const {
    query,
    tracks,
    status,
    errorMessage,
    hasNext,
    hasPrevious,
    updateQuery,
    submitSearch,
    goNext,
    goPrevious,
    retry,
  } = useTrackSearch(recordSearch);

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaying(false);
  };

  return (
    // FIX 1: Use 100dvh to prevent layout jumping on mobile dynamic address bars
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* <AppHeader /> */}

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "grid",
          gap: 2.5,
          p: { xs: 2, md: 3 },
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1.3fr 1fr 1fr",
          },
          alignItems: "start",
        }}
      >
        {/* FIX 2: Swap overflow: 'hidden' to overflowY: 'auto' so content scrolls vertically instead of clipping */}
        {/* FIX 3: Remove strict minHeight on mobile screens to allow natural shrinking */}
        <Box
          sx={{
            minHeight: { xs: "auto", md: 400 },
            maxHeight: { lg: "calc(100vh - 48px)" },
            minWidth: 0,
            overflowY: "auto",
            gridColumn: { xs: "span 1", md: "span 2", lg: "span 1" },
          }}
        >
          <SearchPanel
            tracks={tracks}
            viewMode={viewMode}
            selectedTrackId={selectedTrack?.id}
            status={status}
            errorMessage={errorMessage}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            query={query}
            onQueryChange={updateQuery}
            onSubmitSearch={submitSearch}
            onSelectTrack={handleSelectTrack}
            onRetry={retry}
            onPrevious={goPrevious}
            onNext={goNext}
            onViewModeChange={setViewMode}
          />
        </Box>

        <Box
          sx={{
            minHeight: { xs: "auto", md: 400 },
            maxHeight: { lg: "calc(100vh - 48px)" },
            minWidth: 0,
            overflowY: "auto",
          }}
        >
          <ImagePanel
            track={selectedTrack}
            isPlaying={isPlaying}
            onImageClick={() => setIsPlaying((p) => !p)}
          />
        </Box>

        <Box
          sx={{
            minHeight: { xs: "auto", md: 400 },
            maxHeight: { lg: "calc(100vh - 48px)" },
            minWidth: 0,
            overflowY: "auto",
          }}
        >
          <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
        </Box>
      </Box>
    </Box>
  );
}