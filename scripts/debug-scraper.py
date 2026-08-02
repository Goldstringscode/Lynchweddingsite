"""Debug: see what Playwright actually gets from Google Shopping"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    page = context.new_page()
    
    url = 'https://www.google.com/search?tbm=shop&q=Kirkland+unsalted+butter+price&hl=en&gl=us'
    page.goto(url)
    page.wait_for_timeout(5000)
    
    # Save screenshot to see what's happening
    page.screenshot(path='C:/Users/Justin/sites/lynchweddingsite/scripts/debug_screenshot.png')
    
    # Get page text content
    text = page.inner_text('body')
    print(f'Body text length: {len(text)}')
    print(f'First 2000 chars:')
    print(text[:2000])
    
    browser.close()