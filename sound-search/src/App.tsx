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
import { LAYOUT_CONFIG } from "./const/layout";

const TABS = { search: 0, nowPlaying: 1, history: 2 } as const;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(TABS.search);

  // JS Hook handles phone-specific tab state (< 600px touch screens)
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
      setActiveTab(TABS.nowPlaying);
    }
  };

  // Standardized panel box styles leveraging JS mobile flag & theme breakpoints
  const panelWrapperSx = {
    width: "100%",
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    height: isMobileDevice ? "100%" : { xs: "auto", lg: "100%" },
  } as const;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: LAYOUT_CONFIG.MIN_WIDTH,
        height: isMobileDevice ? "100dvh" : { xs: "auto", lg: "100dvh" },
        minHeight: isMobileDevice ? undefined : { lg: LAYOUT_CONFIG.MIN_DESKTOP_HEIGHT },
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
          // Stack vertically on phones & tablets; side-by-side row layout ONLY at >= 1200px (lg)
          flexDirection: isMobileDevice ? "column" : { xs: "column", lg: "row" },
          overflow: isMobileDevice ? "hidden" : { xs: "visible", lg: "hidden" },
        }}
      >
        {/* SEARCH PANEL */}
        {(!isMobileDevice || activeTab === TABS.search) && (
          <Box sx={{ ...panelWrapperSx, flex: { lg: 1.3 } }}>
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
          <Box sx={{ ...panelWrapperSx, flex: { lg: 1 } }}>
            <TrackPanel
              track={selectedTrack}
              isPlaying={isPlaying}
              onImageClick={() => setIsPlaying((prev) => !prev)}
            />
          </Box>
        )}

        {/* RECENT SEARCHES PANEL */}
        {(!isMobileDevice || activeTab === TABS.history) && (
          <Box sx={{ ...panelWrapperSx, flex: { lg: 1 } }}>
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