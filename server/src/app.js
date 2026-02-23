import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import jobRouter from "./routes/jobs.js";
import cookieParser from "cookie-parser";
import qs from "qs";
import { enqueueJobsForCleanup } from "./cron/enqueueJobsCleanup.js";
import cron from "node-cron";
import helmet from "helmet";
import deleteJobs from "./cron/deleteJobs.js";
import resourcesAreFree from "./helper/resourceCheck.js";
import { exec } from "child_process";
import { prisma } from "./helper/pooler.js";
import parseHtmlLinkedin from "./helper/converter/parseLinkedInCards.js";
import parseHtmlNaukri from "./helper/converter/parseNaukriCards.js";
import { addJobs } from "./helper/addInstance.js";
import fs from "fs";
import { link } from "fs";
import path from "path";

function runScript(scriptName) {
  const child = exec(`npm run ${scriptName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error running ${scriptName}:`, error);
      return;
    }
    if (stderr) {
      console.error(`⚠️ ${scriptName} stderr:`, stderr);
    }
    console.log(`📄 ${scriptName} output:\n${stdout}`);
  });
  setTimeout(() => {
    child.kill();
  }, 100000);

}

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

cron.schedule("47 15 * * *", async () => {
  console.log("Starting cleanup job...");
  await enqueueJobsForCleanup();
});

cron.schedule("0 3 * * *", async () => {
  console.info("Deleting Job started....");
  await deleteJobs();
});

cron.schedule("00 16 * * *", async () => {
  try {
    const now = new Date();

    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - 30);

    const result = await prisma.job.deleteMany({
      where: {
        postedAtDt: {
          lte: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${result.count} jobs older than 30 days`);
  } catch (err) {
    console.error('Error deleting old jobs:', err);
  }
});

/* =========================
   🕒 SCRAPER CRON (TEST - LINKEDIN ONLY)
========================= */

cron.schedule("* * * * *", async () => {
  try {
    console.info("⏳ Running job scrapers...");

    /* =======================
       🔵 RUN SCRAPERS
    ======================= */
    await runScript("scrapeLinkedin");
    await runScript("scrapeNaukri");

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
    } else {
      console.warn("⚠️ LinkedIn folder missing");
    }

    /* =======================
       🟡 NAUKRI PARSE
    ======================= */
    const naukriPath = path.resolve("../html/naukri");

    let naukriData = [];

    if (fs.existsSync(naukriPath)) {
      const filesNaukri = fs
        .readdirSync(naukriPath)
        .filter((file) => file.endsWith(".html"))
        .map((file) => path.join(naukriPath, file));

      console.log(`📂 Naukri files: ${filesNaukri.length}`);

      if (filesNaukri.length > 0) {
        naukriData = parseHtmlNaukri(filesNaukri);
        console.log(`📊 Parsed Naukri jobs: ${naukriData.length}`);
      }
    } else {
      console.warn("⚠️ Naukri folder missing");
    }

    /* =======================
       💾 COMBINE + INSERT
    ======================= */
    const allJobs = [
      ...linkedInData.map((job) => ({ ...job, sourceId: 1 })),
      ...naukriData.map((job) => ({ ...job, sourceId: 2 })),
    ];

    if (allJobs.length === 0) {
      console.warn("⚠️ No jobs to insert");
      return;
    }

    await addJobs(allJobs);

    console.info(`✅ Inserted ${allJobs.length} jobs`);

  } catch (err) {
    console.error("❌ Cron failed:", err);
  }
});

app.listen(process.env.port, async () => {
  console.log("Server is listening on port ", process.env.port);
});
