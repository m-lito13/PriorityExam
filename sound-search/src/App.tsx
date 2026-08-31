import { useState } from "react";
import { Box, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import HistoryIcon from "@mui/icons-material/History";
import { SearchPanel } from "./components/SearchPanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { TrackPanel } from "./components/TrackPanel";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { useIsMobileDevice } from "./hooks/useIsMobileDevice";
import type { Track, ViewMode } from "./types";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
        height: isMobileDevice ? "100dvh" : { xs: "auto", md: "100dvh" },
        // Guarantees desktop panels never squish below 550px vertical height
        minHeight: isMobileDevice ? undefined : { md: 550 },
        // Switches to browser page scrolling only when window height < 550px
        overflowY: isMobileDevice ? "hidden" : "auto",
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          p: { xs: 2, md: 3 },
          gap: 2.5,
          display: isMobileDevice ? "block" : "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Search Panel */}
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

        {/* Track Details Panel */}
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

        {/* Recent Searches Panel */}
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

      {/* Rendered exclusively on touch-first mobile hardware */}
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