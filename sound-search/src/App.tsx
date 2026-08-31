import { useState } from "react";
import { Box } from "@mui/material";
import { SearchPanel } from "./components/SearchPanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import type { Track, ViewMode } from "./types";
import { TrackPanel } from "./components/TrackPanel";

const MIN_LAYOUT_WIDTH = 360;
const MIN_LAYOUT_HEIGHT = 640;

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
    notifyResultSelected,
  } = useTrackSearch(recordSearch);

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    notifyResultSelected();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: MIN_LAYOUT_WIDTH,
        minHeight: { xs: MIN_LAYOUT_HEIGHT, md: "100dvh" },
        height: { md: "100dvh" },
        overflowY: { md: "hidden" },
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: { md: 0 },
          overflow: { md: "hidden" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2.5,
          p: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ flex: { md: 1.3 }, minWidth: 0, height: { md: "100%" }, minHeight: { md: 0 } }}>
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

        <Box sx={{ flex: { md: 1 }, minWidth: 0, height: { md: "100%" }, minHeight: { md: 0 } }}>
          <TrackPanel
            track={selectedTrack}
            isPlaying={isPlaying}
            onImageClick={() => setIsPlaying((p) => !p)}
          />
        </Box>

        <Box sx={{ flex: { md: 1 }, minWidth: 0, height: { md: "100%" }, minHeight: { md: 0 } }}>
          <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
        </Box>
      </Box>
    </Box>
  );
}