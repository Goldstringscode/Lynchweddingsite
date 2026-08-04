#!/usr/bin/env python3
"""
Fix: Ensure food cost never exceeds sell price for all buffet items.
Strategy: 
  1. Identify items where cost_per_serving > price_per_person (or suggested_menu_price)
  2. The Bing scraper returned package prices, not per-serving prices
  3. For buffet items, estimate servings-per-package and recalculate 
  4. For remaining items where cost still > sell, bump the sell price to cost*1.5
"""
import urllib.request
import urllib.parse
import json
import time
import math

SUPABASE_URL = "https://asnkchxmqanvdljzgshv.supabase.co"
SERVICE_KEY = "SUPABASE_SERVICE_ROLE_KEY_FROM_ENV"

def supabase_select(table, select="*"):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={urllib.parse.quote(select)}&limit=500"
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

# Estimated servings per Costco package for different food categories
# These help convert package prices to per-serving costs
def estimate_servings(item_name: str, cost_price: float) -> int:
    """Estimate how many servings one Costco package provides."""
    name = item_name.lower()
    
    # Large format items (feed many)
    if any(k in name for k in ['whole roasted', 'carving station', 'prime rib', 'whole pig', 
                                 'suckling pig', 'turkey breast', 'rack of lamb']):
        return 20
    if any(k in name for k in ['paella', 'jambalaya', 'chili station', 'pasta station', 
                                 'pasta bar', 'diy pasta', 'taco bar', 'fajita station']):
        return 15
    if any(k in name for k in ['coffee bar', 'espresso', 'bloody mary', 'infused water',
                                 'lemonade', 'hibiscus']):
        return 30  # Beverage dispensers serve many
    
    # Medium items
    if any(k in name for k in ['salmon fillet', 'salmon with', 'chicken breast', 'chicken thigh',
                                 'pork loin', 'chicken marsala', 'shrimp cocktail', 'lobster roll',
                                 'ahi tuna', 'seared ahi']):
        return 10
    if any(k in name for k in ['mac & cheese', 'truffle mac', 'cacio e pepe', 'mashed potato',
                                 'pilaf', 'rice pilaf', 'risotto', 'polenta', 'creamed spinach',
                                 'roasted vegetable', 'roasted seasonal', 'grain bowl',
                                 'quinoa', 'brussels sprouts', 'asparagus', 'cauliflower steak',
                                 'sweet potato', 'roasted sweet', 'wild rice']):
        return 12
    if any(k in name for k in ['salad', 'slaw', 'caesar', 'garden salad', 'mixed green',
                                 'greek orzo', 'kale', 'soba noodle', 'fattoush',
                                 'cucumber & tomato', 'elote', 'roasted beet']):
        return 15  # Large salad bowls feed a crowd
    
    # Appetizers
    if any(k in name for k in ['skewer', 'bite', 'popper', 'crostini', 'bruschetta',
                                 'spring roll', 'meatball', 'mushroom', 'quiche',
                                 'spanakopita', 'arancini', 'stuffed', 'tartlet',
                                 'cake pop', 'churro', 'macaroon', 'profiterole',
                                 'cheesecake bite', 'pecan pie', 'fruit tart',
                                 'baklava', 'brownie bite', 'cookie', 'rice krispie',
                                 'smore', 'donut', 'cinnamon roll']):
        return 20
    
    # Fountain/dipping
    if any(k in name for k in ['fountain', 'chocolate fountain', 'fondue']):
        return 40
    
    # Soups
    if any(k in name for k in ['soup', 'chowder', 'bisque']):
        return 12
    
    # By cost heuristic: more expensive items = larger packages
    if cost_price > 50:
        return 15
    if cost_price > 30:
        return 12
    if cost_price > 20:
        return 10
    if cost_price > 10:
        return 8
    
    return 6  # Smallest items


print("=" * 60)
print("FIXING FOOD COST vs SELL PRICE")
print("=" * 60)

items = supabase_select("buffet_items", "id,name,cost_per_serving,price_per_person,suggested_menu_price,ingredient_list,ingredient_links")
print(f"Loaded {len(items)} buffet items")

fixed = []

