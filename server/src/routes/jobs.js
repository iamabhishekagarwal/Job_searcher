import { Router } from "express";
import { prisma } from "../helper/pooler.js";
import { authenticate } from "../middlewares/authenticate.js";

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

jobRouter.delete("/:id/delete", authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const userId = req.user.userId;
    const jobs = await prisma.savedJobs.findFirst({
      where: {
        jobId,
        userId,
      },
      select: {
        id: true,
      },
    });
    console.log(jobs);
    await prisma.savedJobs.delete({
      where: {
        id: jobs.id,
      },
    });
    res
      .status(200)
      .json({ success: true, msg: "Job is Successfully deleted!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
});

jobRouter.get("/allSaved", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobs = await prisma.savedJobs.findMany({
      where: {
        userId,
      },
      select: { job: true },
    });
    res.status(200).json({ success: true, msg: "Success", jobs });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
});

//APPLIED JOBS section pls dont touch

jobRouter.post("/applied/add", authenticate, async (req, res) => {
  try {
    const userID = req.user.userId;
    const { jobIDs } = req.body; // Array of job IDs

    const data = jobIDs.map((jobId) => ({ userId: userID, jobId }));

    const appliedJobs = await prisma.appliedJobs.createMany({
      data,
      skipDuplicates: true,
    });

    res.json({
      message: "Jobs applied successfully",
      count: appliedJobs.count,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

jobRouter.get("/applied", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const applied = await prisma.appliedJobs.findMany({
      where: { userId },
      include: {
        Job: true,
      },
    });
    res.json(applied);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

jobRouter.delete("/applied/delete/:id", authenticate, async (req, res) => {
  try {
    const userID = req.user.userId;
    const { id } = req.params;
    console.log(req.user);

    const deleted = await prisma.appliedJobs.deleteMany({
      where: { id: Number(id), userId: userID },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Applied job not found" });
    }

    res.json({ message: "Applied job deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default jobRouter;
