"""Try Bing Shopping for Costco prices"""
import urllib.request, re, json

# Bing Shopping (much less aggressive than Google)
url = 'https://www.bing.com/shop/search?q=kirkland+unsalted+butter+costco&mkt=en-US'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
})
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        html = r.read().decode('utf-8', errors='replace')
        print(f'Length: {len(html)}')
        
        if len(html) < 1000:
            print('Too short, likely blocked:')
            print(html[:500])
        else:
            print('Got content!')
            prices = re.findall(r'\$(\d+\.\d{2})', html)
            print(f'All prices: {prices[:20]}')
            
            # Look for product cards with costco
            # Bing uses class names like "product" or "item"
            # Show lines with costco
            for line in html.split('\n'):
                if 'costco' in line.lower() or 'kirkland' in line.lower():
                    cleaned = re.sub(r'<[^>]+>', ' ', line).strip()
                    if cleaned and len(cleaned) > 5:
                        print(f'  >> {cleaned[:200]}')

except Exception as e:
    print(f'Error: {e}')