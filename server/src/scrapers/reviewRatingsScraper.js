import dotenv from "dotenv";
import { anonymizeProxy, closeAnonymizedProxy } from "proxy-chain";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
dotenv.config();

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
async function launchBrowser() {
  const originalProxy = process.env.PROXY2;
  console.log("🆕 Launching browser with proxy:");

  const proxy = await anonymizeProxy(originalProxy);
  console.log("🆕 Launching browser with proxy:", proxy);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${proxy}`,
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--disable-web-security",
    ],
  });

  return { browser, proxy };
}

async function closeBrowser(browserObj) {
  await browserObj.browser.close();
  await closeAnonymizedProxy(browserObj.proxy, true);
  console.log("🛑 Closed browser and proxy");
}

