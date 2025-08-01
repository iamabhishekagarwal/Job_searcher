// workers/jobCleanupWorker.js
import axios from "axios";
import HttpsProxyAgent from "https-proxy-agent";
import { prisma } from "../helper/pooler.js";
import { jobQueue } from "../queues/jobQueue.js";
const proxyUrl = "http://hrqsqetk-rotate:01mulhsbe3b3@p.webshare.io:80";

jobQueue.process(async (job, done) => {
  const jobUrl = job.data.jobUrl;
  const jobId = job.data.jobId;
  const date = job.data.date;
  try {
    const res = await axios.get(jobUrl, {
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 5000, // 5 seconds timeout
    });

    const lowerCaseHtml = res.data.toLowerCase();

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
      const newDate = date+(60*1000*60*24*7)  // 7 days
      await prisma.job.update({
        where:{
            deadline:date
        },
        data:{
            deadline:newDate
        }
      });
    }

    done();
  } catch (err) {
    console.error(`Error checking job ${jobId}:`, err.message);
    done(err); // mark job as failed for retry if needed
  }
});
