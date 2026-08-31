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
        height: { md: "100%" },
        // Flex items default to min-height: auto (= their content's size),
        // which stops them ever shrinking below that — exactly what was
        // blocking the results list from scrolling. This overrides it, but
        // only at md — below that the panel is meant to size to its
        // content and let the page scroll instead.
        minHeight: { md: 0 },
      }}
    >
      <Typography
        id="search-panel-heading"
        variant="overline"
        sx={{ color: "text.secondary", mb: 1.5 }}
      >
        Search
      </Typography>

      <SearchBar
        value={props.query}
        onChange={props.onQueryChange}
        onSubmit={props.onSubmitSearch}
      />

      <Box sx={{ flex: 1, minWidth: 0, minHeight: { md: 0 }, mt: 2, overflowY: "auto" }}>
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

      <ResultsFooterControls
        viewMode={props.viewMode}
        onViewModeChange={props.onViewModeChange}
        onPrevious={props.onPrevious}
        onNext={props.onNext}
        hasPrevious={props.hasPrevious}
        hasNext={props.hasNext}
      />
    </Paper>
  );
}
