import { loadFont as loadDisplay } from "@remotion/google-fonts/FrankRuhlLibre";
import { loadFont as loadSans } from "@remotion/google-fonts/Heebo";

export const { fontFamily: displayFont } = loadDisplay("normal", {
  weights: ["700", "900"],
});
export const { fontFamily: sansFont } = loadSans("normal", {
  weights: ["500", "700"],
});
