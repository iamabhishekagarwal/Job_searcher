// workers/jobCleanupWorker.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdBlockPlugin from "puppeteer-extra-plugin-adblocker";
// import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import { prisma } from "../helper/pooler.js";
import { jobQueue } from "../queues/jobQueue.js";
import dotenv from "dotenv";
dotenv.config();

const proxyHost = process.env.proxyHost;
const proxyUsername = process.env.proxyUsername;
const proxyPassword = process.env.proxyPassword;

puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockPlugin({ blockTrackersAndAnnoyances: true }));
jobQueue.process(6,async (job, done) => {
  const jobUrl = job.data.jobUrl;
  const jobId = job.data.jobId;
  const date = new Date(job.data.date);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        `--proxy-server=${proxyHost}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
    const page = await browser.newPage();
    await page.authenticate({
      username: proxyUsername,
      password: proxyPassword,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0.0.0 Safari/537.36"
    );
    await page.goto(jobUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

    const pageContent = await page.content();
    const lowerCaseHtml = pageContent.toLowerCase();

    // Look for key phrases that indicate the job is closed
    if (
      lowerCaseHtml.includes("job not found") ||
      lowerCaseHtml.includes("application closed") ||
      lowerCaseHtml.includes("404") ||
      lowerCaseHtml.includes("no longer accepting applications")
    ) {
      console.log(`Deleting job ${jobId}: no longer valid`);
      await prisma.job.delete({ where: { id: jobId } });
    } else {
      console.log(`Job ${jobId} is still active.`);
      const newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          deadline: newDate,
        },
      });
    }

    done();
  } catch (err) {
    console.error(`Error checking job ${jobId}:`, err.message);
    done(err); // mark job as failed for retry if needed
  }
});
