"""Quick test: can Playwright scrape Google Shopping for Costco prices?"""
from playwright.sync_api import sync_playwright
import re

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Test Google Shopping search
    url = 'https://www.google.com/search?tbm=shop&q=Kirkland+unsalted+butter+price&hl=en&gl=us'
    print(f'Navigating to: {url}')
    page.goto(url)
    page.wait_for_timeout(5000)  # Wait for dynamic content
    
    title = page.title()
    print(f'Title: {title}')
    
    content = page.content()
    
    # Look for shopping results
    prices = re.findall(r'\$(\d+\.\d{2})', content)
    print(f'Prices found: {prices[:15]}')
    
    # Check for costco mentions  
    costco_mentions = [(m.start(), m.group()[:200]) for m in re.finditer(r'(?i).{0,50}costco.{0,100}', content)]
    print(f'Costco mentions: {len(costco_mentions)}')
    for pos, text in costco_mentions[:3]:
        print(f'  [{pos}] {text[:150]}')
    
    # Also look for shopping result containers
    products = page.query_selector_all('[class*="sh-dlr"]')
    print(f'Found {len(products)} shopping detail results')
    
    # Try Google-specific selectors
    for sel in ['.sh-dlr', '.sh-pr', '.i0X6df', '[data-shop]', '.sh-np__product']:
        els = page.query_selector_all(sel)
        print(f'  Selector "{sel}": {len(els)} elements')
    
    browser.close()