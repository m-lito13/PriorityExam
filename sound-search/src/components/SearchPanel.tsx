import { Paper, Typography, Box } from "@mui/material";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { ResultsFooterControls } from "./ResultsFooterControls";
import type { Track, ViewMode } from "../types";

interface SearchPanelProps {
  tracks: Track[];
  viewMode: ViewMode;
  selectedTrackId?: string;
  status: "idle" | "loading" | "error" | "ready";
  errorMessage?: string;
  hasPrevious: boolean;
  hasNext: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: (value: string) => void;
  onSelectTrack: (track: Track) => void;
  onRetry: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SearchPanel(props: SearchPanelProps) {
  return (
    <Paper
      component="section"
      aria-labelledby="search-panel-heading"
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Pinned Title Header */}
      <Typography
        id="search-panel-heading"
        variant="overline"
        sx={{ color: "text.secondary", mb: 1.5, flexShrink: 0 }}
      >
        Search
      </Typography>

      {/* Pinned Search Input */}
      <Box sx={{ flexShrink: 0 }}>
        <SearchBar
          value={props.query}
          onChange={props.onQueryChange}
          onSubmit={props.onSubmitSearch}
        />
      </Box>

      {/* Internal Bounded Middle Scroll Area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          mt: 2,
          mb: 1,
          overflowY: "auto",
          pr: 0.5,
        }}
      >
        <SearchResults
          tracks={props.tracks}
          viewMode={props.viewMode}
          selectedTrackId={props.selectedTrackId}
          status={props.status}
          errorMessage={props.errorMessage}
          onSelectTrack={props.onSelectTrack}
          onRetry={props.onRetry}
        />
      </Box>

      {/* Pinned Footer Controls */}
      <Box sx={{ flexShrink: 0, mt: "auto" }}>
        <ResultsFooterControls
          viewMode={props.viewMode}
          onViewModeChange={props.onViewModeChange}
          onPrevious={props.onPrevious}
          onNext={props.onNext}
          hasPrevious={props.hasPrevious}
          hasNext={props.hasNext}
        />
      </Box>
    </Paper>
  );
}