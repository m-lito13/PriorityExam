import { Box, Typography } from "@mui/material";
import { WaveformBars } from "./WaveformBars";
import { customColors } from "../theme/theme";

export function AppHeader() {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: { xs: 2, md: 4 },
        py: 2.5,
        borderBottom: `1px solid ${customColors.hairline}`,
      }}
    >
      <WaveformBars color={customColors.amber} height={22} active />
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: 700, letterSpacing: 0.3 }}
      >
        Signal
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", ml: 0.5, mt: 0.4 }}
      >
        find a track, drop it on the deck
      </Typography>
    </Box>
  );
}
