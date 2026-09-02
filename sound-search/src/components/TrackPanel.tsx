import { useRef, useEffect, useState } from "react";
import { Box, Paper, Typography, Fade, useTheme } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { WaveformBars } from "./WaveformBars";
import type { Track } from "../types";
import { alpha } from "@mui/material/styles";
import { LAYOUT_CONFIG } from "../const/layout";
import { panelSurfaceSx } from "../theme/layoutPrimitives";

interface TrackPanelProps {
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
        pause: () => Promise<void>;
        togglePlay: () => Promise<void>;
        events: {
          play: { on: (cb: () => void) => void; off: (cb: () => void) => void };
          pause: { on: (cb: () => void) => void; off: (cb: () => void) => void };
          ended: { on: (cb: () => void) => void; off: (cb: () => void) => void };
        };
      };
    };
  }
}

const MIXCLOUD_WIDGET_SCRIPT_URL = "https://widget.mixcloud.com/media/js/widgetApi.js";

// Module-level, not component state: the script only needs to be
// requested once for the whole app's lifetime, even if TrackPanel mounts
// more than once (e.g. React StrictMode's dev double-invoke).
let widgetScriptPromise: Promise<void> | null = null;

function loadMixcloudWidgetScript(): Promise<void> {
  if (window.Mixcloud) return Promise.resolve();
  if (!widgetScriptPromise) {
    widgetScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = MIXCLOUD_WIDGET_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load the Mixcloud widget script."));
      document.head.appendChild(script);
    });
  }
  return widgetScriptPromise;
}

export function TrackPanel({ track, isPlaying, onImageClick }: TrackPanelProps) {
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);

  // A newly-selected track always starts unplayed — without this, if the
  // previous track was mid-playback when a new one got selected, this
  // state would otherwise carry over and show the waveform on artwork
  // that hasn't started playing yet. Adjusted during render (rather than
  // in an Effect) so there's no intermediate frame with the stale value.
  const [prevTrackId, setPrevTrackId] = useState(track?.id);
  if (track?.id !== prevTrackId) {
    setPrevTrackId(track?.id);
    setIsActuallyPlaying(false);
  }

  useEffect(() => {
    if (track) {
      playButtonRef.current?.focus({ preventScroll: true });
    }
  }, [track?.id]);

  // Kick off the script load as early as possible (on mount) so it's
  // likely already ready by the time someone actually presses play —
  // handleIframeLoad below still waits on it properly either way.
  useEffect(() => {
    loadMixcloudWidgetScript().catch((err) => {
      console.error(err);
    });
  }, []);

  const handleIframeLoad = () => {
    // The widget script and the iframe load independently, in no
    // guaranteed order — on a slow connection the script can easily still
    // be loading when the iframe fires onLoad. Wait for it explicitly
    // instead of assuming window.Mixcloud is already there, so autoplay
    // doesn't just silently fail.
    loadMixcloudWidgetScript()
      .then(() => {
        if (!iframeRef.current || !window.Mixcloud) return;
        const widget = window.Mixcloud.PlayerWidget(iframeRef.current);

        // Per Mixcloud's own widget docs: "Until ready resolves, the
        // object returned by PlayerWidget has no API on it — do your work
        // inside the then." That includes widget.events, not just
        // widget.play()/pause() — reading .events before ready resolves
        // can throw, which silently aborts this whole callback (caught by
        // the .catch below) before any of it runs, including the ready.then
        // block that sets isActuallyPlaying. Everything has to live inside
        // ready.then, event registration included.
        return widget.ready.then(() => {
          widget.events.play.on(() => setIsActuallyPlaying(true));
          widget.events.pause.on(() => setIsActuallyPlaying(false));
          widget.events.ended.on(() => setIsActuallyPlaying(false));
          setIsActuallyPlaying(true);
          playButtonRef.current?.focus({ preventScroll: true });
          return widget.play().then(() => {
            // Belt-and-suspenders: some widgets shift focus again once
            // playback actually begins (not just once ready), a moment
            // slightly after the reclaim above.
            playButtonRef.current?.focus({ preventScroll: true });
          });
        });
      })
      .catch((err) => console.error("Mixcloud play failed", err));
  };

  return (
    <Paper
      component="section"
      aria-label="now viewing"
      elevation={0}
      sx={{
        ...panelSurfaceSx,
        p: { xs: 2, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
            ref={playButtonRef}
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
                      isActuallyPlaying
                        ? alpha(theme.palette.background.default, 0.15)
                        : alpha(theme.palette.background.default, 0.35),
                    transition: "background-color 0.2s ease",
                    "&:hover": { backgroundColor: "rgba(18,20,26,0.15)" },
                  }}
                >
                  {isActuallyPlaying ? (
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
            <Typography variant="body2">Pick a result to bring it here</Typography>
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
