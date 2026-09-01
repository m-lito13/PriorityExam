// src/hooks/useIsMobileDevice.ts
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export function useIsMobileDevice(): boolean {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isTouchDevice = useMediaQuery("(hover: none) and (pointer: coarse)");

  // Triggers mobile tab UI strictly on small-screen touch hardware
  return isSmallScreen && isTouchDevice;
}