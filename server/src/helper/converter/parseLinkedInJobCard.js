import { readFileSync } from "fs";
import cheerio from "cheerio";

async function parseHtml(htmlPaths) {
  let allJobs = [];

  for (const path of htmlPaths) {
    const html = readFileSync(path, "utf8");
    const parser = cheerio.load(html);
    const jobCards = parser(".base-card.job-search-card");

    jobCards.each((_, el) => {
      const element = parser(el);

      const title =
        element.find(".base-search-card__title").text().trim() || "";
      const job_url = element.find("a.base-card__full-link").attr("href") || "";
      const company =
        element.find(".base-search-card__subtitle").text().trim() || "";
      const company_url =
        element.find("a.hidden-nested-link").attr("href") || "";
      const location =
        element.find(".job-search-card__location").text().trim() || "";
      const image = element.find("img.artdeco-entity-image").attr("src") || "";
      const description = element.find(".job-description").text().trim() || "";
      const postedAt =
        element.find("time.job-search-card__listdate").attr("datetime") || "";
      const jobType = element.find("") || "Not Mentioned";
      const salaryRange = element.find("") || "Not Mentioned";

      const activelyHiring = element
        .find(".job-posting-benefits__text")
        .text()
        .includes("Actively Hiring");

      const via = job_url
        ? job_url.split("https://")[1]?.split("/")[0] || ""
        : "";

      allJobs.push({
        title,
        job_url,
        company,
        company_url,
        location,
        image,
        description,
        postedAt,
        activelyHiring,
        via,
      });
    });
  }

  return allJobs;
}

export default parseHtml;
