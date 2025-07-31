import { Router } from "express";
import { userSchema } from "../helper/userSchema.js";
import insertUser from "../helper/insertUser.js";
import { verifyUser } from "../helper/verifyUser.js";
import { generateToken } from "../helper/jwt.js";
import { authenticate } from "../middlewares/authenticate.js";
import { prisma } from "../helper/pooler.js";
const router = Router();

router.post("/signup", async (req, res) => {
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
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

router.post("/signin", async (req, res) => {
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
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

router.get("/suggestions", authenticate, async (req, res) => {
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

router.get("/filters", authenticate, async (req, res) => {
  const { type, query = "", limit = 20 } = req.query;
  // Map type to Prisma field
  const fieldMap = {
    tags: "tags",
    locations: "location",
    companies: "companyName",
    experience: "experience",
    via: "via",
  };
  const field = fieldMap[type];
  if (!field) return res.status(400).json({ error: "Invalid filter type" });

  let prismaFilter = {};

  // For array columns (e.g. tags): use has (for case-insensitive search)
  if (field === "tags") {
    prismaFilter = query ? { tags: { has: query } } : {};
    const tags = await prisma.job.findMany({
      where: prismaFilter,
      take: +limit,
      select: { tags: true },
      distinct: ["tags"],
    });
    const flatTags = [
      ...new Set(
        tags
          .flatMap((j) => j.tags)
          .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
      ),
    ];
    return res.json({ items: flatTags.slice(0, +limit) });
  }

  // For all other fields (locations, companyName, etc.): use case-insensitive contains
  let where = {};
  if (query && field !== "tags") {
    where = {
      [field]: {
        contains: query,
        mode: "insensitive",
      },
    };
  }

  const jobs = await prisma.job.findMany({
    where,
    take: +limit * 5, // Overfetch for de-duplication
    select: { [field]: true },
  });

  // Flatten and dedupe
  let items = [...new Set(jobs.map((j) => j[field]))]
    .filter(Boolean)
    .filter((item) => item.toLowerCase().includes(query.toLowerCase()));

  // Post-process locations as previously, if needed
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
    ].filter(Boolean);
  }

  res.json({ items: items.slice(0, +limit) });
});

router.post("/getJobs", authenticate, async (req, res) => {
  try {
    const {
      tags = [],
      locations = [],
      companies = [],
      vias = [],
      page = 1,
      limit = 10,
    } = req.body;
    const filters = [
      tags.length > 0 ? { tags: { hasSome: tags } } : undefined,
      locations.length > 0 ? { location: { in: locations } } : undefined,
      companies.length > 0 ? { companyName: { in: companies } } : undefined,
      vias.length > 0 ? { via: { in: vias } } : undefined,
    ].filter(Boolean);

    const whereFilter = filters.length > 0 ? { AND: filters } : {};

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereFilter,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({
        where: whereFilter,
      }),
    ]);

    res.json({
      jobs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
