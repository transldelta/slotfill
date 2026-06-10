/**
 * Launch Screenshots – ClinicSlotHub
 * Erstellt saubere PNG-Screenshots von der Live-Website ohne Browser-Chrome.
 */

import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public-launch-screenshots");

const SHOTS = [
  {
    file: "01-home-de-hero.png",
    url: "https://clinicslothub.com/de",
    width: 1440,
    height: 1000,
    waitFor: 3000,
    scrollTo: 0,
    label: "Startseite DE – Hero",
  },
  {
    file: "02-booking-form-de.png",
    url: "https://clinicslothub.com/de/termin-buchen",
    width: 1440,
    height: 1100,
    waitFor: 3000,
    scrollTo: 0,
    label: "Buchungsformular DE (leer)",
  },
  {
    file: "03-pricing-de.png",
    url: "https://clinicslothub.com/de/pricing",
    width: 1440,
    height: 1000,
    waitFor: 4000, // Plans laden via API
    scrollTo: 0,
    label: "Pricing DE",
  },
  {
    file: "04-blog-de.png",
    url: "https://clinicslothub.com/de/blog",
    width: 1440,
    height: 1100,
    waitFor: 3000,
    scrollTo: 0,
    label: "Blog DE – Übersicht",
  },
  {
    file: "05-home-en-hero.png",
    url: "https://clinicslothub.com/en",
    width: 1440,
    height: 1000,
    waitFor: 3000,
    scrollTo: 0,
    label: "Startseite EN – Hero",
  },
  {
    file: "06-mobile-home-de.png",
    url: "https://clinicslothub.com/de",
    width: 390,
    height: 844,
    waitFor: 3000,
    scrollTo: 0,
    label: "Mobile DE – Hero (iPhone 14 Pro)",
    mobile: true,
  },
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const shot of SHOTS) {
    console.log(`📸  ${shot.label} → ${shot.file}`);

    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: shot.mobile ? 2 : 1.5,
      colorScheme: "light",
      locale: shot.url.includes("/de") || shot.url.includes("/en") ? undefined : "de-DE",
    });

    const page = await context.newPage();

    try {
      await page.goto(shot.url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(shot.waitFor);

      if (shot.scrollTo > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), shot.scrollTo);
        await page.waitForTimeout(500);
      }

      // Cookie-Banner oder Overlays wegklicken falls vorhanden
      const cookieBtn = page.locator("button:has-text('Akzeptieren'), button:has-text('Accept'), button:has-text('OK')").first();
      if (await cookieBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieBtn.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `${OUT_DIR}/${shot.file}`,
        clip: { x: 0, y: 0, width: shot.width, height: shot.height },
        type: "png",
      });

      console.log(`   ✅ Gespeichert`);
    } catch (err) {
      console.error(`   ❌ Fehler: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log("\n✅ Alle Screenshots fertig.");
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
