import { launch, newPage, settle } from "./lib";
const url = process.argv[2]; const width = parseInt(process.argv[3] ?? "1440", 10);
const browser = await launch();
const page = await newPage(browser, width, 900);
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log(`[${m.type()}]`, m.text().slice(0, 3000)); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(-1800)));
await page.goto(url, { waitUntil: "load" });
await settle(page, 2500);
await browser.close();
