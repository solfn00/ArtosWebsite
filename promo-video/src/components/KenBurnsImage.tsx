import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const KenBurnsImage: React.FC<{
  image: string;
  durationInFrames: number;
  pan?: "left" | "right";
  inset?: boolean;
  dim?: number;
}> = ({ image, durationInFrames, pan = "left", inset = false, dim = 0.28 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(progress, [0, 1], [1.08, 1.22]);
  const panDistance = 3.5;
  const translate = interpolate(
    progress,
    [0, 1],
    pan === "left" ? [panDistance, -panDistance] : [-panDistance, panDistance],
  );

  const frameStyle: React.CSSProperties = inset
    ? {
        position: "absolute",
        inset: "16% 10%",
        borderRadius: 32,
        overflow: "hidden",
        boxShadow: "0 30px 60px rgba(3, 26, 58, 0.45)",
      }
    : { position: "absolute", inset: 0, overflow: "hidden" };

  return (
    <AbsoluteFill style={{ backgroundColor: "#052754" }}>
      <div style={frameStyle}>
        <Img
          src={staticFile(image)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${translate}%, 0)`,
            transformOrigin: "center center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(5,39,84,${dim}) 0%, rgba(5,39,84,0.05) 30%, rgba(5,39,84,0.05) 55%, rgba(5,39,84,${dim + 0.35}) 100%)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
