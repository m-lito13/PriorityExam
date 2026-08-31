import { useState } from "react";
import { Box, BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import HistoryIcon from "@mui/icons-material/History";
import { SearchPanel } from "./components/SearchPanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import type { Track, ViewMode } from "./types";
import { TrackPanel } from "./components/TrackPanel";

// const MIN_LAYOUT_WIDTH = 360;
// const MIN_LAYOUT_HEIGHT = 640;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    if (isMobile) {
      setActiveTab(1); // Auto-switch to Now Playing tab on selection on mobile
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: isMobile ? "block" : "grid",
          gridTemplateColumns: "1.3fr 1fr 1fr",
          gap: 2.5,
          p: { xs: 2, md: 3 },
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {(!isMobile || activeTab === 0) && (
          <Box sx={{ height: "100%", minHeight: 0 }}>
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
        )}

        {(!isMobile || activeTab === 1) && (
          <Box sx={{ height: "100%", minHeight: 0 }}>
            <TrackPanel
              track={selectedTrack}
              isPlaying={isPlaying}
              onImageClick={() => setIsPlaying((p) => !p)}
            />
          </Box>
        )}

        {(!isMobile || activeTab === 2) && (
          <Box sx={{ height: "100%", minHeight: 0 }}>
            <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
          </Box>
        )}
      </Box>

      {/* Rendered exclusively on mobile viewports */}
      {isMobile && (
        <Paper elevation={3} sx={{ flexShrink: 0 }}>
          <BottomNavigation
            showLabels
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <BottomNavigationAction label="Search" icon={<SearchIcon />} />
            <BottomNavigationAction label="Now Playing" icon={<MusicNoteIcon />} />
            <BottomNavigationAction label="History" icon={<HistoryIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
