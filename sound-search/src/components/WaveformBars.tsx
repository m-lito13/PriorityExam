import { Box, keyframes } from "@mui/material";

const bounce = keyframes`
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
`;

interface WaveformBarsProps {
  active?: boolean;
  color?: string;
  height?: number;
  barCount?: number;
}

/**
 * Signature visual motif for the app: a small bank of bars that reads as a
 * waveform. Static (paused look) by default; set `active` to animate it as a
 * "now playing" signal.
 */
export function WaveformBars({
  active = false,
  color = "currentColor",
  height = 16,
  barCount = 4,
}: WaveformBarsProps) {
  const bars = Array.from({ length: barCount });
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        height,
      }}
    >
      {bars.map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            height: "100%",
            borderRadius: 1,
            backgroundColor: color,
            transformOrigin: "center",
            transform: active ? undefined : `scaleY(${0.35 + (i % 3) * 0.22})`,
            animation: active
              ? `${bounce} ${0.7 + i * 0.15}s ease-in-out infinite`
              : "none",
          }}
        />
      ))}
    </Box>
  );
}
