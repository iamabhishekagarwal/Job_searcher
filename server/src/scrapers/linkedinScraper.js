import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
import dotenv from "dotenv";
import { setTimeout as sleep } from "node:timers/promises";

dotenv.config();

puppeteer.use(
  StealthPlugin({
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
    platform: "Win32",
    webglVendor: "Intel Inc.",
    renderer: "Intel Iris OpenGL Engine",
    fixHairline: true,
  })
);

const LOG_PATH = "./../logs/linkedin.json";
const HTML_DIR = "./../html/linkedIn";

function saveLog(logs) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

let completionLogs = { currentCategory: null, currentTitle: null };
try {
  completionLogs = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
} catch {
  // If log file doesn't exist or corrupted, start fresh
  completionLogs = { currentCategory: null, currentTitle: null };
}

async function launchBrowser(proxy) {
  return await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${proxy}`,
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--disable-web-security",
    ],
  });
}

async function run() {
  const data = JSON.parse(fs.readFileSync("./src/data/widerJobs.json", "utf-8"));

  const originalProxy = process.env.PROXY;
  const anonymizedProxy = await proxyChain.anonymizeProxy(originalProxy);
  console.log(`Using anonymized proxy: ${anonymizedProxy}`);

  let browser = await launchBrowser(anonymizedProxy);
  const page = await browser.newPage();

  // Flags to control resuming properly
  let resumeCategory = !completionLogs.currentCategory;
  let resumeTitle = !completionLogs.currentTitle;

  for (let i = 0; i < data.length; i++) {
    const section = data[i];
    if (!resumeCategory) {
      if (section.category === completionLogs.currentCategory) {
        resumeCategory = true;
      } else {
        continue;
      }
    }

    if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR, { recursive: true });

    for (let j = 0; j < section.titles.length; j++) {
      const title = section.titles[j];

      if (!resumeTitle) {
        if (title === completionLogs.currentTitle) {
          resumeTitle = true;
        } else {
          continue;
        }
      }

      console.log(`📂 Category: ${section.category}`);
      console.log(`🔖 Title: ${title}`);

      const newTitle = title.toLowerCase().replace(/\s+/g, "-");
      const url = `https://in.linkedin.com/jobs/${newTitle}-jobs`;
      console.log(`🌐 Loading URL: ${url}`);

      try {
        // Retry navigation up to 3 times in case of network/detached frame errors
        let tries = 0;
        while (tries < 3) {
          try {
            await page.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });
            await page.waitForSelector("div.base-card", { timeout: 15000 });
            break;
          } catch (err) {
            const msg = err.message || "";
            if (msg.includes("detached Frame") || msg.includes("Timeout")) {
              tries++;
              console.warn(`⚠️ Navigation issue on URL, retrying (${tries})...`);
              if (tries === 3) throw err;
              continue;
            } else {
              throw err;
            }
          }
        }

        // Try to close any sign-in pop-ups quietly
        try {
          await page.click("button.contextual-sign-in-modal__modal-dismiss, button.sign-in-modal__dismiss", { timeout: 5000 });
          console.log("❎ Closed sign-in popup.");
          await sleep(2000);
        } catch {}

        // Pagination simulation: Scroll and click "See more jobs" up to a max
        let lastJobCount = 0;
        let clicks = 0;
        const MAX_CLICKS = 50;

        while (true) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await sleep(2000 + Math.random() * 2000);

          const moreButton = await page.$("button.infinite-scroller__show-more-button.infinite-scroller__show-more-button--visible");
          if (moreButton) {
            await moreButton.evaluate((btn) => btn.scrollIntoView({ block: "center" }));
            await sleep(1000);
            await moreButton.click();
            clicks++;
            console.log(`➡️ Clicked 'See more jobs' (${clicks})`);
            await sleep(3000 + Math.random() * 2000);
            if (clicks > MAX_CLICKS) {
              console.warn(`⚠️ Reached max clicks (${MAX_CLICKS}), stopping.`);
              break;
            }
          } else {
            // No more button found, check if new jobs loaded by scrolling more
            await sleep(1200);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await sleep(1200);

            const jobCount = await page.$$eval("div.base-card", (cards) => cards.length);
            if (jobCount === lastJobCount) {
              break; // no new jobs loaded
            }
            lastJobCount = jobCount;
            console.log("🔄 Scrolled more, new jobs detected, continuing...");
          }
        }

        // Extract job cards
        const cards = await page.$$("div.base-card");
        console.log(`✅ Found ${cards.length} job cards`);

        for (let k = 0; k < cards.length; k++) {
          const html = await page.evaluate((el) => el.outerHTML, cards[k]);
          const filePath = path.join(HTML_DIR, `${newTitle}_${k}.html`);
          fs.writeFileSync(filePath, html, "utf-8");
        }
        console.log("✅ Saved all job cards.");

      } catch (err) {
        console.error(`❌ Error scraping "${title}":`, err);
        try {
          await page.screenshot({ path: `debug_${newTitle}.png`, fullPage: true });
          console.log("🖼 Screenshot saved for debugging");
        } catch (screenshotErr) {
          console.error("❌ Screenshot failed:", screenshotErr.message);
        }
        // Save progress and abort?
        saveLog(completionLogs);
        throw err; // or continue; depending on your retry/liveness strategy
      }

      // Update progress after completing scraping for this title
      completionLogs.currentCategory = section.category;
      completionLogs.currentTitle = section.titles[j + 1] ?? null;
      saveLog(completionLogs);

      if (completionLogs.currentTitle === null) {
        // No more titles, move to next category
        break;
      }
    }

    // Finished category, update progress
    completionLogs.currentCategory = data[i + 1]?.category ?? null;
    completionLogs.currentTitle = data[i + 1]?.titles?.[0] ?? null;
    saveLog(completionLogs);

    if (completionLogs.currentCategory === null) {
      // All done
      break;
    }
  }

  // Clean up
  await browser.close();
  await proxyChain.closeAnonymizedProxy(anonymizedProxy, true);
  console.log("🛑 Finished scraping LinkedIn jobs.");
}

run().catch((err) => {
  saveLog(completionLogs);
  console.error("❌ Unhandled error:", err);
  process.exit(1);
});
