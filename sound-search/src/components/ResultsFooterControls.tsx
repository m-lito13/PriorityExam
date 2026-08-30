import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import type { ViewMode } from "../types";

interface ResultsFooterControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ResultsFooterControls({
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ResultsFooterControlsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pt: 1.5,
        mt: 1.5,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          startIcon={<ChevronLeftIcon />}
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          size="small"
          endIcon={<ChevronRightIcon />}
          disabled={!hasNext}
          onClick={onNext}
        >
          Next
        </Button>
      </Box>

      <ToggleButtonGroup
        size="small"
        value={viewMode}
        exclusive
        onChange={(_, next: ViewMode | null) => next && onViewModeChange(next)}
        aria-label="results view mode"
      >
        <ToggleButton value="list" aria-label="list view">
          <ViewListIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="tile" aria-label="tile view">
          <ViewModuleIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
