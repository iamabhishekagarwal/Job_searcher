import { readFileSync } from "fs";
import * as cheerio from "cheerio";

function parseHtmlNaukri(htmlPaths) {
  const allJobs = [];

  for (const filePath of htmlPaths) {
    const html = readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);

    const jobCards = $(".cust-job-tuple");

    jobCards.each((_, el) => {
      const element = $(el);

      const title = element.find("a.title").text().trim() || "";

      const job_url =
        element.find("a.title").attr("href")?.trim() || "";

      // ✅ FIXED
      const company =
        element.find(".comp-name").text().trim() || "";

      const company_url =
        element.find(".comp-name").attr("href")?.trim() || null;

      const rating =
        element.find(".rating .main-2").text().trim() || null;

      const reviews =
        element.find(".review").text().trim() || null;

      const ratingReviewURL =
        element.find(".review").attr("href")?.trim() || null;

      // ✅ FIXED experience
      const experience =
        element.find(".exp span").attr("title")?.trim() ||
        element.find(".exp span").text().trim() ||
        "";

      // ✅ FIXED location
      const location =
        element.find(".loc span").attr("title")?.trim() ||
        element.find(".loc span").text().trim() ||
        "";

      // ❌ No description in this card
      const description = "";

      // ❌ Tags usually empty here
      const tags = [];

      // ✅ FIXED postedAt
      const postedAt =
        element.find(".job-post-day").text().trim() || "";

      const logo =
        element.find(".imagewrap img").attr("src")?.trim() || null;

      // ✅ FIXED salary
      const salaryRange =
        element.find(".sal span").attr("title")?.trim() ||
        element.find(".sal span").text().trim() ||
        "Not Mentioned";

      const jobType = "Not Mentioned";

      const isActive = true;

      const via = job_url.includes("https://")
        ? job_url.split("https://")[1].split("/")[0]
        : "";

      // ✅ Skip invalid entries
      if (!title || !job_url) return;

      allJobs.push({
        title,
        job_url,
        company,
        company_url,
        rating,
        reviews,
        ratingReviewURL,
        experience,
        location,
        description,
        postedAt,
        isActive,
        salaryRange,
        tags,
        jobType,
        logo,
        via,
      });
    });
  }

  return allJobs;
}

export default parseHtmlNaukri;