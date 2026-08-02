"""Try Playwright with more stealth features"""
from playwright.sync_api import sync_playwright
import re

with sync_playwright() as p:
    # Launch with stealthier options
    browser = p.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--no-sandbox',
            '--disable-dev-shm-usage',
        ]
    )
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1920, 'height': 1080},
        locale='en-US',
        timezone_id='America/Los_Angeles',
    )
    
    # Remove navigator.webdriver property
    context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """)
    
    page = context.new_page()
    
    # Try DuckDuckGo instead - they're less aggressive with blocking
    url = 'https://html.duckduckgo.com/html/?q=site%3Acostco.com+kirkland+unsalted+butter+price'
    print(f'Navigating to DuckDuckGo...')
    page.goto(url)
    page.wait_for_timeout(3000)
    
    title = page.title()
    print(f'Title: {title}')
    
    text = page.inner_text('body')
    print(f'Body length: {len(text)}')
    # Show relevant snippets
    lines = text.split('\n')
    for line in lines:
        if 'costco' in line.lower() or 'kirkland' in line.lower() or '$' in line:
            print(f'  >> {line.strip()[:200]}')
    
    browser.close()