import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/user';
const app = express();
dotenv.config()
app.use(express.json());
app.use(cors());

app.use('/api/user',router);

app.listen(process.env.port,async()=>{
    console.log("Server is listening on port ",process.env.port);
})