import { useState } from "react";
import { Box } from "@mui/material";
import { SearchPanel } from "./components/SearchPanel";
import { ImagePanel } from "./components/ImagePanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import type { Track, ViewMode } from "./types";
import { mockRecentSearches } from "./mock/mockTracks";

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
    <Box
      sx={{
        height: { xs: "100dvh", md: "auto" },
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* <AppHeader /> */}

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "grid",
          gap: { xs: 1.5, md: 2.5 },
          p: { xs: 1.5, md: 3 },
          // Equal 3-row split on mobile, side-by-side columns on larger screens
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1.3fr 1fr 1fr",
          },
          gridTemplateRows: {
            xs: "repeat(3, minmax(0, 1fr))",
            md: "none",
          },
          alignItems: "stretch",
          height: { xs: "100%", md: "auto" },
        }}
      >
        <Box
          sx={{
            minHeight: 0,
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
            minHeight: 0,
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
            minHeight: 0,
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