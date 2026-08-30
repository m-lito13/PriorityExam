import { useState, type FormEvent } from "react";
import { Box, Button, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { customColors } from "../theme/theme";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (term: string) => void;
}

/**
 * Pure presentational search box: owns only the text field's local draft
 * value. Submission (button click or Enter) is the sole way it reports a
 * search term upward — no fetching or debouncing lives here.
 */
export function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
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
          onChange={(e) => setValue(e.target.value)}
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
