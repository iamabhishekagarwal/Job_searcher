import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import dotenv from "dotenv";
import { setTimeout as sleep } from "node:timers/promises";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { anonymizeProxy, closeAnonymizedProxy } from "proxy-chain";

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

async function run() {
  const data = JSON.parse(
    readFileSync("./src/data/widerJobs.json", "utf-8")
  );
  const originalProxy = process.env.PROXY;
  const anonymizedProxy = await anonymizeProxy(originalProxy);
  console.log("Using proxy:", anonymizedProxy);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${anonymizedProxy}`,
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--disable-web-security",
    ],
  });

  const outputDir = "src/html/naukri";
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  for (const section of data) {
    for (const title of section.titles) {
      const slug = title.toLowerCase().replace(/\s+/g, "-");
      // Determine total pages on first page load
      let totalPages = 1;
      {
        const page = await browser.newPage();
        try {
          const url1 = `https://www.naukri.com/${slug}-jobs-1`;
          await page.goto(url1, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
          await page.waitForSelector(
            "span.styles_count-string__DlPaZ",
            { timeout: 10000 }
          );
          const countString = await page.$eval(
            "span.styles_count-string__DlPaZ",
            (el) => el.textContent
          );
          const match = countString.match(/of\s+(\d+)/i);
          if (match) {
            const totalJobs = parseInt(match[1], 10);
            totalPages = Math.ceil(totalJobs / 20);
          }
        } catch (err) {
          console.error(
            `❌ Error determining total pages for ${slug}:`,
            err
          );
        } finally {
          await page.close();
        }
      }

      console.log(`🔎 "${title}" → ${totalPages} pages`);

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        let page = await browser.newPage();

        const url = `https://www.naukri.com/${slug}-jobs-${pageNum}`;
        console.log(`🌐 Loading page ${pageNum}: ${url}`);

        // Prevent new tabs (popups) from stealing focus
        page.on("popup", async (popup) => {
          try {
            await popup.close();
          } catch {}
        });

        // Retry navigation on detached-frame errors
        let tries = 0;
        while (tries < 3) {
          try {
            await page.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });
            // Wait for job cards
            await page.waitForSelector("div.cust-job-tuple", {
              timeout: 10000,
            });
            break; // success
          } catch (err) {
            const msg = err.message || "";
            if (msg.includes("detached Frame")) {
              console.warn(
                `⚠️ Detached frame on page ${pageNum}, retrying...`
              );
              tries++;
              await page.close();
              page = await browser.newPage();
              continue;
            } else {
              console.error(
                `❌ Fatal navigation error on ${url}:`,
                err
              );
              break;
            }
          }
        }

        try {
          const cards = await page.$$("div.cust-job-tuple");
          console.log(`  ✅ Found ${cards.length} job cards`);
          for (let i = 0; i < cards.length; i++) {
            const outerHTML = await page.evaluate(
              (el) => el.outerHTML,
              cards[i]
            );
            const filename = path.join(
              outputDir,
              `${slug}_p${pageNum}_c${i}.html`
            );
            writeFileSync(filename, outerHTML, "utf-8");
          }
        } catch (err) {
          console.error(
            `❌ Error extracting/saving cards on page ${pageNum}:`,
            err
          );
        } finally {
          await page.close();
        }

        await sleep(1000 + Math.random() * 2000);
      }
    }
  }

  await browser.close();
  await closeAnonymizedProxy(anonymizedProxy, true);
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
