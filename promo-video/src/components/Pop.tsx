import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Pop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const scale = spring({
    frame: local,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 170 },
  });
  const opacity = spring({
    frame: local,
    fps,
    config: { damping: 20 },
    durationInFrames: 10,
  });

  return (
    <div
      style={{
        transform: `scale(${0.7 + scale * 0.3}) translateY(${(1 - scale) * 24}px)`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
