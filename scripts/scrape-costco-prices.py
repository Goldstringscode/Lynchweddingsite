#!/usr/bin/env python3
"""
Costco Price Scraper via Bing Shopping
Scrapes Bing Shopping for Costco/Kirkland product prices from the user's home IP.
Updates Supabase buffet_items and menu_items directly.
"""
import urllib.request
import urllib.parse
import re
import json
import time
import sys
import os

# ── CONFIG ──────────────────────────────────────────────────────────────
SUPABASE_URL = "https://asnkchxmqanvdljzgshv.supabase.co"
SERVICE_KEY = "SUPABASE_SERVICE_ROLE_KEY_FROM_ENV"
# ────────────────────────────────────────────────────────────────────────

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# ── STEP 1: Search Bing Shopping for a product, extract Costco price ──
def fetch_costco_price(product_query: str) -> dict:
    """Search Bing Shopping for a product and extract the Costco/Kirkland price."""
    search_url = f"https://www.bing.com/shop/search?q={urllib.parse.quote(product_query)}&mkt=en-US"
    
    try:
        req = urllib.request.Request(search_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode('utf-8', errors='replace')
    except Exception as e:
        return {"price": None, "source": None, "error": str(e), "raw": ""}
    
    if len(html) < 1000:
        return {"price": None, "source": None, "error": "Response too short", "raw": html[:500]}
    
    # Bing Shopping renders product cards with structure:
    # <div class="br-gOffCard ...">
    #   Product name
    #   $XX.XX
    #   Source/store name
    # </div>
    
    # Parse product cards
    products = []
    
    # Strategy 1: Find price+costco patterns
    # Look for blocks containing a price near a Costco/Kirkland mention
    costco_prices = []
    
    # Find all product card blocks
    # Each card typically has: product name, price, source
    card_pattern = re.compile(
        r'aria-label="Wishlist"[^>]*>.*?Saved.*?>(.*?)<.*?\$(\d+\.\d{2}).*?<([A-Z][a-zA-Z\s&]+?)(?:\s{2,}|<)',
        re.DOTALL
    )
    
    # Alternative: find structured entries with price + source
    # Pattern: Product Name $XX.XX SourceName
    blocks = re.findall(r'>([^<]{3,80}?)\s*\$(\d+\.\d{2})\s*</[^>]+>\s*<[^>]+>\s*([A-Z][a-zA-Z\s&]{2,30}?)(?:\s{2,}|<)', html)
    
    for name, price, source in blocks:
        name_clean = re.sub(r'\s+', ' ', name).strip()
        source_clean = re.sub(r'\s+', ' ', source).strip()
        products.append({
            'name': name_clean,
            'price': float(price),
            'source': source_clean
        })
        
        # Check if Costco/Kirkland source
        src_lower = (source_clean + ' ' + name_clean).lower()
        if 'costco' in src_lower or 'kirkland' in src_lower or 'instacart' in src_lower:
            costco_prices.append(float(price))
    
    # Strategy 2: Use simpler pattern if above failed
    if not costco_prices:
        # Find any line with a dollar amount near Costco mention
        lines = html.split('\n')
        for i, line in enumerate(lines):
            if 'costco' in line.lower() or 'kirkland' in line.lower():
                # Look at this line and surrounding lines for prices
                context = '\n'.join(lines[max(0,i-2):i+3])
                prices_in_context = re.findall(r'\$(\d+\.\d{2})', context)
                if prices_in_context:
                    costco_prices.extend(float(p) for p in prices_in_context)
    
    # Strategy 3: Find Instacart-sourced Costco prices
    if not costco_prices:
        # Bing shows some products with "I" for Instacart
        ic_prices = re.findall(r'>([^<]*?kirkland[^<]*?)</[^>]+>\s*<[^>]+>\s*\$(\d+\.\d{2})', html, re.IGNORECASE)
        for name, price in ic_prices:
            costco_prices.append(float(price))
    
    if costco_prices:
        # Take the median Costco price (not the cheapest outlier)
        costco_prices.sort()
        median_price = costco_prices[len(costco_prices)//2]
        
        # Debug: show all found prices
        return {
            "price": median_price,
            "source": "Bing Shopping (Costco)",
            "all_prices": costco_prices,
            "all_products": products[:10],
            "error": None
        }
    
    return {"price": None, "source": None, "error": "No Costco price found", "raw": html[:500]}


# ── STEP 2: Get all unique product queries from the mappings ──
def get_unique_queries():
    """Read costco-mappings.ts and extract all unique search queries."""
    ts_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'costco-mappings.ts')
    with open(ts_path) as f:
        content = f.read()
    
    mappings = re.findall(r'"([^"]+)":\s*"([^"]+)"', content)
    
    # Build: query -> [ingredient_names that map to it]
    query_to_ingredients = {}
    for ingredient_name, query in mappings:
        if query not in query_to_ingredients:
            query_to_ingredients[query] = []
        query_to_ingredients[query].append(ingredient_name)
    
    return query_to_ingredients


# ── STEP 3: Update Supabase with new prices ──
def update_prices_in_db(price_map: dict):
    """Update ingredient_list.costcoPrice for all items in buffet_items and menu_items."""
    def supabase_select(table):
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=id,name,ingredient_list"
        req = urllib.request.Request(url, headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}'
        })
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    
    def supabase_update(table, id_val, data):
        url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id_val}"
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        })
        req.method = 'PATCH'
        with urllib.request.urlopen(req) as r:
            return r.status
    
    # Now we need to map queries back to ingredient names
    # The price_map is: query -> price
    # We need: ingredient_name -> price
    
    # Read mappings again to build ingredient->query map
    ts_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'costco-mappings.ts')
    with open(ts_path) as f:
        content = f.read()
    all_mappings = re.findall(r'"([^"]+)":\s*"([^"]+)"', content)
    
    # Build ingredient -> price
    ingredient_price = {}
    for ing_name, query in all_mappings:
        if query in price_map and price_map[query] is not None:
            ingredient_price[ing_name] = price_map[query]
    
    updated_total = 0
    
    # Update buffet_items
    for table in ['buffet_items', 'menu_items']:
        try:
            items = supabase_select(table)
            print(f"  {table}: {len(items)} items")
            
            for item in items:
                ing_list = item.get('ingredient_list') or []
                if isinstance(ing_list, str):
                    try: ing_list = json.loads(ing_list)
                    except: ing_list = []
                if not isinstance(ing_list, list):
                    continue
                
                changed = False
                new_list = []
                for ing in ing_list:
                    ing_name = ing.get('item') or ing.get('name') or ''
                    ing_name = ing_name.strip()
                    if ing_name in ingredient_price and ingredient_price[ing_name] is not None:
                        new_price = ingredient_price[ing_name]
                        if ing.get('costcoPrice') != new_price:
                            ing['costcoPrice'] = new_price
                            changed = True
                    new_list.append(ing)
                
                if changed:
                    item_id = item['id']
                    # Recalculate cost_per_serving
                    total = sum(
                        (i.get('costcoPrice') or i.get('wincoPrice') or i.get('samsClubPrice') or 0)
                        for i in new_list
                    )
                    cost_ps = round(total, 2)
                    
                    # Update ingredient_links
                    links = item.get('ingredient_links') or {}
                    if isinstance(links, str):
                        try: links = json.loads(links)
                        except: links = {}
                    if not isinstance(links, dict):
                        links = {}
                    links['costco'] = {
                        'costPerServing': cost_ps,
                        'totalFor150': round(cost_ps * 150, 2),
                        'lastUpdated': time.strftime('%Y-%m-%d')
                    }
                    
                    supabase_update(table, item_id, {
                        'ingredient_list': new_list,
                        'cost_per_serving': cost_ps,
                        'ingredient_links': links
                    })
                    updated_total += 1
                    print(f"    ✓ {item['name'][:50]}: ${cost_ps:.2f}")
        
        except Exception as e:
            print(f"  Error updating {table}: {e}")
    
    return updated_total


