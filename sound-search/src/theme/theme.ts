import { createTheme } from "@mui/material/styles";

// Palette — a late-night radio desk, not a generic AI-dark-mode.
// Ink navy base, amber for warmth/selection, teal signal for "live/playing" state.
const palette = {
  ink: "#12141A", // page background
  surface: "#1B1F27", // panel background
  surfaceRaised: "#232834", // hovered / raised panel
  hairline: "#2C3140", // dividers, outlines
  textPrimary: "#EDEEF0",
  textMuted: "#8B93A3",
  amber: "#F2A93B", // primary accent — search, CTAs
  amberDim: "#7A5A24",
  teal: "#34D1BF", // secondary accent — "now playing" / live signal
  danger: "#E5677B",
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: palette.ink,
      paper: palette.surface,
    },
    primary: {
      main: palette.amber,
      contrastText: "#1B1206",
    },
    secondary: {
      main: palette.teal,
      contrastText: "#04211D",
    },
    error: {
      main: palette.danger,
    },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textMuted,
    },
    divider: palette.hairline,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif' },
    h2: { fontFamily: '"Space Grotesk", sans-serif' },
    h3: { fontFamily: '"Space Grotesk", sans-serif' },
    h4: { fontFamily: '"Space Grotesk", sans-serif' },
    h5: { fontFamily: '"Space Grotesk", sans-serif' },
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      letterSpacing: 0.2,
    },
    overline: {
      fontFamily: '"Space Grotesk", sans-serif',
      letterSpacing: 1.6,
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${palette.hairline}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const customColors = palette;
