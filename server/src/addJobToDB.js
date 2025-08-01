//DONT run the same code always change the details
import { prisma } from "./helper/pooler.js";

const response =await prisma.job.create({
  data: {
    title: "product designer",
    category: "designer",
    companyName: "Bito",
    location: "Pune",
    jobType: "Full Time",
    description: "...",
    salaryRange: null,
    postedAt: null,
    deadline: "2025-08-01T12:45:26.720Z",
    isActive: true,
    companyLogo: "",
    companyUrl: "https://www.instahyre.com/jobs-at-bito/",
    experience: "",
    jobUrl: "https://www.instahyre.com/job-381648-product-designer-at-bito-bangalore/",
    rating: 4,
    via: "instahyre.com",
    tags: {
      set: ["java"]
    },
    employer: {
      connect: {
        id: 1
      }
    }
    // ❌ Removed SavedJobs: {}
  },
  select: {
    id: true,
    title: true,
    category: true,
    companyName: true,
    location: true,
    jobType: true,
    description: true,
    salaryRange: true,
    postedAt: true,
    deadline: true,
    isActive: true,
    employerId: true,
    companyLogo: true,
    companyUrl: true,
    experience: true,
    jobUrl: true,
    rating: true,
    via: true,
    tags: true,
    employer: true,
    SavedJobs: true // ✅ It's OK in `select`, just not in `data`
  }
});
console.log(response)