import { Router } from "express";
import { userSchema } from "../helper/userSchema.js";
import insertUser from "../helper/insertUser.js";
import { verifyUser } from "../helper/verifyUser.js";
import { generateToken } from "../helper/jwt.js";
import { authenticate } from "../middlewares/authenticate.js";
import { prisma } from "../helper/pooler.js";
import { authLimiter, globalLimiter, searchLimiter } from "../middlewares/rateLimiter.js";
const router = Router();

router.post("/signup",authLimiter, async (req, res) => {
  const { fname, lname, email, password, role } = req.body;
  const inputValidation = userSchema.safeParse({
    firstName: fname,
    lastName: lname,
    email: email,
    password: password,
    role: role,
  });
  if (!inputValidation.success) {
    return res.status(400).json({
      success: false,
      msg: "Please enter valid email or password(min:8)",
    });
  }
  try {
    const userExists = await verifyUser(email, password);
    if (userExists) {
      const token = generateToken({
        userId: userExists.id,
        email: userExists.email,
      });
      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000,
      });
      return res.json({ success: false, msg: "User already exists" });
    }
    const createUser = await insertUser(fname, lname, email, password, role);
    return res.status(200).json({ success: true, user: createUser });
  } catch {
    return res.status(500).json({ success: false, msg: "Error during signup" });
  }
});

router.post("/signin",authLimiter, async (req, res) => {
  const { email, password } = req.body;
  const inputValidation = userSchema.safeParse({ email, password });

  if (!inputValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Please enter valid email or password (min:8)",
    });
  }

  try {
    const user = await verifyUser(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.LastName,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/logout", authenticate, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    res
      .status(200)
      .json({ success: true, message: "Logged out successfully!" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user.userId;
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        role: true,
      },
    });
    res.json({ success: true, user: user });
  } catch (e) {
    res.send({ success: false, msg: "Error in authenticating" });
  }
});

router.get("/suggestions",searchLimiter, async (req, res) => {
  const query = req.query.query;
  query.toString();
  try {
    const jobs = await prisma.job.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
      },
      select: { title: true },
      distinct: ["title"],
      take: 5,
    });
    res.status(200).json(jobs.map((job) => job.title));
  } catch (e) {
    console.log(e);
    res.json([]);
  }
});

router.get("/filters", async (req, res) => {
  const { type, query = "", limit = 20 } = req.query;
  const fieldMap = {
    tags: "tags",
    locations: "location",
    companies: "companyName",
    experience: "experience",
    vias: "via",
  };
  const field = fieldMap[type];
  if (!field) return res.status(400).json({ error: "Invalid filter type" });

  let items = [];

  // TAGS: get all tags, flatten, then substring match
  if (field === "tags") {
    const jobs = await prisma.job.findMany({
      select: { tags: true },
      take: 1000, // Reasonable cap; large enough for diversity, not too big for RAM
    });
    const allTags = jobs.flatMap((job) => job.tags);
    items = [...new Set(allTags)]
      .filter(Boolean)
      .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
      .slice(0, +limit);
    return res.json({ items });
  }

  // OTHERS: fetch field values, deduplicate, substring match
  let where = {};
  if (query && field !== "tags") {
    // Optionally, use a very broad filter to not fetch all jobs for performance
    where = {
      [field]: {
        contains: query,
        mode: "insensitive",
      },
    };
  }

  const jobs = await prisma.job.findMany({
    where,
    take: 1000, // Cap for safety; adjust as needed
    select: { [field]: true },
  });

  items = [...new Set(jobs.map((job) => job[field]))]
    .filter(Boolean)
    .filter(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(query.toLowerCase())
    );

  // Special location postprocessing
  if (field === "location") {
    items = [
      ...new Set(
        items.flatMap((locStr) =>
          locStr.split(/,|\/|\s\/\s/).map((part) =>
            part
              .trim()
              .replace("hybrid -", "")
              .replace(/\(.*?\)/g, "")
              .replace(/\+.*$/, "")
              .replace(/\s*\/\s*/g, "/")
              .trim()
          )
        )
      ),
    ]
      .filter(Boolean)
      .filter((loc) => loc.toLowerCase().includes(query.toLowerCase()));
  }

  res.json({ items: items.slice(0, +limit) });
});

//filtered Jobs takes selected filters from FE and returns all the jobs that have atleat one tag in common with the all the selected tags

router.get("/getJobs",globalLimiter, async (req, res) => {
  try {
    const {
      tags = [],
      locations = [],
      companies = [],
      vias = [],
      postedAt,
      experience,
      page = 1,
      limit = 10,
    } = req.query;

    // Helper to parse arrays if query params are comma-separated strings
    const parseArrayParam = (param) => {
      if (!param) return [];
      if (Array.isArray(param)) return param;
      return param
        .split(",")
        .map((str) => str.trim())
        .filter(Boolean);
    };

    const parsedTags = parseArrayParam(tags);
    const parsedLocations = parseArrayParam(locations);
    const parsedCompanies = parseArrayParam(companies);
    const parsedVias = parseArrayParam(vias);

    const filters = [
      parsedTags.length > 0 ? { tags: { hasSome: parsedTags } } : undefined,
      parsedLocations.length > 0
        ? { location: { in: parsedLocations } }
        : undefined,
      parsedCompanies.length > 0
        ? { companyName: { in: parsedCompanies } }
        : undefined,
      parsedVias.length > 0 ? { via: { in: parsedVias } } : undefined,
    ].filter(Boolean);

    if (experience) {
      filters.push({
        AND: [
          { minExperience: { lte: Number(experience) } },
          { maxExperience: { lte: Number(experience) } },
        ],
      });
    }
    let orderBy = undefined;

    if (postedAt === "desc") {
      orderBy = { postedAtDt: "asc" };
    } else if (postedAt === "asc") {
      orderBy = { postedAtDt: "desc" };
    }

    const whereFilter = filters.length > 0 ? { AND: filters } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereFilter,
        skip,
        take: Number(limit),
        orderBy,
      }),
      prisma.job.count({
        where: whereFilter,
      }),
    ]);

    res.json({
      jobs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
