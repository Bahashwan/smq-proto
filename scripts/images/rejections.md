# Rejected candidates

One line per rejected candidate: slot · candidate · reason (people, text, signage, plates, non-Jeddah skyline, warped architecture, off-look).

- IMG-PRJ-ROWDAH-EXT · c1 · sea directly behind the building (الروضة is inland; reads as a claimed view)
- IMG-UNIT-APT-3BR-LIVING · c1 · prominent sea view through the balcony (claimed view); c2 picked provisionally, to be regenerated with «view of low-rise neighbours and sky, no sea»
- IMG-ED-BALAD-RAWASHEEN · c2 · hazy, building cropped at the frame edge
- IMG-ED-CORNICHE-DAWN · c2 · fountain and a hotel skyline too present

## 2026-10-10 · claimed sea views (Unit-Tier-Gen-M rule «لا إطلالات حقيقية مزعومة»)

The first project and unit run copied the sea from the anchors: sea behind both facades, through the entrance, lobby and parking openings, and through the windows of the living rooms, bedrooms, kitchens, bath and maid room. Al Rawdah is inland, so every exterior, interior and brand slot was rejected (moved to `public/images/_candidates/_rejected/`) and regenerated with the INLAND clause in `scripts/images/manifest.ts`, starting from new anchors.

- IMG-ED-CORNICHE-WALK · c1, c2 · near-copies of the CORNICHE-DAWN reference, no black railing, no low viewpoint → regenerated text-only
- IMG-ED-BALAD-ALLEY · c2 · sea at the end of the alley reads less like Al-Balad's lanes than c1
- IMG-ED-BALAD-CORAL-DETAIL · c2 · a sea view instead of the coral texture the slot asks for
- IMG-ED-NORTH-VILLAS · c2 · reads as a waterfront promenade, not a villa row
- IMG-ED-ROWDAH-TREES · c2 · rawasheen on Al Rawdah houses (Al-Balad detail out of place)
- IMG-ED-SEA-HAZE · c1 · dark banding at the horizon

## 2026-10-10 · AI Gateway credit exhausted at $2.85

Generation stopped with «A positive credit balance is required» after the new IMG-PRJ-ROWDAH-EXT candidates. Picked from what exists without a claimed view: ROWDAH-EXT c1 (inland rerun), APT-BALCONY c2, SMARTHOME-DETAIL c1, HERO-BRAND c1 (brand slot, real mark composited in CSS). Every other project and unit slot keeps the designed placeholder (generated tier without a file, «صورة تعبيرية») until the account is topped up and `npm run images -- --parallel=3` regenerates them with the INLAND clause. The interior anchor IMG-UNIT-APT-3BR-LIVING must be regenerated and picked first (`--anchors`), then the rest.
