import { useRef, useEffect } from "react";
import { Box, Paper, Typography, Fade, useTheme } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { WaveformBars } from "./WaveformBars";
import type { Track } from "../types";
import { alpha } from "@mui/material/styles";
import { LAYOUT_CONFIG } from "../const/layout";

interface ImagePanelProps {
  track?: Track;
  isPlaying: boolean;
  onImageClick: () => void;
}

// Ambient type declaration to resolve 'window.Mixcloud' build errors
declare global {
  interface Window {
    Mixcloud?: {
      PlayerWidget: (iframe: HTMLIFrameElement) => {
        ready: Promise<void>;
        play: () => Promise<void>;
      };
    };
  }
}

export function TrackPanel({ track, isPlaying, onImageClick }: ImagePanelProps) {
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Dynamically inject the Mixcloud Widget SDK script if missing
  useEffect(() => {
    if (!window.Mixcloud) {
      const script = document.createElement("script");
      script.src = "https://widget.mixcloud.com/media/js/widgetApi.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleIframeLoad = () => {
    if (!iframeRef.current || !window.Mixcloud) return;

    const widget = window.Mixcloud.PlayerWidget(iframeRef.current);

    widget.ready
      .then(() => widget.play())
      .catch((err) => console.error("Mixcloud play failed", err));
  };

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
        width: "100%",
        minWidth: 0,
        height: { md: "100%" },
        minHeight: { md: 0 },
        overflowY: "auto",
      }}
    >
      <Typography variant="overline" sx={{ color: "text.secondary", alignSelf: "flex-start", mb: 1.5 }}>
        Now Viewing
      </Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: LAYOUT_CONFIG.ARTWORK_MAX_SIZE,
          aspectRatio: "1 / 1",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "app.surfaceRaised",
          border: 1,
          borderColor: "divider",
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
                outline: `3px solid ${theme.palette.primary.main}`,
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
                    backgroundColor: (theme) =>
                      isPlaying
                        ? alpha(theme.palette.background.default, 0.15)
                        : alpha(theme.palette.background.default, 0.35),
                    transition: "background-color 0.2s ease",
                    "&:hover": { backgroundColor: "rgba(18,20,26,0.15)" },
                  }}
                >
                  {isPlaying ? (
                    <WaveformBars color={theme.palette.secondary.main} height={28} barCount={5} active />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: "large", color: "primary.main" }} />
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
        sx={{
          mt: 2,
          width: "100%",
          textAlign: "center",
          minHeight: 28,
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {track ? track.name : "—"}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, width: "100%", textAlign: "center", overflowWrap: "break-word" }}
      >
        {track ? track.artist : "no track selected"}
      </Typography>

      <Box
        sx={{
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          minHeight: LAYOUT_CONFIG.EMBED_PLAYER_MIN_HEIGHT,
        }}
      >
        {track && isPlaying ? (
          <Box
            ref={iframeRef}
            onLoad={handleIframeLoad}
            component="iframe"
            key={track.id}
            title={`${track.name} by ${track.artist} — Mixcloud player`}
            src={track.embedUrl}
            width="100%"
            height={LAYOUT_CONFIG.EMBED_PLAYER_MIN_HEIGHT}
            frameBorder={0}
            allow="autoplay"
            sx={{ display: "block", border: "none" }}
          />
        ) : (
          <Box
            sx={{
              minHeight: LAYOUT_CONFIG.EMBED_PLAYER_MIN_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              px: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="caption">
              {track
                ? "click the image to load & play the embed"
                : "embed will appear once a track is selected"}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}