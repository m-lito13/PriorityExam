import { useMediaQuery } from "@mui/material";

export function useIsMobileDevice() {
  const isTouchPointer = useMediaQuery("(pointer: coarse)");
  const hasNoHover = useMediaQuery("(hover: none)");

  return isTouchPointer && hasNoHover;
}