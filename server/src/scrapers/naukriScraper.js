import dotenv from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import path from "path";
import { anonymizeProxy, closeAnonymizedProxy } from "proxy-chain";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

dotenv.config();

function saveLog() {
  writeFileSync(
    "./../logs/naukri.json",
    JSON.stringify(completionLogs, null, 2),
    "utf8"
  );
}

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

let completionLogs = {};
try {
  completionLogs = JSON.parse(readFileSync("./../logs/naukri.json", "utf-8"));
} catch {
  completionLogs = {
    currentCategory: null,
    currentTitle: null,
    currentPage: 1,
  };
}

async function launchBrowser() {
  const originalProxy = process.env.PROXY;
  console.log("🆕 Launching browser...");

  let proxy = null;
  if (originalProxy) {
    proxy = await anonymizeProxy(originalProxy);
    console.log("  Using proxy:", proxy);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      proxy ? `--proxy-server=${proxy}` : "",
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--disable-web-security",
    ].filter(Boolean),
  });

  return { browser, proxy };
}

async function closeBrowser(browserObj) {
  try {
    await browserObj.browser.close();
  } catch {}
  if (browserObj.proxy) {
    await closeAnonymizedProxy(browserObj.proxy, true);
  }
  console.log("🛑 Closed browser and proxy");
}

async function run() {
  const data = JSON.parse(readFileSync("./src/data/widerJobs.json", "utf-8"));

  let browserObj = await launchBrowser();
  let pagesScraped = 0;
  const PAGES_PER_BROWSER = 500;

  const outputDir = "./../html/naukri";
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  let resumeCategory = !completionLogs.currentCategory;
  for (let i = 0; i < data.length; i++) {
    const section = data[i];
    if (!resumeCategory) {
      if (section.category === completionLogs.currentCategory) {
        resumeCategory = true;
      } else {
        continue;
      }
    }

    let resumeTitle = !completionLogs.currentTitle;
    for (let j = 0; j < section.titles.length; j++) {
      const title = section.titles[j];
      if (!resumeTitle) {
        if (title === completionLogs.currentTitle) {
          resumeTitle = true;
        } else {
          continue;
        }
      }

      const slug = title.toLowerCase().replace(/\s+/g, "-");

      // Get total pages
      let totalPages = 1;
      {
        const page = await browserObj.browser.newPage();
        try {
          const url1 = `https://www.naukri.com/${slug}-jobs-1`;
          await page.goto(url1, { waitUntil: "domcontentloaded", timeout: 30000 });
          await page.waitForSelector("span.styles_count-string__DlPaZ", { timeout: 10000 });

          const countString = await page.$eval(
            "span.styles_count-string__DlPaZ",
            el => el.textContent
          );
          const match = countString.match(/of\s+(\d+)/i);
          if (match) {
            const totalJobs = parseInt(match[1], 10);
            totalPages = Math.ceil(totalJobs / 20);
          }
        } catch (err) {
          console.error(`❌ Error getting total pages for ${slug}:`, err.message);
        } finally {
          await page.close();
        }
      }

      console.log(`🔎 "${title}" → ${totalPages} pages`);

      let startPage = completionLogs.currentTitle === title ? completionLogs.currentPage : 1;
      for (let pageNum = startPage; pageNum <= totalPages; pageNum++) {
        // Restart browser if needed
        if (pagesScraped >= PAGES_PER_BROWSER) {
          await closeBrowser(browserObj);
          browserObj = await launchBrowser();
          pagesScraped = 0;
        }

        let page = await browserObj.browser.newPage();
        const url = `https://www.naukri.com/${slug}-jobs-${pageNum}`;
        console.log(`🌐 Loading page ${pageNum} of ${totalPages}: ${url}`);

        page.on("popup", async popup => {
          try {
            await popup.close();
          } catch {}
        });

        let tries = 0;
        while (tries < 3) {
          try {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
            await page.waitForSelector("div.cust-job-tuple", { timeout: 10000 });
            break;
          } catch (err) {
            if (err.message.includes("detached frame")) {
              console.warn(`⚠️ Detached frame on page ${pageNum}, retrying...`);
              tries++;
              await page.close();
              page = await browserObj.browser.newPage();
              continue;
            } else {
              console.error(`❌ Navigation error on ${url}:`, err.message);
              break;
            }
          }
        }

        try {
          const cards = await page.$$("div.cust-job-tuple");
          console.log(`  ✅ Found ${cards.length} job cards`);

          for (let k = 0; k < cards.length; k++) {
            const outerHTML = await page.evaluate(el => el.outerHTML, cards[k]);
            const filename = path.join(outputDir, `${slug}_p${pageNum}_c${k}.html`);
            writeFileSync(filename, outerHTML, "utf-8");
          }
        } catch (err) {
          console.error(`❌ Error saving cards on page ${pageNum}:`, err.message);
        } finally {
          await page.close();
        }

        await sleep(1000 + Math.random() * 2000);
        pagesScraped++;

        // Update progress
        completionLogs.currentCategory = section.category;
        completionLogs.currentTitle = title;
        completionLogs.currentPage = pageNum + 1;
        saveLog();
      }

      // Move to next title
      completionLogs.currentTitle = section.titles[j + 1] ?? null;
      completionLogs.currentPage = 1;
      saveLog();
    }

    // Move to next category
    completionLogs.currentCategory = data[i + 1]?.category ?? null;
    completionLogs.currentTitle = null;
    completionLogs.currentPage = 1;
    saveLog();
  }

  await closeBrowser(browserObj);
}

run().catch((err) => {
  saveLog();
  console.error("Unhandled error:", err);
  process.exit(1);
});