# ── MAIN ──
if __name__ == '__main__':
    print("=" * 60)
    print("COSTCO PRICE SCRAPER (via Bing Shopping)")
    print("=" * 60)
    
    # Get unique search queries
    query_to_ingredients = get_unique_queries()
    queries = list(query_to_ingredients.keys())
    print(f"\nUnique product queries: {len(queries)}")
    
    # Search for each product
    price_map = {}  # query -> price
    results_log = []
    
    for i, query in enumerate(queries):
        print(f"\n[{i+1}/{len(queries)}] Searching: {query}")
        
        result = fetch_costco_price(query)
        
        if result['price']:
            price_map[query] = result['price']
            print(f"  ✅ ${result['price']:.2f} (prices: {result.get('all_prices', [])})")
        else:
            price_map[query] = None
            print(f"  ❌ {result['error']}")
        
        results_log.append({
            'query': query,
            'result': result
        })
        
        # Be nice to Bing
        if i < len(queries) - 1:
            time.sleep(1.5)
    
    # Summary
    found = sum(1 for v in price_map.values() if v is not None)
    print(f"\n{'=' * 60}")
    print(f"RESULTS: {found}/{len(queries)} prices found")
    print(f"{'=' * 60}")
    
    for query, price in price_map.items():
        ings = query_to_ingredients[query]
        if price:
            print(f"  ✅ {query}: ${price:.2f} → {len(ings)} ingredient(s)")
        else:
            print(f"  ❌ {query}: No price → {len(ings)} ingredient(s)")
    
    # Update Supabase
    print(f"\n{'=' * 60}")
    print("UPDATING DATABASE...")
    print(f"{'=' * 60}")
    
    updated = update_prices_in_db(price_map)
    print(f"\n✓ {updated} items updated in database")
    
    # Save results for reference
    output_path = os.path.join(os.path.dirname(__file__), '..', 'costco-prices-results.json')
    with open(output_path, 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'queries_checked': len(queries),
            'prices_found': found,
            'items_updated': updated,
            'prices': {q: p for q, p in price_map.items() if p is not None},
            'results_log': results_log
        }, f, indent=2)
    print(f"Results saved to {output_path}")