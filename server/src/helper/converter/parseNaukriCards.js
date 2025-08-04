import { readFileSync } from "fs";
import cheerio from "cheerio";

function parseHtml(htmlPath) {
  const html = readFileSync(htmlPath, "utf8");
  const $ = cheerio.load(html);

  const jobCards = $(".cust-job-tuple");

  const jobs = [];

  jobCards.each((_, el) => {
    const element = $(el);
    const title = element.find("a.title").text().trim();
    const job_url = element.find("a.title").attr("href")?.trim();
    const company = element.find(".comp-name span").text().trim();
    const company_url =element.find(".comp-name a").attr("href")?.trim() || null;
    const rating = element.find(".starRating").text().trim() || null;
    const reviews = element.find(".reviewsCount").text().trim() || null;
    const experience = element.find(".exp").text().trim();
    const location = element.find(".loc").text().trim();
    const description =
      element.find(".job-desc").text().trim().substring(0, 100) + "...";
    const tags = element
      .find(".tags .tag")
      .map((_, tagEl) => {
        return $(tagEl).text().trim();
      })
      .get();

    const posted =
      element.find(".type br + span").text().trim() ||
      element.find(".type span").last().text().trim();

    const logo = element.find(".naukri-logo img").attr("src") || null;

    const via = job_url.split("https://")[1].split("/")[0];

    const jobData = {
      title,
      job_url,
      company,
      company_url,
      rating,
      reviews,
      experience,
      location,
      description,
      tags,
      posted,
      logo,
      via,
    };

    jobs.push(jobData);
  });

  return jobs;
}

// Example usage:
const parsedJobs = parseHtml("path/to/naukri.html");
console.log(parsedJobs);
