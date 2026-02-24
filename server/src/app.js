import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import jobRouter from "./routes/jobs.js";
import cookieParser from "cookie-parser";
import qs from "qs";
import cron from "node-cron";
import helmet from "helmet";
import resourcesAreFree from "./helper/resourceCheck.js";
import { exec } from "child_process";
import { prisma } from "./helper/pooler.js";
import parseHtmlLinkedin from "./helper/converter/parseLinkedInCards.js";
import parseHtmlNaukri from "./helper/converter/parseNaukriCards.js";
import { addJobs } from "./helper/addInstance.js";
import fs from "fs";
import { link } from "fs";
import path from "path";
import { spawn } from "child_process";

function runScript(scriptName) {
  const scripts = {
    scrapeLinkedin: "./src/scrapers/linkedinScraper.js",
    scrapeNaukri: "./src/scrapers/naukriScraper.js",
  };

  const file = scripts[scriptName];

  if (!file) {
    return Promise.reject(new Error("Invalid script"));
  }

  return new Promise((resolve) => {
    const child = spawn("node", [file], {
      detached: true,
      stdio: "inherit",
    });

    child.on("exit", (code, signal) => {
      console.log(`📤 ${scriptName} exited (code: ${code}, signal: ${signal})`);

      if (code === 0) {
        console.log(`✅ ${scriptName} finished`);
      } else {
        console.warn(`⚠️ ${scriptName} exited with issues`);
      }

      resolve(); // ✅ always continue
    });

    child.on("error", (err) => {
      console.error(`❌ Failed to start ${scriptName}:`, err);
      resolve();
    });
  });
}

let isScraperRunning = false;

const app = express();
app.set("query parser", (str) => qs.parse(str));
dotenv.config();
app.use(cookieParser());
app.use(express.json());
app.disable("x-powered-by");

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
  }),
);
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));

app.use(helmet.frameguard({ action: "deny" })); // Block all iframes

app.use(
  helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }),
);

app.use(
  cors({
    credentials: true,
    origin: process.env.Origin,
  }),
);

app.use("/api/user", userRouter);
app.use("/api/user/jobs", jobRouter);

cron.schedule("10 4 * * *", async () => {
  try {
    const now = new Date();

    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - process.env.Delete_date);

    const result = await prisma.job.deleteMany({
      where: {
        postedAt: {
          lte: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${result.count} jobs older than 30 days`);
  } catch (err) {
    console.error("Error deleting old jobs:", err);
  }
});

cron.schedule("*/ * * * *", async () => {
  if (isScraperRunning) {
    console.warn("⚠️ Previous scraper still running, skipping...");
    return;
  }

  isScraperRunning = true;

  try {
    console.info("⏳ Running job scrapers...");

    await runScript("scrapeLinkedin");
    await new Promise((res) => setTimeout(res, 2000));
    /* =======================
       🔵 LINKEDIN PARSE
    ======================= */
    const linkedinPath = path.resolve("../html/linkedIn");

    let linkedInData = [];

    if (fs.existsSync(linkedinPath)) {
      const filesLinkedin = fs
        .readdirSync(linkedinPath)
        .filter((file) => file.endsWith(".html"))
        .map((file) => path.join(linkedinPath, file));

      console.log(`📂 LinkedIn files: ${filesLinkedin.length}`);

      if (filesLinkedin.length > 0) {
        linkedInData = parseHtmlLinkedin(filesLinkedin);
        console.log(`📊 Parsed LinkedIn jobs: ${linkedInData.length}`);
      }
    }

    const allJobs = [...linkedInData.map((job) => ({ ...job, sourceId: 1 }))];

    if (allJobs.length === 0) {
      console.warn("⚠️ No jobs to insert");
      return;
    }

    await addJobs(allJobs);

    console.info(`✅ Inserted ${allJobs.length} jobs`);
  } catch (err) {
    console.error("❌ Cron failed:", err);
  } finally {
    isScraperRunning = false; // ✅ VERY IMPORTANT
  }
});

app.listen(process.env.port, async () => {
  console.log("Server is listening on port ", process.env.port);
});
