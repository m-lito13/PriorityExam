import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Returns true strictly on phone-sized touch viewports (< 600px).
 * Keeps tablets (iPad, Surface) in standard multi-panel mode.
 */
export function useIsMobileDevice(): boolean {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isTouchDevice = useMediaQuery("(hover: none) and (pointer: coarse)");

  return isSmallScreen && isTouchDevice;
}