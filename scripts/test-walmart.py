"""Try Walmart.com for Costco prices"""
import urllib.request, re, json

url = 'https://www.walmart.com/search?q=kirkland+unsalted+butter'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html',
})
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        html = r.read().decode('utf-8', errors='replace')
        print(f'Length: {len(html)}')
        
        if 'captcha' in html.lower():
            print('BLOCKED by CAPTCHA')
        elif len(html) > 10000:
            print('Got real content!')
            prices = re.findall(r'\$(\d+\.\d{2})', html)
            print(f'Prices found: {prices[:15]}')
            
            # Look for product data in JSON
            json_blobs = re.findall(r'window\.__WML_REDUX_INITIAL_STATE__\s*=\s*({.*?});', html, re.DOTALL)
            if json_blobs:
                data = json.loads(json_blobs[0])
                print(f'Found Walmart product data!')
        else:
            print('Short response:', html[:500])
except Exception as e:
    print(f'Error: {e}')