// scraper.js
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
import dotenv from "dotenv";
import { setTimeout as sleep } from "node:timers/promises";

dotenv.config();

puppeteer.use(StealthPlugin({
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
    platform: "Win32",
    webglVendor: "Intel Inc.",
    renderer: "Intel Iris OpenGL Engine",
    fixHairline: true,
  }));

async function run() {
  const data = JSON.parse(fs.readFileSync("./src/data/widerJobs.json", "utf-8"));

  let anonymizedProxy = null;
  let browser = null;

  try {
    const originalProxy = process.env.PROXY;
    anonymizedProxy = await proxyChain.anonymizeProxy(originalProxy);

    console.log(`Using anonymized proxy: ${anonymizedProxy}`);

    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--proxy-server=${anonymizedProxy}`,
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();

    for (const section of data) {
      console.log(`📂 Category: ${section.category}`);

      for (const title of section.titles) {
        const newTitle = title.toLowerCase().replace(/\s+/g, "-");
        const url = `https://in.linkedin.com/jobs/${newTitle}-jobs`;
        console.log(`🌐 Loading: ${url}`);

        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

          await page.waitForSelector("div.base-card", { timeout: 10000 });

          try {
            await page.click(
              "button.contextual-sign-in-modal__modal-dismiss, button.sign-in-modal__dismiss",
              { timeout: 5000 }
            );
            console.log("❎ Closed sign-in popup.");
            await sleep(2000);
          } catch {}

          let lastJobCount = 0;
          let clicks = 0;
          while (true) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await sleep(2000 + Math.random() * 2000);

            const moreButton = await page.$(
              "button.infinite-scroller__show-more-button.infinite-scroller__show-more-button--visible"
            );
            if (moreButton) {
              await moreButton.evaluate((btn) => btn.scrollIntoView({ block: "center" }));
              await sleep(1000);
              await moreButton.click();
              if(clicks>50)break;
              clicks++;
              console.log(`➡️ Clicked 'See more jobs' (${clicks})`);
              await sleep(3000 + Math.random() * 2000);
            } else {
              await sleep(1200);
              await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
              await sleep(1200);

              const jobCount = await page.$$eval("div.base-card", cards => cards.length);
              if (jobCount === lastJobCount) {
                break;
              }
              lastJobCount = jobCount;
              console.log("🔄 No 'See more jobs' button, but more jobs detected. Scrolling again...");
            }
          }

          const cards = await page.$$("div.base-card");
          console.log(`✅ Final count: ${cards.length} job cards!`);

          const dir = path.join("src/html/linkedIn");
          if (!fs.existsSync(dir)) fs.mkdirSync(dir);

          for (let i = 0; i < cards.length; i++) {
            const html = await page.evaluate((el) => el.outerHTML, cards[i]);
            const filePath = path.join(dir, `${newTitle}_${i}.html`);
            fs.writeFileSync(filePath, html, "utf-8");
          }
          console.log("✅ Saved all job cards.");
        } catch (err) {
          console.error("❌ Error:", err);
          try {
            await page.screenshot({
              path: `debug_${newTitle}.png`,
              fullPage: true,
            });
          } catch (screenshotErr) {
            console.error("❌ Screenshot failed:", screenshotErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Fatal Error:", err);
  } finally {
    if (browser) await browser.close();
    if (anonymizedProxy) await proxyChain.closeAnonymizedProxy(anonymizedProxy, true);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