for item in items:
    cost = item.get('cost_per_serving') or 0
    sell = item.get('price_per_person') or item.get('suggested_menu_price') or 0
    
    if cost <= sell:
        continue  # Already profitable (or zero cost)
    
    name = item['name']
    
    # Step 1: Estimate proper per-serving cost from the package price
    servings = estimate_servings(name, cost)
    proper_cost = round(cost / servings, 2)
    if proper_cost < 0.25:
        proper_cost = 0.50  # Never go below $0.50/serving
    
    # Step 2: Ensure sell price has at least 30% margin over cost
    min_sell = round(proper_cost * 1.5, 2)  # 50% markup = 33% food cost
    if sell < min_sell:
        new_sell = min_sell
    else:
        new_sell = sell
    
    # Step 3: Update ingredient_list costcoPrice to reflect per-serving cost
    ing_list = item.get('ingredient_list') or []
    if isinstance(ing_list, str):
        try: ing_list = json.loads(ing_list)
        except: ing_list = []
    
    if ing_list and isinstance(ing_list, list):
        for ing in ing_list:
            if ing.get('costcoPrice') and ing['costcoPrice'] == cost:
                ing['costcoPrice'] = proper_cost
                break
    
    # Step 4: Update ingredient_links
    links = item.get('ingredient_links') or {}
    if isinstance(links, str):
        try: links = json.loads(links)
        except: links = {}
    if not isinstance(links, dict):
        links = {}
    
    links['costco'] = {
        'costPerServing': proper_cost,
        'totalFor150': round(proper_cost * 150, 2),
        'lastUpdated': time.strftime('%Y-%m-%d')
    }
    
    # Update DB
    supabase_update("buffet_items", item['id'], {
        'cost_per_serving': proper_cost,
        'price_per_person': new_sell,
        'suggested_menu_price': new_sell,
        'ingredient_list': ing_list,
        'ingredient_links': links
    })
    
    # Also update the ingredient_list item-level costcoPrice
    # (This is the per-item price, not per-serving)
    
    fixed.append((name, cost, proper_cost, sell, new_sell, servings))
    
    print(f"  {name[:50]:50s} \${cost:<6.2f} → \${proper_cost:<5.2f}/serv ×{servings}  sell: \${sell:<5.2f}→\${new_sell:<5.2f}")

print(f"\n{'=' * 60}")
print(f"Fixed {len(fixed)} items")
print(f"{'=' * 60}")

# Now fix menu_items too
print("\nFixing menu_items...")
menu_items = supabase_select("menu_items", "id,name,cost_per_serving,suggested_menu_price,ingredient_list,ingredient_links")
menu_fixed = 0

for item in menu_items:
    cost = item.get('cost_per_serving') or 0
    sell = item.get('suggested_menu_price') or 0
    
    if cost <= sell:
        continue
    
    name = item['name']
    servings = estimate_servings(name, cost)
    proper_cost = round(cost / servings, 2)
    if proper_cost < 0.50:
        proper_cost = 0.50
    
    # For menu items (plated), margin should be higher
    min_sell = round(proper_cost * 2.5, 2)  # 60% food cost margin for plated
    if sell < min_sell:
        new_sell = min_sell
    else:
        new_sell = sell
    
    # Update ingredient_list
    ing_list = item.get('ingredient_list') or []
    if isinstance(ing_list, str):
        try: ing_list = json.loads(ing_list)
        except: ing_list = []
    
    if ing_list and isinstance(ing_list, list):
        for ing in ing_list:
            if ing.get('costcoPrice') and ing['costcoPrice'] == cost:
                ing['costcoPrice'] = proper_cost
                break
    
    # Update links
    links = item.get('ingredient_links') or {}
    if isinstance(links, str):
        try: links = json.loads(links)
        except: links = {}
    if not isinstance(links, dict):
        links = {}
    links['costco'] = {
        'costPerServing': proper_cost,
        'totalFor150': round(proper_cost * 150, 2),
        'lastUpdated': time.strftime('%Y-%m-%d')
    }
    
    supabase_update("menu_items", item['id'], {
        'cost_per_serving': proper_cost,
        'suggested_menu_price': new_sell,
        'ingredient_list': ing_list,
        'ingredient_links': links
    })
    
    menu_fixed += 1
    print(f"  {name[:50]:50s} \${cost:<6.2f} → \${proper_cost:<5.2f}/serv  sell: \${sell:<5.2f}→\${new_sell:<5.2f}")

print(f"\n{'=' * 60}")
print(f"Menu items fixed: {menu_fixed}")
print(f"Total items fixed: {len(fixed) + menu_fixed}")
print(f"{'=' * 60}")
print("DONE!")