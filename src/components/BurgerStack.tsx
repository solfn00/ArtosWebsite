import Image from "next/image";
import { burgerFrame, burgerLayers } from "@/content/burgerLayers";

/** Height of a layer in the exploded frame, in % of the frame height. */
const layerHeight = (l: (typeof burgerLayers)[number]) =>
  ((l.w / 100) * burgerFrame.width * (l.height / l.width) * 100) / burgerFrame.height;

const bottom = burgerLayers[burgerLayers.length - 1];
/** where the assembled burger rests, for the floor shadow */
const floor = bottom.top + (layerHeight(bottom) * (100 + bottom.restY)) / 100;

/**
 * The burger from the hero, one image per layer (scripts/burger-layers.mjs).
 *
 * Server-rendered assembled: each layer is shifted by `translate` to its resting
 * place, and the layers drop in with CSS. On scroll, Motion.tsx pulls them
 * apart into a tall tower (GSAP yPercent 0 = the layer's exploded place) and
 * fades in each ingredient's name.
 */
export default function BurgerStack({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      // an illustration, not a photo of an actual Art'os burger — say so
      aria-label="איור המבורגר בשכבות: לחמנייה, בצל סגול, עגבנייה, חסה, קציצת בקר ולחמנייה קלויה"
      className={`relative aspect-[688/1024] ${className}`}
    >
      <div data-burger-zoom className="absolute inset-0 origin-center" style={{ transform: "scale(1.3)" }}>
        {/* floor shadow — shrinks and fades as the layers lift */}
        <div
          aria-hidden="true"
          data-burger-shadow
          className="absolute left-[18%] w-[64%] -translate-y-1/2"
          style={{ top: `${floor}%` }}
        >
          <div className="mx-auto aspect-[6/1] w-full rounded-[50%] bg-black/55 blur-xl" />
        </div>

        <div data-burger-float className="absolute inset-0">
          {burgerLayers.map((l, i) => (
            <div
              key={l.name}
              data-burger-layer
              data-rest={l.restY}
              className="absolute"
              style={{
                left: `${l.left}%`,
                top: `${l.top}%`,
                width: `${l.w}%`,
                zIndex: burgerLayers.length - i,
                translate: `0 ${l.restY}%`,
              }}
            >
              <Image
                src={l.src}
                alt=""
                width={l.width}
                height={l.height}
                // the top bun is the hero's LCP image, so it gets a real preload
                {...(i === 0 ? { priority: true } : { loading: "eager" as const })}
                sizes="(min-width: 1024px) 34vw, 60vw"
                // the drop-in runs on the image, the scroll moves its wrapper, so the
                // CSS entrance can never pin the layer in place (phones hydrate late)
                className="burger-drop h-auto w-full drop-shadow-[0_18px_22px_rgb(3_26_58/0.45)]"
                style={{ ["--delay" as string]: `${300 + (burgerLayers.length - 1 - i) * 110}ms` }}
              />
              {/* the ingredient's name, travels with it; shown only once apart */}
              <p
                aria-hidden="true"
                data-burger-label
                className="pointer-events-none absolute end-[104%] top-1/2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap text-[0.7rem] font-semibold tracking-[0.06em] text-cream opacity-0 sm:gap-2 sm:text-sm sm:tracking-[0.08em]"
              >
                {/* RTL: the leader line sits between the name and the food */}
                <span className="h-px w-4 bg-turq/80 sm:w-10" />
                {l.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
