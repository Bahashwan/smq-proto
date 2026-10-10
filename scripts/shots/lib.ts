// Shared Playwright helpers for page shots, board renders and OG renders.
import { chromium, type Browser, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const FONT_DIR = path.resolve("node_modules/@fontsource-variable/noto-kufi-arabic/files");
const LATIN_FONT_DIR = path.resolve("node_modules/@fontsource-variable/noto-sans/files");

/** @font-face rules that serve the Google-Fonts families the boards link from local files (no network). */
export function localFontCss(): string {
  const kufi = (f: string) => `url(file://${path.join(FONT_DIR, f)}) format('woff2-variations')`;
  const sans = (f: string) => `url(file://${path.join(LATIN_FONT_DIR, f)}) format('woff2-variations')`;
  return `
@font-face{font-family:'Noto Kufi Arabic';font-style:normal;font-weight:100 900;font-display:block;src:${kufi("noto-kufi-arabic-arabic-wght-normal.woff2")};unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200E,U+2010-2011;}
@font-face{font-family:'Noto Kufi Arabic';font-style:normal;font-weight:100 900;font-display:block;src:${kufi("noto-kufi-arabic-latin-wght-normal.woff2")};}
@font-face{font-family:'Noto Sans';font-style:normal;font-weight:100 900;font-display:block;src:${sans("noto-sans-latin-wght-normal.woff2")};}
`;
}

export async function launch(): Promise<Browser> {
  return chromium.launch({ headless: true });
}

export async function newPage(browser: Browser, width: number, height = 900): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: "ar-SA", reducedMotion: "reduce" });
  // never fetch Google Fonts over the network: the local files above serve the same families
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  return ctx.newPage();
}

export async function settle(page: Page, extraWait = 0) {
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForLoadState("networkidle").catch(() => {});
  if (extraWait) await page.waitForTimeout(extraWait);
}

export function ensureDir(file: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

export function boardWidth(board: string): 390 | 1440 {
  if (/-M$/.test(board)) return 390;
  return 1440;
}
