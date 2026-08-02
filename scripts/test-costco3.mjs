import { chromium } from "playwright";

const browser = await chromium.launch({ 
  channel: 'chrome',
  headless: true,
  args: ['--headless=new', '--no-sandbox', '--disable-blink-features=AutomationControlled']
});
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  viewport: { width: 1920, height: 1080 },
  locale: "en-US"
});
// Override webdriver property
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
});
const page = await context.newPage();

try {
  await page.goto("https://www.costco.com/butter.html", { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  const title = await page.title();
  console.log("Title:", title);
  
  if (title.includes("Access Denied") || title.includes("Denied")) {
    console.log("BLOCKED by Akamai");
  } else {
    const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log("Page text:", text);
  }
  
} catch(e) {
  console.log("Error:", e.message);
}

await browser.close();
