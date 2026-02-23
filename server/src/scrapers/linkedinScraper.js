import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
import dotenv from "dotenv";
import { setTimeout as sleep } from "node:timers/promises";

dotenv.config();

/* =========================
   🔧 STEALTH CONFIG
========================= */
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

/* =========================
   📁 PATHS
========================= */
const LOG_PATH = "./../logs/linkedin.json";
const HTML_DIR = "./../html/linkedIn";

/* =========================
   🧠 LOGGER
========================= */
function logStep(step, message) {
  console.log(`[${new Date().toISOString()}] [${step}] ${message}`);
}

/* =========================
   💾 SAVE LOG
========================= */
function saveLog(logs) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

/* =========================
   🔁 LOAD PREVIOUS STATE
========================= */
let completionLogs = { currentCategory: null, currentTitle: null };
try {
  completionLogs = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
  logStep("INIT", "Loaded previous progress log");
} catch {
  logStep("INIT", "No valid log found, starting fresh");
}

/* =========================
   🚀 LAUNCH BROWSER
========================= */
async function launchBrowser(proxy) {
  logStep("BROWSER", "Launching browser (HEADFUL mode)...");

  const browser = await puppeteer.launch({
    headless: true, // 👈 THIS is the key change
    defaultViewport: null, // 👈 opens full window
    args: [
      `--proxy-server=${proxy}`,
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--disable-web-security",
    ],
  });

  logStep("BROWSER", "Browser launched in headed mode");
  return browser;
}

/* =========================
   🧪 MAIN RUN
========================= */
async function run() {
  logStep("START", "Script started");

  const data = JSON.parse(
    fs.readFileSync("./src/data/widerJobs.json", "utf-8")
  );
  // console.log(data);
  const originalProxy = process.env.PROXY1;
  const anonymizedProxy = await proxyChain.anonymizeProxy(originalProxy);

  logStep("PROXY", `Using proxy: ${anonymizedProxy}`);

  const browser = await launchBrowser(anonymizedProxy);
  const page = await browser.newPage();

  logStep("PAGE", "New page created");

  let resumeCategory = !completionLogs.currentCategory;
  let resumeTitle = !completionLogs.currentTitle;

  for (let i = 0; i < data.length; i++) {
    const section = data[i];

    if (!resumeCategory) {
      if (section.category === completionLogs.currentCategory) {
        resumeCategory = true;
      } else continue;
    }
    console.log(section.category + " end ");
    if (!fs.existsSync(HTML_DIR)) {
      fs.mkdirSync(HTML_DIR, { recursive: true });
      logStep("FS", "Created HTML directory");
    }

    for (let j = 0; j < section.titles.length; j++) {
      const title = section.titles[j];

      if (!resumeTitle) {
        if (title === completionLogs.currentTitle) {
          resumeTitle = true;
        } else continue;
      }

      logStep("CATEGORY", section.category);
      logStep("TITLE", title);

      const newTitle = title.toLowerCase().replace(/\s+/g, "-");

      const url = `https://in.linkedin.com/jobs/search/?keywords=${newTitle}&location=India&f_TPR=r86400&f_E=1%2C2`;

      logStep("NAV", `Navigating to ${url}`);

      try {
        /* =========================
           🌐 NAVIGATION RETRY
        ========================= */
        let tries = 0;

        while (tries < 3) {
          try {
            logStep("NAV", `Attempt ${tries + 1}`);

            await page.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });

            const currentUrl = page.url();
            const pageTitle = await page.title();

            logStep("NAV", `Loaded URL: ${currentUrl}`);
            logStep("NAV", `Page title: ${pageTitle}`);

            if (pageTitle.toLowerCase().includes("login")) {
              logStep("BLOCKED", "⚠️ Redirected to login page");
            }

            // Save debug HTML
            const html = await page.content();
            fs.writeFileSync("debug_page.html", html);

            await page.waitForSelector("div.base-card", {
              timeout: 15000,
            });

            logStep("NAV", "Job cards detected");
            break;

          } catch (err) {
            tries++;
            logStep("ERROR", `Navigation error: ${err.message}`);

            if (tries === 3) throw err;
          }
        }

        /* =========================
           ❎ CLOSE POPUP
        ========================= */
        try {
          logStep("POPUP", "Trying to close popup...");
          await page.click(
            "button.contextual-sign-in-modal__modal-dismiss, button.sign-in-modal__dismiss",
            { timeout: 5000 }
          );
          logStep("POPUP", "Popup closed");
          await sleep(2000);
        } catch {
          logStep("POPUP", "No popup found");
        }

        /* =========================
           🔄 SCROLL + LOAD MORE
        ========================= */
        let lastJobCount = 0;
        let clicks = 0;

        while (true) {
          logStep("SCROLL", "Scrolling...");

          await page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );

          await sleep(2000 + Math.random() * 2000);

          const jobCount = await page.$$eval(
            "div.base-card",
            (cards) => cards.length
          );

          logStep("DATA", `Jobs loaded: ${jobCount}`);

          const moreButton = await page.$(
            "button.infinite-scroller__show-more-button.infinite-scroller__show-more-button--visible"
          );

          if (moreButton) {
            logStep("ACTION", "Found 'See more jobs'");

            await moreButton.evaluate((btn) =>
              btn.scrollIntoView({ block: "center" })
            );

            await sleep(1000);

            await moreButton.click();
            clicks++;

            logStep("ACTION", `Clicked (${clicks})`);

            await sleep(3000 + Math.random() * 2000);

            if (clicks > 50) {
              logStep("LIMIT", "Max clicks reached");
              break;
            }

          } else {
            logStep("ACTION", "No button found");

            if (jobCount === lastJobCount) {
              logStep("STOP", "No new jobs, stopping");
              break;
            }

            lastJobCount = jobCount;
          }
        }

        /* =========================
           📦 EXTRACT DATA
        ========================= */
        const cards = await page.$$("div.base-card");

        logStep("EXTRACT", `Total cards: ${cards.length}`);

        for (let k = 0; k < cards.length; k++) {
          const html = await page.evaluate(
            (el) => el.outerHTML,
            cards[k]
          );

          const filePath = path.join(
            HTML_DIR,
            `${newTitle}_${k}.html`
          );

          fs.writeFileSync(filePath, html);

          logStep("SAVE", `Saved ${newTitle}_${k}.html`);
        }

      } catch (err) {
        logStep("FATAL", `Error scraping ${title}`);
        console.error(err.message);
        console.error(err.stack);

        try {
          await page.screenshot({
            path: `debug_${newTitle}.png`,
            fullPage: true,
          });
          logStep("DEBUG", "Screenshot saved");
        } catch { }

        saveLog(completionLogs);
        throw err;
      }

      /* =========================
         💾 SAVE PROGRESS
      ========================= */
      completionLogs.currentCategory = section.category;
      completionLogs.currentTitle =
        section.titles[j + 1] ?? null;

      saveLog(completionLogs);

      if (completionLogs.currentTitle === null) break;
    }

    completionLogs.currentCategory =
      data[i + 1]?.category ?? null;
    completionLogs.currentTitle =
      data[i + 1]?.titles?.[0] ?? null;

    saveLog(completionLogs);

    if (completionLogs.currentCategory === null) break;
  }

  /* =========================
     🧹 CLEANUP
  ========================= */
  await browser.close();
  await proxyChain.closeAnonymizedProxy(anonymizedProxy, true);

  logStep("END", "Scraping finished");
}

/* =========================
   🧯 GLOBAL ERROR
========================= */
run().catch((err) => {
  saveLog(completionLogs);
  console.error("UNHANDLED ERROR:", err);
});