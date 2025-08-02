import dotenv from "dotenv";
import { anonymizeProxy } from "proxy-chain";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

dotenv.config();
let anonymizedProxy = await anonymizeProxy(process.env.PROXY);
console.log(anonymizedProxy);
puppeteer.use(
  StealthPlugin({
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
    platform: "Win32",
    webglVendor: "Intel Inc.",
    renderer: "Intel Iris OpenGL Engine",
    fixHairline: true,
  })
);

let browser = await puppeteer.launch({
  headless: false,
  args: [
    `--proxy-server=${anonymizedProxy}`,
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--disable-web-security",
  ],
});
const page = await browser.newPage();
page.goto(
  "https://www.naukri.com/job-listings-graphic-designer-4th-phase-water-technologies-bengaluru-1-to-5-years-041224502516",
  {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  }
);
console.log(page);
