import { useState } from "react";
import { Box } from "@mui/material";
import { AppHeader } from "./components/AppHeader";
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* <AppHeader /> */}

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "grid",
          gap: 2.5,
          p: { xs: 2, md: 3 },
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Box sx={{ minHeight: 480 }}>
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

        <Box sx={{ minHeight: 480 }}>
          <ImagePanel
            track={selectedTrack}
            isPlaying={isPlaying}
            onImageClick={() => setIsPlaying((p) => !p)}
          />
        </Box>

        <Box sx={{ minHeight: 480 }}>
          <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
        </Box>
      </Box>
    </Box>
  );
}
