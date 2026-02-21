import { readFileSync } from "fs";
import * as cheerio from "cheerio";

function parseHtmlLinkedin(htmlPaths) {
  const allJobs = [];

  for (const path of htmlPaths) {
    const html = readFileSync(path, "utf8");
    const $ = cheerio.load(html);
    const jobCards = $(".base-card.job-search-card");

    jobCards.each((_, el) => {
      const element = $(el);

      const title =
        element.find(".base-search-card__title").text().trim() || "";
      const job_url =
        element.find("a.base-card__full-link").attr("href")?.trim() || "";
      const company =
        element.find(".base-search-card__subtitle").text().trim() || "";
      const company_url =
        element.find("a.hidden-nested-link").attr("href")?.trim() || "";
      const location =
        element.find(".job-search-card__location").text().trim() || "";
      const img = element.find("img.artdeco-entity-image");
      const logo =
        img.attr("src")?.trim() ||
        img.attr("data-delayed-url")?.trim() ||
        img.attr("data-ghost-url")?.trim() ||
        "";

      // LinkedIn usually doesn't expose description in listing view
      const description = element.find(".job-description").text().trim() || "";

      const postedAt =
        element.find("time.job-search-card__listdate").attr("datetime") || "";

      // These are not available directly, using placeholders
      const jobType = "Not Mentioned";
      const salaryRange = "Not Mentioned";
      const experience = null;
      const rating = null;
      const reviews = null;
      const tags = [];
      const ratingReviewURL = null;
      const isActive = element
        .find(".job-posting-benefits__text")
        .text()
        .toLowerCase()
        .includes("actively hiring");

      const via = job_url.includes("https://")
        ? job_url.split("https://")[1].split("/")[0]
        : "";

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
