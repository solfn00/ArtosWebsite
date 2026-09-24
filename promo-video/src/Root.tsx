import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { fps, totalFrames } from "./content";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoVertical"
        component={Promo}
        durationInFrames={totalFrames}
        fps={fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="PromoSquare"
        component={Promo}
        durationInFrames={totalFrames}
        fps={fps}
        width={1080}
        height={1080}
      />
    </>
  );
};
