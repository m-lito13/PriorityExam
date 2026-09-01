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
  teal: "#34D1BF", // secondary accent — "now playing" / live signal
  danger: "#E5677B",
};

// MUI's default Palette shape has no slot for "elevated panel background" —
// this is the one genuinely custom token the design needs, so it gets
// added to the theme itself (not a parallel object) via module
// augmentation. Everything else the app needs (hairline, amber, teal,
// textMuted, ink, surface) already has a standard MUI home — see the
// mapping in the createTheme call below — so components should read
// those through `theme.palette.*`/`useTheme()`, never a separate import.
declare module "@mui/material/styles" {
  interface Palette {
    app: { surfaceRaised: string };
  }
  interface PaletteOptions {
    app?: { surfaceRaised: string };
  }
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    tablet: true; // Adds custom breakpoint 'tablet'
  }
}

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
    app: {
      surfaceRaised: palette.surfaceRaised,
    },
    
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      tablet: 768, // Custom pixel value
      md: 900,
      lg: 1200,
      xl: 1536,
    },
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
    MuiCssBaseline: {
      styleOverrides: {
        // Establishes the definite-height chain the app's internal
        // scroll areas depend on — without this, height: "100%"/"100dvh"
        // further down has nothing concrete to resolve against, and flex
        // children with overflow:auto silently collapse to 0 height
        // instead of scrolling.
        html: { height: "100%" },
        body: { height: "100%" },
        "#root": { height: "100%" },
      },
    },
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