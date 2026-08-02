"""Use playwright-stealth to bypass Google detection"""
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
import re

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=['--disable-blink-features=AutomationControlled']
    )
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1920, 'height': 1080},
        locale='en-US',
    )
    page = context.new_page()
    
    # Apply stealth
    stealth = Stealth()
    stealth.apply_stealth_sync(page)
    
    url = 'https://www.google.com/search?q=kirkland+unsalted+butter+costco+price+per+lb'
    print(f'Navigating...')
    page.goto(url)
    page.wait_for_timeout(3000)
    
    body = page.inner_text('body')
    print(f'Body length: {len(body)}')
    
    if 'sorry' in body.lower() or len(body) < 500:
        print('BLOCKED or minimal response')
        if 'sorry' in body.lower():
            print('Google CAPTCHA detected')
        print(body[:500])
    else:
        print('SUCCESS - no CAPTCHA!')
        prices = re.findall(r'\$(\d+\.\d{2})', body)
        print(f'Prices: {prices[:10]}')
        for line in body.split('\n'):
            if 'costco' in line.lower() or 'kirkland' in line.lower() or ('$' in line and any(k in line.lower() for k in ['butter','kirkland','costco'])):
                print(f'  >> {line.strip()[:150]}')
    
    browser.close()