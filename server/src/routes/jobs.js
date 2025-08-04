import { Router } from 'express';
import { prisma } from '../helper/pooler.js';
import { authenticate } from '../middlewares/authenticate.js';

const jobRouter = Router();

jobRouter.post("/:id/save", authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const userId = req.user.userId;
    const job = await prisma.savedJobs.create({
      data: {
        userId,
        jobId,
      },
    });
    res.status(200).json({ success: true, msg: "Job Saved!", job });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
});

jobRouter.delete("/:id/delete",authenticate,async(req,res)=>{
    try{
        const jobId = parseInt(req.params.id)
        const userId = req.user.userId
        const jobs = await prisma.savedJobs.findFirst({
            where:{
                jobId,
                userId
            }, 
            select:{
                id:true
            }
        })
        console.log(jobs)
        await prisma.savedJobs.delete({
            where:{
                id:jobs.id
            }
        })
        res.status(200).json({"success":true , "msg":"Job is Successfully deleted!"})
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({"success":false , "msg":"Something went wrong"})
    }
})

jobRouter.get("/allSaved",authenticate,async(req,res)=>{
     try{
        const userId = req.user.userId
        const jobs = await prisma.savedJobs.findMany({
            where:{
                userId
            },
            select:{job:true}
        })
        res.status(200).json({"success":true , "msg":"Success",jobs})
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({"success":false , "msg":"Something went wrong"})
    }
})

export default jobRouter;
