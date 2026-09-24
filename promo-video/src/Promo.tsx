import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { beats, fps } from "./content";
import { KenBurnsImage } from "./components/KenBurnsImage";
import {
  CTAOverlay,
  HookOverlay,
  PriceOverlay,
  QuoteOverlay,
  RatingOverlay,
  TaglineOverlay,
} from "./components/Overlays";

export const Promo: React.FC = () => {
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#052754" }}>
      {beats.map((beat, i) => {
        const durationInFrames = Math.round(beat.seconds * fps);
        const from = cursor;
        cursor += durationInFrames;

        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <KenBurnsImage
              image={beat.image}
              durationInFrames={durationInFrames}
              pan={"pan" in beat ? beat.pan : "left"}
              inset={"inset" in beat ? beat.inset : false}
              dim={beat.kind === "hook" || beat.kind === "cta" ? 0.42 : 0.28}
            />
            {beat.kind === "hook" && <HookOverlay />}
            {beat.kind === "food" && <PriceOverlay name={beat.name} price={beat.price} />}
            {beat.kind === "rating" && <RatingOverlay />}
            {beat.kind === "quote" && <QuoteOverlay text={beat.text} by={beat.by} />}
            {beat.kind === "family" && <TaglineOverlay tagline={beat.tagline} />}
            {beat.kind === "cta" && <CTAOverlay />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
