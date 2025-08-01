import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user.js';
import cookieParser from 'cookie-parser';
import qs from "qs";
import jobRouter from './routes/jobs.js';

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

app.use('/api/user',userRouter);
app.use('/api/user/jobs',jobRouter);

app.listen(process.env.port,async()=>{
    console.log("Server is listening on port ",process.env.port);
})