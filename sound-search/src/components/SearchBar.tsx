import { type FormEvent } from "react";
import { Box, Button, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { customColors } from "../theme/theme";

interface SearchBarProps {
  value: string;
  /** Fired on every keystroke — the caller (useTrackSearch) debounces this. */
  onChange: (value: string) => void;
  /** Fired on Enter / button click — runs immediately, bypassing the debounce. */
  onSubmit: (value: string) => void;
}

/**
 * Purely presentational: no fetching, no debounce timer, no history logic.
 * It just reports what the user typed and when they asked to search "now".
 */
export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <Box
      component="form"
      role="search"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1 }}
    >
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          px: 1.5,
          backgroundColor: customColors.surfaceRaised,
        }}
      >
        <SearchIcon sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
        <InputBase
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for an artist, track, or mix"
          inputProps={{ "aria-label": "search tracks" }}
          sx={{ color: "text.primary", py: 1 }}
        />
      </Paper>
      <Button type="submit" variant="contained" color="primary" sx={{ px: 3 }}>
        Go
      </Button>
    </Box>
  );
}
