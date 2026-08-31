import { useState } from "react";
import { Box } from "@mui/material";
import { AppHeader } from "./components/AppHeader";
import { SearchPanel } from "./components/SearchPanel";
import { ImagePanel } from "./components/ImagePanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import type { Track, ViewMode } from "./types";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  const { recentSearches, recordSearch } = useRecentSearches();

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
    // The fixed-height, hidden-overflow "dashboard" behavior (panels fill
    // the screen and scroll internally) only makes sense once the 3-column
    // layout kicks in at md. Below md the panels stack, so three full
    // panels are always taller than one screen — forcing a fixed height
    // there just clips content. So all of the height/overflow rules below
    // are md-only; omitted below md, everything defaults back to normal
    // content-sized, scrollable document flow.
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        height: { md: "100dvh" },
        overflowX: "hidden",
        overflowY: { md: "hidden" },
      }}
    >
      <AppHeader />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: { md: 0 },
          overflow: { md: "hidden" },
          display: "grid",
          gap: 2.5,
          p: { xs: 2, md: 3 },
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 1fr" },
        }}
      >
        <Box sx={{ minWidth: 0, height: { md: "100%" }, minHeight: { md: 0 } }}>
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

        <Box sx={{ minWidth: 0, height: { md: "100%" }, minHeight: { md: 0 } }}>
          <ImagePanel
            track={selectedTrack}
            isPlaying={isPlaying}
            onImageClick={() => setIsPlaying((p) => !p)}
          />
        </Box>

        <Box sx={{ minWidth: 0, height: { md: "100%" }, minHeight: { md: 0 } }}>
          <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
        </Box>
      </Box>
    </Box>
  );
}
