// components/map · schematic SVG map, pin picker and the keyless embed container. No map library, no key.
export { SchematicMap, DEFAULT_LEGEND, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "./SchematicMap";
export type { MapPin, SchematicMapProps } from "./SchematicMap";
export { PinPicker, PICKER_HINT, PICKER_PREVIEW_HINT, PICKER_LINK_PLACEHOLDER, PICKER_UNKNOWN } from "./PinPicker";
export type { PinPickerProps, PinPickerMode, PinPickerChange, LinkState } from "./PinPicker";
export { MapEmbed, MapFrame, embedUrl, OFFICE_ZOOM, PROJECT_ZOOM, EMBED_TIMEOUT_MS, DIRECTIONS_LABEL } from "./MapEmbed";
export type { MapEmbedProps } from "./MapEmbed";
export {
  MapPlaceholder,
  OfficePlaceholder,
  ProjectPlaceholder,
  OfficeDrawing,
  ProjectDrawing,
  OFFICE_CHIP,
  OFFICE_CAPTION,
  OFFICE_CAPTION_SHORT,
  PROJECT_CHIP,
  PROJECT_CAPTION,
} from "./placeholders";
export { HexPin, PinMarker } from "./HexPin";
export type { PinKind } from "./HexPin";
export { SchematicDrawing } from "./Drawing";
export {
  DESKTOP,
  PHONE,
  DISTRICTS,
  OFFICE,
  RAWDAH_CENTRE,
  PICKER_WINDOW,
  getGeometry,
  fullWindow,
  clampToWindow,
  latLngToSvg,
  svgToLatLng,
  scalePoint,
  districtPin,
  districtLabel,
  districtRef,
  formatCoord,
  isMapsLink,
  parseMapsLink,
} from "./geometry";
export type { MapVariant, XY, LatLng, LabelPos, ViewWindow, LinearFit, SchematicGeometry, DistrictRef, Sector } from "./geometry";
