// // workers/jobCleanupWorker.js

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
import { prisma } from "../helper/pooler.js";
import { jobQueue } from "../queues/jobQueue.js";
import dotenv from "dotenv";
dotenv.config();

const proxyUrlRaw = process.env.PROXY; // e.g. http://user:password@host:port

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

jobQueue.process(6, async (job, done) => {
  const { jobUrl, jobId, date } = job.data;
  let browser;
  let anonymizedProxyUrl;
  let page;
  try {
    // Anonymize proxy (handles any scheme and authentication)
    anonymizedProxyUrl = await proxyChain.anonymizeProxy(proxyUrlRaw);

    browser = await puppeteer.launch({
      headless: true, // use true for older Puppeteer
      args: [
        `--proxy-server=${anonymizedProxyUrl}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
        "--disable-web-security",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    page = await browser.newPage();
    console.log(`🟢 Navigating to ${jobUrl}...`);
    const response = await page.goto(jobUrl, {
      waitUntil: "networkidle0",
    });
    await page.waitForSelector("#reg-apply-button", { visible: true });
    console.log(`🔍 HTTP Status: ${response?.status()} for job ${jobId}`);
    // Ensure page is loaded before reading content
    const pageContent = await page.evaluate(() => document.body.innerText);
    const lowerCaseHtml = pageContent.toLowerCase();
    // Check if job is closed
    if (
      lowerCaseHtml.includes("job not found") ||
      lowerCaseHtml.includes("application closed") ||
      lowerCaseHtml.includes("404") ||
      lowerCaseHtml.includes("no longer accepting applications")
    ) {
      console.log(`❌ Deleting job ${jobId}: no longer valid`);
      console.log(page.url());

      // await prisma.job.delete({ where: { id: jobId } });
    } else {
      console.log(`✅ Job ${jobId} is still active.`);
      const newDate = new Date(
        new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000
      ); // +7 days
      await prisma.job.update({
        where: { id: jobId },
        data: {
          deadline: newDate,
          lastVerified: new Date(),
        },
      });
    }
    done();
  } catch (err) {
    console.error(`🛑 Error checking job ${jobId}:`, err);
    done(err);
    throw err; // Mark job as failed in Bull queue
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    if (anonymizedProxyUrl)
      await proxyChain.closeAnonymizedProxy(anonymizedProxyUrl, true);
  }
});
