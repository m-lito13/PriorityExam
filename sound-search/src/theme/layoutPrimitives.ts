import type { SxProps, Theme } from "@mui/material/styles";

/**
 * The layout contract every top-level panel (Search / Now Viewing / Recent
 * Searches) shares: full width, allowed to shrink below its content's
 * natural size, and — only once the 3-column desktop layout kicks in at
 * md — fills its grid column exactly and scrolls its own overflow instead
 * of the whole page.
 *
 * This exists so that layout fix only ever needs to happen in one place.
 * Spread it into a Paper's sx and layer any panel-specific properties
 * (padding, flex direction, alignment) after it:
 *
 *   sx={{ ...panelSurfaceSx, p: 2.5, display: "flex", flexDirection: "column" }}
 */
export const panelSurfaceSx: SxProps<Theme> = {
  width: "100%",
  minWidth: 0,
  height: { md: "100%" },
  minHeight: { md: 0 },
  overflowY: "auto",
};

