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
// Only meaningful on desktop: guarantees the 3-column dashboard never
// squishes below a usable height. Mobile has no floor here on purpose —
// its single active tab-panel already scrolls its own content
// internally (see panelSurfaceSx), so there's nothing for a height floor
// to protect against.
const MIN_DESKTOP_HEIGHT = 550;

const TABS = { search: 0, nowPlaying: 1, history: 2 } as const;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(TABS.search);

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
    // On mobile there's no room to show the artwork alongside the results
    // list, so jump the user straight to it — that's the whole point of
    // having tapped a result.
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
        height: isMobileDevice ? "100dvh" : { xs: "auto", md: "100dvh" },
        minHeight: isMobileDevice ? undefined : { md: MIN_DESKTOP_HEIGHT },
        overflowX: "hidden",
        overflowY: isMobileDevice ? "hidden" : { xs: "auto", md: "hidden" },
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
          flexDirection: isMobileDevice ? "column" : { xs: "column", md: "row" },
          overflow: isMobileDevice ? "hidden" : { xs: "visible", md: "hidden" },
        }}
      >
        {(!isMobileDevice || activeTab === TABS.search) && (
          <Box
            sx={{
              flex: { md: 1.3 },
              minWidth: 0,
              height: "100%",
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

        {(!isMobileDevice || activeTab === TABS.nowPlaying) && (
          <Box
            sx={{
              flex: { md: 1 },
              minWidth: 0,
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TrackPanel
              track={selectedTrack}
              isPlaying={isPlaying}
              onImageClick={() => setIsPlaying((p) => !p)}
            />
          </Box>
        )}

        {(!isMobileDevice || activeTab === TABS.history) && (
          <Box
            sx={{
              flex: { md: 1 },
              minWidth: 0,
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <RecentSearchesPanel searches={recentSearches} onSelect={submitSearch} />
          </Box>
        )}
      </Box>

      {isMobileDevice && (
        <Paper elevation={3} sx={{ flexShrink: 0, zIndex: 10 }}>
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
