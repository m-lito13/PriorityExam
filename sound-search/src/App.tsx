import { useState } from "react";
import { Box, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import HistoryIcon from "@mui/icons-material/History";
import { SearchPanel } from "./components/SearchPanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { useIsMobileDevice } from "./hooks/useIsMobileDevice";
import type { Track, ViewMode } from "./types";
import { TrackPanel } from "./components/TrackPanel";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 1. Hardware detection for touch mobile devices
  const isMobileDevice = useIsMobileDevice();

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
    if (isMobileDevice) {
      setActiveTab(1);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 320,
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          p: { xs: 2, md: 3 },
          gap: 2.5,
          // Mobile hardware uses block display for tab switching;
          // Desktop uses flex/grid responsive reflow
          display: isMobileDevice ? "block" : "flex",
          flexDirection: { xs: "column", md: "row" },
          overflowY: isMobileDevice ? "hidden" : { xs: "auto", md: "hidden" },
        }}
      >
        {/* Panel 1: Search */}
        {(!isMobileDevice || activeTab === 0) && (
          <Box
            sx={{
              flex: { md: 1.3 },
              minWidth: 0,
              height: isMobileDevice ? "100%" : { xs: "auto", md: "100%" },
              minHeight: { md: 0 },
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
        )}

        {/* Panel 2: Track Details */}
        {(!isMobileDevice || activeTab === 1) && (
          <Box
            sx={{
              flex: { md: 1 },
              minWidth: 0,
              height: isMobileDevice ? "100%" : { xs: "auto", md: "100%" },
              minHeight: { md: 0 },
            }}
          >
            <TrackPanel
              track={selectedTrack}
              isPlaying={isPlaying}
              onImageClick={() => setIsPlaying((p) => !p)}
            />
          </Box>
        )}

        {/* Panel 3: Recent Searches */}
        {(!isMobileDevice || activeTab === 2) && (
          <Box
            sx={{
              flex: { md: 1 },
              minWidth: 0,
              height: isMobileDevice ? "100%" : { xs: "auto", md: "100%" },
              minHeight: { md: 0 },
            }}
          >
            <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
          </Box>
        )}
      </Box>

      {/* Rendered only on physical mobile devices */}
      {isMobileDevice && (
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