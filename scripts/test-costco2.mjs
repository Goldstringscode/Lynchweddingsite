import { chromium } from "playwright";

const browser = await chromium.launch({ 
  channel: 'chrome',
  headless: true
});
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  viewport: { width: 1920, height: 1080 },
  locale: "en-US"
});
const page = await context.newPage();

try {
  // Try Costco's search endpoint directly
  await page.goto("https://www.costco.com/.product.100000001.html", { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  const title = await page.title();
  console.log("Title:", title);
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("Body:", text);
  
} catch(e) {
  console.log("Error:", e.message);
  
  // Try with a different URL format
  try {
    await page.goto("https://www.costco.com/CatalogSearch?keyword=butter", { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    const t2 = await page.title();
    console.log("Search Title:", t2);
    const t = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log("Search Body:", t);
  } catch(e2) {
    console.log("Search Error:", e2.message);
  }
}

await browser.close();
