import { chromium } from "playwright";

const browser = await chromium.launch({ 
  channel: 'chrome',
  headless: true 
});
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

try {
  // Try searching Costco for "unsalted butter"
  await page.goto("https://www.costco.com/butter.html", { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  const title = await page.title();
  console.log("Page title:", title);
  
  // Dump page text to see structure
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("--- PAGE TEXT ---");
  console.log(bodyText);
  
} catch(e) {
  console.log("Error:", e.message);
}

await browser.close();
