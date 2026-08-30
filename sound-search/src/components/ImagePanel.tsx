import { Box, Paper, Typography, Fade } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { WaveformBars } from "./WaveformBars";
import { customColors } from "../theme/theme";
import type { Track } from "../types";

interface ImagePanelProps {
  track?: Track;
  isPlaying: boolean;
  onImageClick: () => void;
}

export function ImagePanel({ track, isPlaying, onImageClick }: ImagePanelProps) {
  return (
    <Paper
      component="section"
      aria-label="now viewing"
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Typography variant="overline" sx={{ color: "text.secondary", alignSelf: "flex-start", mb: 1.5 }}>
        Now Viewing
      </Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: 260,
          aspectRatio: "1 / 1",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          backgroundColor: customColors.surfaceRaised,
          border: `1px solid ${customColors.hairline}`,
        }}
      >
        <Fade in={Boolean(track)} timeout={450} key={track?.id ?? "empty"}>
          <Box
            component={track ? "button" : "div"}
            onClick={track ? onImageClick : undefined}
            aria-label={track ? `Play ${track.name} by ${track.artist}` : undefined}
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
              p: 0,
              cursor: track ? "pointer" : "default",
              display: "block",
              position: "relative",
              "&:focus-visible": {
                outline: `3px solid ${customColors.amber}`,
                outlineOffset: -3,
              },
            }}
          >
            {track && (
              <>
                <Box
                  component="img"
                  src={track.imageUrl}
                  alt={`${track.name} artwork`}
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isPlaying ? "rgba(18,20,26,0.15)" : "rgba(18,20,26,0.35)",
                    transition: "background-color 0.2s ease",
                    "&:hover": { backgroundColor: "rgba(18,20,26,0.15)" },
                  }}
                >
                  {isPlaying ? (
                    <WaveformBars color={customColors.teal} height={28} barCount={5} active />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: 44, color: customColors.amber }} />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Fade>

        {!track && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              textAlign: "center",
              px: 2,
            }}
          >
            <Typography variant="body2">
              Pick a result to bring it here
            </Typography>
          </Box>
        )}
      </Box>

      <Typography
        variant="h6"
        sx={{ mt: 2, textAlign: "center", minHeight: 28 }}
        noWrap
      >
        {track ? track.name : "—"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {track ? track.artist : "no track selected"}
      </Typography>

      <Box
        sx={{
          width: "100%",
          borderRadius: 2,
          border: `1px dashed ${customColors.hairline}`,
          minHeight: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          px: 2,
        }}
      >
        <Typography variant="caption" sx={{ textAlign: "center" }}>
          {track
            ? isPlaying
              ? "player embed goes here"
              : "click the image to load & play the embed"
            : "embed will appear once a track is selected"}
        </Typography>
      </Box>
    </Paper>
  );
}
