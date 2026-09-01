import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import type { Track, ViewMode } from "../types";

interface SearchResultsProps {
  tracks: Track[];
  viewMode: ViewMode;
  selectedTrackId?: string;
  status: "idle" | "loading" | "error" | "ready";
  errorMessage?: string;
  onSelectTrack: (track: Track) => void;
  onRetry: () => void;
}

export function SearchResults({
  tracks,
  viewMode,
  selectedTrackId,
  status,
  errorMessage,
  onSelectTrack,
  onRetry,
}: SearchResultsProps) {
  if (status === "loading") {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          py: 4,
          color: "text.secondary",
        }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress size={28} color="primary" />
        <Typography variant="body2">searching…</Typography>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Alert
        severity="error"
        role="alert"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
        sx={{ my: 1 }}
      >
        {errorMessage ?? "Couldn't reach the search API. Check your connection and try again."}
      </Alert>
    );
  }

  if (status === "idle") {
    return (
      <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">
          Search for an artist or track to get started.
        </Typography>
      </Box>
    );
  }

  if (tracks.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">
          No matches. Try a different spelling or a broader term.
        </Typography>
      </Box>
    );
  }

  if (viewMode === "tile") {
    return (
      <Grid
        container
        spacing={1.5}
        component="ul"
        role="listbox"
        aria-label="search results"
        sx={{ listStyle: "none", m: 0, p: 0 }}
      >
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;
          return (
            <Grid key={track.id} size={6} component="li">
              <Box
                component="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelectTrack(track)}
                sx={{
                  width: "100%",
                  border: "none",
                  p: 0,
                  cursor: "pointer",
                  borderRadius: 2,
                  overflow: "hidden",
                  textAlign: "left",
                  backgroundColor: "background.paper",
                  outline: (theme) =>
                    isSelected
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                  transition: (theme) =>
                    theme.transitions.create(["outline-color", "opacity"], {
                      duration: theme.transitions.duration.shortest,
                    }),
                  "&:hover": { opacity: 0.9 },
                  "&:focus-visible": {
                    outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                  },
                }}
              >
                <Box
                  component="img"
                  src={track.imageUrl}
                  alt=""
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {track.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    {track.artist}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  }

  return (
    <List
      role="listbox"
      aria-label="search results"
      disablePadding
      sx={{ "& .MuiListItemButton-root": { borderRadius: 1.5 } }}
    >
      {tracks.map((track) => (
        <ListItemButton
          key={track.id}
          role="option"
          aria-selected={track.id === selectedTrackId}
          selected={track.id === selectedTrackId}
          onClick={() => onSelectTrack(track)}
          sx={{ mb: 0.5 }}
        >
          <Avatar
            variant="rounded"
            src={track.imageUrl}
            alt=""
            sx={{ width: 36, height: 36, mr: 1.5 }}
          />
          <ListItemText
            primary={track.name}
            secondary={track.artist}
            slotProps={{
              primary: { noWrap: true, sx: { fontWeight: 600 } },
              secondary: { noWrap: true },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}