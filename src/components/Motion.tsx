"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * All page choreography, in one place (GSAP + ScrollTrigger).
 *
 * Markup contract — add these attributes in the components:
 *   data-burger-layer / -zoom / -shadow / -label / -float → hero burger (BurgerStack)
 *   data-hero-copy                                       → hero text, dims while the burger is apart
 *   data-anim="split"                                    → heading, per-letter reveal
 *   data-anim="up"                                       → fades up on scroll
 *   data-anim-group                                      → staggers its [data-anim] children
 *   data-parallax="-12"                                  → drifts by N% while scrolling
 *   data-marquee                                         → drifts sideways with scroll
 *   data-count="4.5"                                     → counts up to the number
 *
 * Motion is skipped entirely when the visitor asks for reduced motion;
 * `?motion=1` forces it on for previewing on a machine that dims animation.
 */
export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // must stay in step with the inline script in layout.tsx
    const forced = new URLSearchParams(window.location.search).has("motion");

    // Anything that never got its trigger must end up fully visible: the hiding
    // is done with opacity and transforms, not just visibility.
    const reveal = (el: Element) =>
      gsap.set(el, { visibility: "visible", opacity: 1, clearProps: "transform" });

    // The hero animates in via CSS. Drop those classes once they finish, or the
    // filled animation would keep overriding GSAP's scroll transforms.
    // The burger's drop-in goes too: left on, it replays whenever the element
    // is re-inserted or restyled, and on a slow phone it may already be over by
    // the time this runs, so finished animations are cleared straight away.
    const entranceClasses = ["hero-pop", "hero-spin", "hero-rise", "burger-drop"];
    const entrance = document.querySelectorAll<HTMLElement>(entranceClasses.map((c) => `.${c}`).join(", "));
    const listeners: Array<() => void> = [];
    entrance.forEach((el) => {
      const done = () => el.classList.remove(...entranceClasses);
      const running = el.getAnimations?.() ?? [];
      // no animation at all (reduced motion, or it already finished): clear now
      if (!running.length || running.every((a) => a.playState === "finished")) done();
      else {
        el.addEventListener("animationend", done, { once: true });
        listeners.push(() => el.removeEventListener("animationend", done));
      }
    });
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── no motion: show everything, wire nothing ──
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (forced) return;
        document.documentElement.classList.remove("motion-armed");
        gsap.set("[data-anim]", { visibility: "visible", opacity: 1, clearProps: "transform" });
        document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          el.textContent = el.dataset.count ?? el.textContent;
        });
      });

      const full = forced ? "all" : "(prefers-reduced-motion: no-preference)";
      mm.add(full, () => {
        gsap.set("[data-anim]", { visibility: "visible" });
        document.documentElement.classList.remove("motion-armed");

        /* ── 3. content fades up as it comes into view ────── */
        gsap.utils.toArray<HTMLElement>('[data-anim="up"]').forEach((el) => {
          gsap.from(el, {
            y: 46,
            opacity: 0,
            duration: 0.7,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        /* ── 5. image parallax ────────────────────────────── */
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax || -12);
          gsap.fromTo(
            el,
            { yPercent: -amount / 2, scale: 1.16 },
            {
              yPercent: amount / 2,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.5 },
            }
          );
        });

        /* ── 6. marquee drifts with the scroll ────────────── */
        gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -22 },
            {
              xPercent: 4,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.4 },
            }
          );
        });

        /* ── 7. rating counts up ──────────────────────────── */
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count || 0);
          const obj = { n: 0 };
          gsap.to(obj, {
            n: end,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
            onUpdate: () => {
              el.textContent = obj.n.toFixed(1);
            },
          });
        });
      });

      /* ── 2. the hero burger comes apart as you scroll ──
         The page opens on the assembled burger. Layers rest in place via CSS
         `translate`, which GSAP folds into its own yPercent, so yPercent 0 is
         each layer's spot in the exploded frame; the tower instead spaces the
         ingredients evenly over most of the screen height, centred on screen.
         The hero pins for the whole move on every screen size.
         This runs even with reduced motion: the burger coming apart is the
         opening content, and it only moves as far as the visitor scrolls.
         The idle hover (motion nobody asked for) is skipped there. */
      // `always` keeps this running on phones with motion on, where neither of
      // the other two conditions matches (matchMedia only runs when one does)
      mm.add({ always: "all", reduce: "(prefers-reduced-motion: reduce)", desktop: "(min-width: 1024px)" }, (mctx) => {
        const { reduce, desktop } = mctx.conditions as { reduce: boolean; desktop: boolean };
        const section = document.querySelector<HTMLElement>("[data-hero]");
        const zoom = document.querySelector<HTMLElement>("[data-burger-zoom]");
        const stage = zoom?.parentElement;
        const layers = gsap.utils.toArray<HTMLElement>("[data-burger-layer]");
        if (!section || !zoom || !stage || !layers.length) return;

        // idle: the whole burger hovers, like the product shot it copies
        if (!reduce || forced) {
          gsap.to("[data-burger-float]", { y: -10, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
        }

        const ZOOM = 0.92; // stage scale once apart
        /** where the tower goes: per-layer yPercent, plus how far the stage moves to sit mid-screen */
        const tower = () => {
          const vh = window.innerHeight;
          const H = stage.offsetHeight;
          const heights = layers.map((el) => el.offsetHeight);
          const total = heights.reduce((a, b) => a + b, 0);
          const span = Math.min(vh * 0.8, H * 1.6) / ZOOM;
          const gap = Math.max(10, (span - total) / (layers.length - 1));
          let top = H / 2 - (total + gap * (layers.length - 1)) / 2;
          const y = layers.map((el, i) => {
            const v = ((top - el.offsetTop) / heights[i]) * 100;
            top += heights[i] + gap;
            return v;
          });
          // the pinned hero sits at the top of the viewport; aim a touch above
          // centre, clear of the navbar and of the ridge along the bottom
          const centre = stage.getBoundingClientRect().top - section.getBoundingClientRect().top + H / 2;
          return { y, shift: vh * 0.49 - centre };
        };
        let apart = tower();
        const tilt = [-6, 5, -4, 4, -3, 3];
        const drift = [-3, 3, -2.5, 2.5, -2, 2];
        const rest = layers.map((el) => Number(el.dataset.rest));
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            pin: section,
            start: "top top",
            end: desktop ? "+=130%" : "+=110%",
            pinSpacer: "#top",
            refreshPriority: 1, // pinned first, so later triggers account for its spacer
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              apart = tower();
            },
          },
        });

        // 0 → 0.7: apart, top bun first. Explicit start values: reading them
        // would catch the CSS drop-in mid-flight.
        layers.forEach((el, i) => {
          tl.fromTo(
            el,
            { yPercent: rest[i], rotation: 0, xPercent: 0 },
            {
              yPercent: () => apart.y[i],
              rotation: tilt[i % tilt.length],
              xPercent: drift[i % drift.length],
              duration: 0.6,
              ease: "power2.out",
            },
            i * 0.02
          );
        });
        tl.to(zoom, { scale: ZOOM, y: () => apart.shift, duration: 0.7, ease: "power2.out" }, 0)
          .to("[data-burger-shadow]", { scale: 0.5, opacity: 0.25, duration: 0.6 }, 0)
          // labels sit on the end (left) side in RTL — slide them in from outside
          .fromTo("[data-burger-label]", { opacity: 0, xPercent: -14 }, { opacity: 1, xPercent: 0, duration: 0.2, stagger: 0.04 }, 0.3)
          // phones: the tower runs over the title, so the text steps aside fully
          .to("[data-hero-copy]", { opacity: desktop ? 0.35 : 0, y: -20, duration: desktop ? 0.4 : 0.2 }, 0.02);

        // 0.7 → 1: hang in the air, still turning a touch
        layers.forEach((el, i) => {
          tl.to(el, { rotation: tilt[i % tilt.length] * 1.3, duration: 0.3 }, 0.7);
        });
      });

      /* ── 8. reading progress in the navbar ──
         Always on: it only moves with the scroll, and without it the bar
         would sit full width under reduced motion. */
      mm.add("all", () => {
        const bar = document.querySelector("[data-progress]");
        if (!bar) return;
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
          }
        );
      });

      return () => mm.revert();
    });

    // the display fonts swap in after first paint and reflow the page, so every
    // trigger measured before that is stale
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // safety net: nothing should stay invisible if a trigger never fires
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove("motion-armed");
      document.querySelectorAll("[data-anim]").forEach(reveal);
      ScrollTrigger.refresh();
    }, 2500);

    return () => {
      window.clearTimeout(timer);
      listeners.forEach((off) => off());
      ctx.revert();
    };
  }, []);

  return null;
}
