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

const MIN_LAYOUT_WIDTH = 320;
const MIN_DESKTOP_HEIGHT = 550;
const TABS = { search: 0, nowPlaying: 1, history: 2 } as const;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(TABS.search);

  // Hook detects strictly phone-sized touch viewports (< 600px)
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

    // Auto-switch tab on phone devices when selecting a track
    if (isMobileDevice) {
      setActiveTab(TABS.nowPlaying);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: MIN_LAYOUT_WIDTH,
        // Phones lock to viewport height; Tablets scroll normally; Desktops (>= 1200px) lock height
        height: isMobileDevice ? "100dvh" : { xs: "auto", lg: "100dvh" },
        minHeight: isMobileDevice ? undefined : { lg: MIN_DESKTOP_HEIGHT },
        overflowX: "hidden",
        overflowY: isMobileDevice ? "hidden" : { xs: "auto", lg: "hidden" },
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          p: { xs: 2, md: 3 },
          gap: 2.5,
          display: "flex",
          // Stack panels vertically on phones & tablets; side-by-side row layout ONLY at >= 1200px (lg)
          flexDirection: isMobileDevice ? "column" : { xs: "column", lg: "row" },
          overflow: isMobileDevice ? "hidden" : { xs: "visible", lg: "hidden" },
        }}
      >
        {/* SEARCH PANEL */}
        {(!isMobileDevice || activeTab === TABS.search) && (
          <Box
            sx={{
              flex: { lg: 1.3 },
              width: "100%",
              minWidth: 0,
              height: isMobileDevice ? "100%" : { xs: "auto", lg: "100%" },
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
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

        {/* TRACK PLAYER PANEL */}
        {(!isMobileDevice || activeTab === TABS.nowPlaying) && (
          <Box
            sx={{
              flex: { lg: 1 },
              width: "100%",
              minWidth: 0,
              height: isMobileDevice ? "100%" : { xs: "auto", lg: "100%" },
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TrackPanel
              track={selectedTrack}
              isPlaying={isPlaying}
              onImageClick={() => setIsPlaying((prev) => !prev)}
            />
          </Box>
        )}

        {/* RECENT SEARCHES PANEL */}
        {(!isMobileDevice || activeTab === TABS.history) && (
          <Box
            sx={{
              flex: { lg: 1 },
              width: "100%",
              minWidth: 0,
              height: isMobileDevice ? "100%" : { xs: "auto", lg: "100%" },
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
          </Box>
        )}
      </Box>

      {/* MOBILE BOTTOM NAVIGATION (Phones Only) */}
      {isMobileDevice && (
        <Paper elevation={3} sx={{ flexShrink: 0, zIndex: 10, borderRadius: 0 }}>
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