// Image slots for the generator: the 31 generated slots of Shots.html come from data/media.ts; this file
// composes the final English prompt (shared look + slot subject + palette + exclusions) per docs/BRIEF.md.
import { media } from "../../data/media";
import type { MediaSlot } from "../../data/types";

/** «ضوء جدة الصباحي», rendered in English for the model. */
export const SHARED_LOOK =
  "Photograph taken in Jeddah, Saudi Arabia, on one calm morning between 7 and 9 am after a thin sea haze has softened the sun: warm soft light from the right, long but open shadows, a pale bluish-white sky (never cobalt). Camera at eye level or slightly lower, 35 to 50 mm lens, medium depth of field, no wide-angle distortion. Quiet, tidy composition; the less detailed half of the frame is left empty so text can sit on it.";

export const PALETTE =
  "Palette: sand #E8DCC3, white plaster #F4F1EA, warm coral and wood #C98E6B, blue-green sea #6FA9A3, brand gold #B48F2E used on at most 5% of the frame, warm brown shadow #3A3630. Low saturation, medium contrast, no HDR, no filters, very fine film grain.";

export const EXCLUSIONS =
  "Strictly no people, faces or hands; no text, signage, logos or lettering; no car number plates; no Dubai, Riyadh or any skyline that is not Jeddah; no night scenes or neon; no lens flare; no palm trees as foreground decoration; no over-the-top luxury furniture (crystal, gold marble); no maps; nothing presented as a photo of a real listed unit; no warped or impossible architecture.";

export interface GenSlot extends MediaSlot {
  prompt: string;
  aspectRatio: "1:1" | "16:9" | "3:2" | "4:5" | "21:9" | "2:3";
}

const RATIO: Record<MediaSlot["ratio"], GenSlot["aspectRatio"]> = { "3:2": "3:2", "16:9": "16:9", "4:5": "4:5", "1:1": "1:1", "21:9": "21:9", "2:3": "2:3" };

export function composePrompt(slot: MediaSlot): string {
  return `${SHARED_LOOK}\n\nSubject: ${slot.promptEn}\n\n${PALETTE}\n\n${EXCLUSIONS}`;
}

/** The 31 slots the generator owns (IMG-FOUNDER is never generated). */
export const GEN_SLOTS: GenSlot[] = media
  .filter((m) => m.group !== "founder" && m.tier !== "empty")
  .map((m) => ({ ...m, prompt: composePrompt(m), aspectRatio: RATIO[m.ratio] ?? "3:2" }));

export const ANCHORS = ["IMG-PRJ-ROWDAH-EXT", "IMG-UNIT-APT-3BR-LIVING", "IMG-ED-BALAD-RAWASHEEN", "IMG-ED-CORNICHE-DAWN"] as const;

/** Which approved anchors serve as references for a slot's group. */
export function referencesFor(slot: MediaSlot): string[] {
  if ((ANCHORS as readonly string[]).includes(slot.id)) return [];
  switch (slot.group) {
    case "exterior":
      return ["IMG-PRJ-ROWDAH-EXT"];
    case "interior":
      return ["IMG-UNIT-APT-3BR-LIVING"];
    case "editorial":
      return ["IMG-ED-BALAD-RAWASHEEN", "IMG-ED-CORNICHE-DAWN"];
    case "brand":
      return ["IMG-PRJ-ROWDAH-EXT"];
    default:
      return [];
  }
}
