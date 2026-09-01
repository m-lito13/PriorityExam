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

/**
 * The sx for the Box that *wraps* each top-level panel in App.tsx's layout
 * (as opposed to panelSurfaceSx above, which styles the panel's own Paper).
 * Every panel wrapper needs the same shrink/height rules and differs only
 * in how much of the row it claims — hence `flexBasis` as a parameter
 * instead of a fixed constant.
 *
 * On mobile (single active tab, fixed-height app shell) the wrapper always
 * fills its parent exactly. On desktop, below md it sizes to its content
 * (page can grow/scroll), and at md it fills the row height for the
 * 3-column flex layout.
 */
export function panelWrapperSx(flexBasis: number, isMobileDevice: boolean): SxProps<Theme> {
  return {
    flex: { md: flexBasis },
    minWidth: 0,
    height: isMobileDevice ? "100%" : { md: "100%" },
    minHeight: { md: 0 },
  };
}

