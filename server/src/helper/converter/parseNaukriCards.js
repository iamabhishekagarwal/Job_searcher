import { readFileSync } from "fs";
import * as cheerio from "cheerio";

function parseHtmlNaukri(htmlPaths) {
  const allJobs = [];

  for (const path of htmlPaths) {
    const html = readFileSync(path, "utf8");
    const $ = cheerio.load(html);
    const jobCards = $(".cust-job-tuple");

    jobCards.each((_, el) => {
      const element = $(el);

      const title = element.find("a.title").text().trim() || "";
      const job_url = element.find("a.title").attr("href")?.trim() || "";
      const company = element.find(".comp-name span").text().trim() || "";
      const company_url =
        element.find(".comp-name a").attr("href")?.trim() || null;
      const rating = element.find(".rating").text().trim() || null;
      const ratingReviewURL=element.find(".review.ver-line").attr("href")?.trim() || null;
      const reviews = element.find(".review.ver-line").text().trim() || null;
      const experience = element.find(".exp").text().trim() || "";
      const location = element.find(".loc").text().trim() || "";

      const rawDesc = element.find(".job-desc").text().trim();
      const description =
        rawDesc.length > 100 ? rawDesc.substring(0, 100) + "..." : rawDesc;

      const tags = element
        .find(".tags .tag")
        .map((_, tagEl) => {
          return $(tagEl).text().trim();
        })
        .get();

      const postedAt =
        element.find(".type br + span").text().trim() ||
        element.find(".type span").last().text().trim() ||
        "";

      const logo = element.find(".imagewrap img").attr("src")?.trim() || null;

      const isActive = true; // Always true unless explicitly specified
      const salaryRange =
        element.find(".salary").text().trim() || "Not Mentioned";
      const jobType = "Not Mentioned"; // Update if you find a selector
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

export default parseHtmlNaukri;
