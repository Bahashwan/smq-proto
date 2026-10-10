// End-to-end flows in one browser context (the in-memory store lives in sessionStorage, so state carries across pages).
// Usage: npx tsx scripts/qa/flows.ts [--base=http://localhost:3000]
import { launch } from "../shots/lib";

const base = process.argv.slice(2).find((a) => a.startsWith("--base="))?.slice(7) ?? "http://localhost:3000";
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ar-SA" });
await ctx.route(/fonts\.(googleapis|gstatic)\.com|maps\.google\.com|google\.com\/maps/, (r) => r.abort());
await ctx.addInitScript({ content: "window.__name = window.__name || ((f) => f);" });
const page = await ctx.newPage();
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(`${page.url().replace(base, "")}: ${e.message.slice(0, 160)}`));
let failed = 0;
const step = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`✗ ${name}: ${(e as Error).message.split("\n")[0].slice(0, 200)}`);
  }
};
const go = async (route: string) => {
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(700);
};

// Buyer: the finder count moves with the budget
await step("buyer · home finder recomputes when the budget changes", async () => {
  await go("/");
  const count = page.locator('[role="status"][aria-live="polite"] .text-gold').first();
  const before = (await count.textContent())?.trim();
  // nothing is listed between 690,000 and 1,600,000, so step down: 700,000 → 500,000 leaves the two D models
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: /أنقص الميزانية|Decrease/ }).first().click();
  await page.waitForTimeout(300);
  const after = (await count.textContent())?.trim();
  if (before === after) throw new Error(`count stayed ${before} after −200,000`);
  console.log(`    finder: ${before} → ${after}`);
});
await step("buyer · compare selection reaches /compare", async () => {
  await go("/compare?u=rz-d,ys-d,rz-c");
  const cols = await page.getByText(/نموذج D/).count();
  if (cols < 2) throw new Error("compare table missing models");
});

// Alliance: bridge request → member answers → admin creates the referral → member sees it
await step("alliance · empty state bridge form sends a request", async () => {
  await go("/units?district=faisaliyah&max=450000&beds=4&type=apt&feat=driver");
  await page.getByLabel("الاسم").first().fill("سعود");
  await page.getByLabel("الجوال").first().fill("0551234567");
  await page.getByLabel(/أوافق على أن تمرّر/).first().check();
  await page.getByRole("button", { name: "أرسل الطلب للتحالف" }).filter({ visible: true }).first().click();
  await page.waitForURL(/alliance\/request\/sent/, { timeout: 8000 });
});
await step("alliance · member office-09 answers REQ-2026-0412", async () => {
  await go("/member/office-09/requests/REQ-2026-0412");
  const submit = page.locator('form button[type="submit"]').first();
  await submit.click();
  await page.waitForTimeout(600);
  const answered = await page.getByText("مُجاب", { exact: true }).count();
  if (!answered) throw new Error("no answered state after submitting the offer");
});
await step("alliance · admin creates REF-2026-0117 from مكتب ط's offer", async () => {
  await go("/admin/alliance/requests?req=REQ-2026-0412");
  const create = page.getByRole("button", { name: /أنشئ سجل إحالة/ }).first();
  await create.click();
  await page.waitForTimeout(800);
  if (!/referrals|REF-2026-0117/.test(page.url() + (await page.content()))) throw new Error("referral not created");
});
await step("alliance · member sees the referral record", async () => {
  await go("/member/office-09/referrals/REF-2026-0117");
  if (!(await page.getByText("REF-2026-0117").count())) throw new Error("record not shown");
});

// Owner: the building variant computes its yield, the success screen echoes the request number
await step("owner · building details compute per-m² and gross yield", async () => {
  await go("/add/details?type=building");
  const text = await page.locator("main").innerText();
  if (!/العائد/.test(text) || !/\d+(\.\d+)?\s*%/.test(text)) throw new Error("no computed yield on the building step");
});
await step("owner · success screen shows 2026-1042", async () => {
  await go("/add/sent?no=2026-1042");
  if (!(await page.getByText("2026-1042").count())) throw new Error("request number missing");
});

// Owner: approval checklist then «اعتماد ونشر»
await step("owner · admin approves 2026-1042 after the checklist", async () => {
  await go("/admin/approvals/2026-1042");
  const boxes = page.locator('main input[type="checkbox"]:not(:checked)');
  const n = await boxes.count();
  for (let i = 0; i < n; i++) await boxes.nth(0).check({ force: true }).catch(() => {});
  const approve = page.getByRole("button", { name: /اعتماد ونشر/ }).first();
  if (await approve.isDisabled()) throw new Error("«اعتماد ونشر» still disabled after ticking the checklist");
  await approve.click();
  await page.waitForTimeout(600);
});

console.log(errors.length ? `page errors:\n  ${errors.join("\n  ")}` : "no page errors");
console.log(failed ? `${failed} flow step(s) failed` : "all flows pass");
await browser.close();
process.exitCode = failed || errors.length ? 1 : 0;
