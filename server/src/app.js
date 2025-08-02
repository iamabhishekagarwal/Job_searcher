import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user.js';
import cookieParser from 'cookie-parser';
import qs from "qs";
import jobRouter from './routes/jobs.js';
import { enqueueJobsForCleanup } from './cron/enqueueJobsCleanup.js';
import cron from 'node-cron'

const app = express();
app.set("query parser", str => qs.parse(str));
dotenv.config()
app.use(cookieParser())
app.use(express.json());
console.log(process.env.Origin)
app.use(cors(
    {
        credentials:true,
        origin:process.env.Origin
    }
));
console.log(new Date())
app.use('/api/user',userRouter);
app.use('/api/user/jobs',jobRouter);

cron.schedule('40 18 * * *', async () => {
  console.log("Starting cleanup job...");
  await enqueueJobsForCleanup();
});      

app.listen(process.env.port,async()=>{
    console.log("Server is listening on port ",process.env.port);
})