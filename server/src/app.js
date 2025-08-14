import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user.js';
import jobRouter from './routes/jobs.js';
import cookieParser from 'cookie-parser';
import qs from "qs";
import { enqueueJobsForCleanup } from './cron/enqueueJobsCleanup.js';
import cron from 'node-cron'
import helmet from 'helmet'
import deleteJobs from './cron/deleteJobs.js';
import resourcesAreFree from './helper/resourceCheck.js';
import { exec } from "child_process";

function runScript(scriptName) {
  const child=exec(`npm run ${scriptName}`, (error, stdout, stderr) => {
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
    console.warn(`⏹ Stopping ${scriptName} after 5 minutes`);
    child.kill("SIGTERM"); // or "SIGKILL" if you want it immediate
  }, 0.5 * 60 * 1000);
}

const app = express();
app.set("query parser", str => qs.parse(str));
dotenv.config()
app.use(cookieParser())
app.use(express.json());
app.disable('x-powered-by') 


app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
  }),
);
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(helmet.frameguard({ action: "deny" })); // Block all iframes
app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));app.use(cors(
    {
        credentials:true,
        origin:process.env.Origin
    }
));
app.use('/api/user',userRouter);
app.use('/api/user/jobs',jobRouter);

cron.schedule('40 18 * * *', async () => {
  console.log("Starting cleanup job...");
  await enqueueJobsForCleanup();
});  

cron.schedule('0 3 * * *',async()=>{
  console.info("Deleting Job started....")
  await deleteJobs();
})

//scraper cron job

cron.schedule('* * * * *',async()=>{
  if(resourcesAreFree()){
    console.info("⏳ Running scrapers for 5 minutes...");
    runScript("scrapeLinkedin");
    runScript("scrapeNaukri");
  }
  else{
    console.info("Scraping is postponed due to heavy traffic")
  }

})

app.listen(process.env.port,async()=>{
    console.log("Server is listening on port ",process.env.port);
})