import type { FormEvent } from "react";
import { Box, Button, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) { 
      onSubmit(trimmed);
    } 
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
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          px: 1.5,
          backgroundColor: "app.surfaceRaised",
        }}
      >
        <SearchIcon sx={{ color: "text.secondary", fontSize: "small", mr: 1 }} />
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