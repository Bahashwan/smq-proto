/** One entry per board row of docs/route-map.md. Filled per page group; merged by /demo and the shots script. */
export interface Screen {
  board: string; // board file name without .html, e.g. "Home-M"
  route: string; // route with its state parameters, e.g. "/units?district=rawdah&max=700000"
  width: 390 | 1440;
  section: string; // docs/route-map.md section heading, e.g. "1–12 · Public site, round 1"
  note?: string;
  /** steps to reach the state before the screenshot (presenter agent / shots script interpret these) */
  prepare?: { click?: string; scroll?: number; wait?: number; fill?: Record<string, string> };
  /** screenshot the full page (default) or the viewport only */
  viewport?: boolean;
}
