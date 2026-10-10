import type { Screen } from "./types";
import { screens as foundation } from "./foundation";
import { screens as g1 } from "./g1-shell";
import { screens as g2 } from "./g2-results";
import { screens as g3 } from "./g3-unit";
import { screens as g4 } from "./g4-places";
import { screens as g5 } from "./g5-forms";
import { screens as g6 } from "./g6-alliance";
import { screens as g7 } from "./g7-admin";
import { screens as g8 } from "./g8-content";
import { screens as g9 } from "./g9-room";
import { screens as presenter } from "./presenter";

export type { Screen } from "./types";
export const SECTIONS = [
  "0 · Options",
  "1–12 · Public site, round 1",
  "13–15 · Sheets",
  "16–22 · Admin",
  "23–29 · Public, round 2",
  "30–32 · تعاون معنا",
  "33 · Member pages",
  "34–37 · Admin: marketers and the alliance room",
  "Presenter layer",
] as const;
export const allScreens: Screen[] = [...foundation, ...g1, ...g2, ...g3, ...g4, ...g5, ...g6, ...g7, ...g8, ...g9, ...presenter];
