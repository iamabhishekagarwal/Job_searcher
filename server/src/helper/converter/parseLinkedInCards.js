import { readFileSync } from "fs";
import * as cheerio from "cheerio";

function parseHtmlLinkedin(htmlPaths) {
  const allJobs = [];

  for (const filePath of htmlPaths) {
    const html = readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);

    // ✅ FIXED selector
    const jobCards = $(".base-card");

    jobCards.each((_, el) => {
      const element = $(el);

      const title =
        element.find(".base-search-card__title").text().trim() || "";

      const job_url =
        element.find("a.base-card__full-link").attr("href")?.trim() || "";

      // ✅ Better company extraction
      const company =
        element.find(".base-search-card__subtitle a").text().trim() || "";

      const company_url =
        element.find(".base-search-card__subtitle a").attr("href")?.trim() || "";

      const location =
        element.find(".job-search-card__location").text().trim() || "";

      const img = element.find("img.artdeco-entity-image");

      const logo =
        img.attr("src")?.trim() ||
        img.attr("data-delayed-url")?.trim() ||
        img.attr("data-ghost-url")?.trim() ||
        "";

      // ❌ No description in list view
      const description = "";

      // ✅ FIXED (added dot)
      const postedAt =
        element
          .find(".job-search-card__listdate--new")
          .attr("datetime")
          ?.trim() || "";

      const jobType = "Not Mentioned";
      const salaryRange = "Not Mentioned";
      const experience = null;
      const rating = null;
      const reviews = null;
      const tags = [];
      const ratingReviewURL = null;

      const isActive = false; // not present in your HTML

      const via = job_url.includes("https://")
        ? job_url.split("https://")[1].split("/")[0]
        : "";

      // ✅ Skip empty cards (important)
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

export default parseHtmlLinkedin;