import { useState } from "react";
import { Box } from "@mui/material";
import { AppHeader } from "./components/AppHeader";
import { SearchPanel } from "./components/SearchPanel";
import { ImagePanel } from "./components/ImagePanel";
import { RecentSearchesPanel } from "./components/RecentSearchesPanel";
import { mockTracks, mockRecentSearches } from "./mock/mockTracks";
import type { Track, ViewMode } from "./types";

/**
 * Step 1: static UI scaffold. State here is intentionally shallow and local —
 * it exists only to make the layout interactive to look at. The real
 * data-fetching, debouncing, pagination-cursor, and storage logic land in a
 * later step behind these same component props, so nothing here should need
 * to change shape when that happens.
 */
export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(mockRecentSearches);
  const [status] = useState<"idle" | "loading" | "error" | "ready">("ready");

  const handleSearch = (term: string) => {
    setRecentSearches((prev) => {
      const deduped = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      return [term, ...deduped].slice(0, 5);
    });
  };

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaying(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader />

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
            tracks={mockTracks}
            viewMode={viewMode}
            selectedTrackId={selectedTrack?.id}
            status={status}
            hasPrevious={false}
            hasNext={true}
            onSearch={handleSearch}
            onSelectTrack={handleSelectTrack}
            onRetry={() => {}}
            onPrevious={() => {}}
            onNext={() => {}}
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
          <RecentSearchesPanel
            searches={recentSearches}
            onSelect={handleSearch}
          />
        </Box>
      </Box>
    </Box>
  );
}
