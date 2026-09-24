import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { brand, contact } from "../content";
import { displayFont, sansFont } from "../fonts";
import { Pop } from "./Pop";

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  borderRadius: 999,
  padding: "0.55em 1.1em",
  fontFamily: sansFont,
  fontWeight: 700,
  direction: "rtl",
};

export const HookOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      direction: "rtl",
      textAlign: "center",
      padding: "0 8%",
    }}
  >
    <Pop delay={4}>
      <Img
        src={staticFile("artos-logo.png")}
        style={{ width: "34%", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
      />
    </Pop>
    <Pop delay={20} style={{ marginTop: 28 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: "6.2vw",
          color: brand.cream,
          lineHeight: 1.05,
          textShadow: "0 6px 30px rgba(0,0,0,0.55)",
        }}
      >
        בשר בנווה מדבר
      </div>
    </Pop>
    <Pop delay={40} style={{ marginTop: 18 }}>
      <div style={{ ...pill, background: brand.turq, color: brand.navy, fontSize: "2.6vw" }}>
        פודטראק · עין גדי · ים המלח
      </div>
    </Pop>
  </AbsoluteFill>
);

export const PriceOverlay: React.FC<{ name: string; price: number }> = ({ name, price }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 7% 12%", direction: "rtl" }}>
    <Pop delay={6}>
      <div
        style={{
          background: brand.navy,
          color: brand.cream,
          borderRadius: 28,
          padding: "1.1em 1.4em",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          boxShadow: "0 20px 50px rgba(3,26,58,0.5)",
        }}
      >
        <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: "3.4vw" }}>
          {name}
        </span>
        <span
          style={{
            fontFamily: sansFont,
            fontWeight: 700,
            fontSize: "4vw",
            color: brand.turq,
            whiteSpace: "nowrap",
            direction: "ltr",
          }}
        >
          {price}₪
        </span>
      </div>
    </Pop>
  </AbsoluteFill>
);

export const RatingOverlay: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "flex-start", padding: "10% 7% 0", direction: "rtl" }}>
    <Pop delay={5}>
      <div
        style={{
          ...pill,
          background: brand.cream,
          color: brand.navy,
          fontSize: "3vw",
          boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ color: brand.clay, fontSize: "1.15em" }}>★ {contact.rating.score}</span>
        <span style={{ opacity: 0.7, fontWeight: 500 }}>· {contact.rating.count} ביקורות בגוגל</span>
      </div>
    </Pop>
  </AbsoluteFill>
);

export const QuoteOverlay: React.FC<{ text: string; by: string }> = ({ text, by }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 8% 12%", direction: "rtl" }}>
    <Pop delay={6}>
      <div
        style={{
          background: "rgba(5,39,84,0.82)",
          color: brand.cream,
          borderRadius: 28,
          padding: "1.3em 1.5em",
          boxShadow: "0 20px 50px rgba(3,26,58,0.5)",
        }}
      >
        <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: "3.2vw", lineHeight: 1.35 }}>
          “{text}”
        </div>
        <div style={{ fontFamily: sansFont, fontWeight: 500, fontSize: "2.1vw", color: brand.turq, marginTop: 10 }}>
          {by}
        </div>
      </div>
    </Pop>
  </AbsoluteFill>
);

export const TaglineOverlay: React.FC<{ tagline: string }> = ({ tagline }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 8% 14%", direction: "rtl" }}>
    <Pop delay={5}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: "4.6vw",
          color: brand.cream,
          textShadow: "0 6px 30px rgba(0,0,0,0.55)",
          lineHeight: 1.2,
        }}
      >
        {tagline}
      </div>
    </Pop>
  </AbsoluteFill>
);

export const CTAOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      direction: "rtl",
      textAlign: "center",
      padding: "0 8%",
    }}
  >
    <Pop delay={4}>
      <div style={{ ...pill, background: brand.turq, color: brand.navy, fontSize: "2.6vw" }}>
        {contact.openNow} · {contact.location}
      </div>
    </Pop>
    <Pop delay={16} style={{ marginTop: 22 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: "8vw",
          color: brand.cream,
          textShadow: "0 6px 30px rgba(0,0,0,0.6)",
        }}
      >
        {contact.nameHe}
      </div>
    </Pop>
    <Pop delay={28} style={{ marginTop: 6 }}>
      <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: "3.6vw", color: brand.turq }}>
        {contact.slogan}
      </div>
    </Pop>
    <Pop delay={44} style={{ marginTop: 30 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ ...pill, background: brand.navy, color: brand.cream, fontSize: "2.6vw" }}>
          {contact.ctaMenu}
        </div>
        <div style={{ ...pill, background: brand.navy, color: brand.cream, fontSize: "2.6vw" }}>
          {contact.ctaDirections}
        </div>
      </div>
    </Pop>
    <Pop delay={58} style={{ marginTop: 24 }}>
      <div
        style={{
          fontFamily: sansFont,
          fontWeight: 700,
          fontSize: "3.4vw",
          color: brand.cream,
          letterSpacing: 1,
        }}
      >
        {contact.phone}
      </div>
    </Pop>
  </AbsoluteFill>
);
