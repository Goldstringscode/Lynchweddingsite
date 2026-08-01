/**
 * Maps ingredient names to Costco search queries for Serper.dev Google Shopping API.
 * 
 * Design:
 * - Multiple ingredients can map to the SAME search query (e.g. "Fresh cream/butter" 
 *   and "Butter & cream" both search "Kirkland unsalted butter price")
 * - The update-prices endpoint collects ALL unique search queries and runs each 
 *   ONE time, then reuses the cached price across every dish
 * - 40 unique queries × ~6 checks/month = 240 searches at Serper's free tier
 * 
 * To add a new ingredient mapping: just add a line below.
 * New dish-specific items that use the same Costco product should reuse an existing query.
 */
export const INGREDIENT_COSTCO_MAP: Record<string, string> = {
  // ── PROTEINS (highest cost impact) ──
  "Primary protein cut": "Costco beef tenderloin per pound price",
  "Beef Tenderloin base mix": "Costco beef tenderloin per pound price",
  "Wagyu base mix": "Costco wagyu beef price",
  "Lamb base mix": "Costco lamb rack price",
  "Pork base mix": "Costco pork tenderloin price",
  "Base preparation": "Costco chicken breast per pound price",
  "Chicken base mix": "Costco chicken breast per pound price",
  "Duck base mix": "Costco whole duck price",
  "Veal base mix": "Costco veal cutlets price",
  "Venison base mix": "Costco venison steak price",

  // ── SEAFOOD ──
  "Salmon base mix": "Costco salmon fillet price",
  "Fish base mix": "Costco fish fillet price",
  "Tuna base mix": "Costco tuna steak price",
  "Lobster base mix": "Costco lobster tails price",
  "Crab base mix": "Costco crab meat price",
  "Shrimp base mix": "Costco raw shrimp price",

  // ── DAIRY & FATS ──
  "Fresh cream/butter": "Kirkland unsalted butter price",
  "Butter & cream": "Kirkland unsalted butter price",
  "Oil & butter": "Kirkland olive oil price",
  "Marinade & oil": "Kirkland olive oil price",
  "Cooking oil & finishing": "Kirkland vegetable oil price",
  "Oil & vinegar": "Kirkland balsamic vinegar price",
  "Rosemary, garlic, olive oil": "Kirkland olive oil garlic price",

  // ── CHEESE ──
  "Cheese/garnish": "Kirkland parmesan cheese price",

  // ── PRODUCE ──
  "Base vegetable/starch": "Costco frozen mixed vegetables price",
  "Yukon gold potatoes": "Costco yukon gold potatoes price",
  "Apple Tart with Maple Mascarpone base mix": "Costco apples price",
  "Bruschetta Trio base mix": "Costco Roma tomatoes price",

  // ── BAKING & BINDERS ──
  "Base (cream/chocolate)": "Kirkland heavy cream price",
  "Eggs & binder": "Kirkland eggs price",
  "Sugar/sweetener": "Kirkland sugar price",
  "Flavor extract": "Kirkland vanilla extract price",

  // ── SEASONINGS ──
  "Seasoning blend": "Kirkland seasoning blend price",
  "Seasonings": "Kirkland black pepper price",
  "Seasonings & aromatics": "Kirkland garlic cloves price",
  "Seasonings & herbs": "Kirkland dried herbs price",
  "Herb & spice rub": "Kirkland spice rub price",

  // ── GARNISHES ──
  "Garnish & plating": "Kirkland fresh herbs price",
  "Garnish/topping": "Kirkland nuts price",
  "Side garnish": "Kirkland mixed greens price",
  "Herbs & garnish": "Kirkland fresh herbs price",
  "Finishing touch": "Kirkland truffle oil price",
  "Truffle oil": "Kirkland truffle oil price",

  // ── MISCELLANEOUS ──
  "Phyllo cups": "Costco phyllo dough price",

  // ── CATCH-ALL (any unmapped ingredient falls through here) ──

  // ── BUFFET ITEMS (Core Costco-shoppable products) ──
  "Shrimp Cocktail": "Costco frozen shrimp price",
  "Coconut Shrimp with Sweet Chili Dip": "Costco frozen shrimp price",
  "Maine Lobster & Corn Boil": "Costco lobster tails price",
  "Mini Lobster Rolls": "Costco lobster tails price",
  "Smoked Salmon & Bagel Board": "Costco smoked salmon price",
  "Smoked Salmon Canapés": "Costco smoked salmon price",
  "Seared Ahi Tuna Poke": "Costco ahi tuna steak price",
  "Prime Rib Carving": "Costco prime rib roast price",
  "Herb-Crusted Roasted Pork Loin": "Costco pork loin price",
  "Herb-Crusted Pork Loin": "Costco pork loin price",
  "Glazed Ham with Pineapple-Mustard Sauce": "Costco ham price",
  "Honey-Glazed Ham Carving": "Costco ham price",
  "Carved Herb-Roasted Chicken Breast": "Costco chicken breast per pound price",
  "Lemon Herb Chicken Breast": "Costco chicken breast per pound price",
  "Lemon-Herb Roasted Chicken Thighs": "Costco chicken thighs price",
  "Turkey Breast Carving": "Costco turkey breast price",
  "Rack of Lamb with Herb Crust Carving": "Costco lamb rack price",
  "Whole Roasted Suckling Pig Carving": "Costco whole pig price",
  "Artisan Cheese & Charcuterie": "Kirkland cheese selection price",
  "Charcuterie & Cheese Grazing Board": "Kirkland cheese selection price",
  "Bruschetta": "Costco Roma tomatoes price",
  "Caprese Salad": "Kirkland fresh mozzarella price",
  "Caprese Salad Skewers": "Kirkland fresh mozzarella price",
  "Caprese Skewers with Balsamic Pearls": "Kirkland fresh mozzarella price",
  "Caesar Salad": "Kirkland caesar salad kit price",
  "Garden Salad with House Vinaigrettes": "Kirkland mixed greens price",
  "Mixed Green Salad with Seasonal Fruit": "Kirkland mixed greens price",
  "Fresh Fruit": "Kirkland fruit tray price",
  "Grilled Salmon with Lemon-Dill Sauce": "Costco salmon fillet price",
  "Truffle Mac & Cheese": "Kirkland mac and cheese price",
  "Truffle-Parmesan Fries": "Costco frozen french fries price",
  "Garlic Mashed Potatoes": "Kirkland mashed potatoes price",
  "Roasted Garlic Mashed Potatoes": "Kirkland mashed potatoes price",
  "Creamed Spinach": "Kirkland frozen spinach price",
  "Grilled Asparagus with Lemon": "Costco asparagus price",
  "Roasted Seasonal Vegetables": "Costco frozen mixed vegetables price",
  "Spinach & Artichoke Dip": "Kirkland spinach artichoke dip price",
  "Chocolate Fountain": "Kirkland chocolate melting wafers price",
  "Cookies & Milk": "Kirkland cookies price",
  "Assorted Cookie": "Kirkland cookies price",
  "Coffee & Espresso": "Kirkland coffee beans price",
  "Signature Infused Water": "Costco bottled water price",
  "Sparkling Lavender Lemonade": "Costco lemonade price",
  "Donut Wall": "Kirkland donuts price",
  "S'mores": "Kirkland marshmallows price",
  "Pulled Pork Slider": "Costco pulled pork price",
  "Taco with Carnitas & Chicken": "Costco tortillas price",
  "Fajita with Grilled Peppers": "Costco peppers price",

  // ── ADDITIONAL BUFFET ITEM MAPPINGS (AUG 2026) ──
  // Cold Appetizers & Starters
  "Antipasto Skewers": "Costco antipasto platter price",
  "Crostini Station with Four Spreads": "Kirkland crostini price",
  "Bruschetta Bar with Three Toppings": "Costco Roma tomatoes price",
  "Bruschetta Bar": "Costco Roma tomatoes price",
  "Bruschetta Flatbreads": "Costco flatbread price",
  "Goat Cheese & Fig Crostini": "Kirkland goat cheese log price",
  "Prosciutto-Wrapped Melon Bites": "Costco prosciutto price",
  "Phyllo-Wrapped Brie en Croûte": "Costco brie cheese price",
  "Tuscan White Bean Crostini": "Costco cannellini beans price",
  "Watermelon & Feta Bites": "Costco watermelon price",
  "Watermelon, Mint & Feta Salad": "Costco watermelon price",
  "Grilled Halloumi & Watermelon Skewers": "Costco halloumi cheese price",
  "Grilled Peach & Burrata Salad": "Costco peaches price",
  "Vietnamese Spring Roll": "Costco rice paper wrappers price",
  "Panko-Crusted Avocado Fries": "Costco avocado price",
  "Avocado Toast Bar": "Costco avocado price",
  "Cucumber Sandwiches (Tea-Style)": "Costco English cucumber price",

  // Hot Appetizers & Finger Foods
  "Bacon-Wrapped Jalapeño Poppers": "Costco bacon price",
  "Chicken Satay Skewers with Peanut Sauce": "Costco chicken thighs price",
  "Lamb Kofta Skewers with Tzatziki": "Costco ground lamb price",
  "Stuffed Mushrooms": "Costco mushrooms price",
  "Stuffed Mushrooms with Sausage & Cream Cheese": "Costco mushrooms price",
  "Stuffed Piquillo Peppers with Manchego": "Costco piquillo peppers price",
  "Buffalo Cauliflower Bites": "Costco cauliflower price",
  "Crispy Brussels Sprouts with Balsamic Glaze": "Costco brussels sprouts price",
  "Edamame with Sesame & Sea Salt": "Costco frozen edamame price",
  "Spiced Roasted Chickpeas": "Costco canned chickpeas price",
  "Margherita Pizza Bites": "Costco pizza bites price",
  "Mini Quiche Lorraine": "Kirkland quiche lorraine price",
  "Mini Quiche Trio": "Kirkland quiche assortment price",
  "Risotto Bites (Arancini)": "Costco arancini price",
  "Spanakopita Triangles": "Costco spanakopita price",
  "Crawfish Étouffée Bites": "Costco crawfish tails price",
  "Corn & Crab Chowder Shooters": "Costco crab meat price",
  "Tomato Basil Soup Shooters with Grilled Cheese Croutons": "Costco tomato basil soup price",
  "Chilled Cucumber-Dill Soup Shots": "Costco cucumber price",
  "Roasted Red Pepper & Tomato Soup Bar": "Costco roasted red peppers price",
  "Roasted Tomato & Basil Soup": "Costco tomato basil soup price",
  "Beef & Black Bean Chili Station": "Costco ground beef price",
  "Moroccan-Spiced Chickpea Stew": "Costco canned chickpeas price",
  "Smoked Trout Mousse on Cucumber Rounds": "Costco smoked trout price",

  // Salads & Grains
  "Asian Sesame Slaw with Peanut Dressing": "Costco coleslaw mix price",
  "Cucumber & Tomato Salad with Feta": "Costco Roma tomatoes price",
  "Elote Street Corn Salad": "Costco corn kernels price",
  "Fattoush Salad with Sumac-Pita Croutons": "Costco romaine lettuce price",
  "Greek Orzo Salad with Lemon Vinaigrette": "Kirkland orzo pasta price",
  "Kale & Wild Rice Salad with Pomegranate": "Costco wild rice blend price",
  "Quinoa & Roasted Vegetable Salad": "Costco quinoa price",
  "Roasted Beet & Goat Cheese Salad": "Costco beets price",
  "Soba Noodle Salad with Sesame-Ginger Dressing": "Costco soba noodles price",
  "Dinner Rolls & Soft Breads": "Kirkland dinner rolls price",

  // Vegetables & Sides
  "Cauliflower Steaks with Chimichurri": "Costco cauliflower price",
  "Creamy Parmesan Polenta": "Costco polenta tube price",
  "Grilled Corn with Chili-Lime Butter": "Costco corn price",
  "Honey-Glazed Carrots": "Costco baby carrots price",
  "Honey-Glazed Carrots with Thyme": "Costco baby carrots price",
  "Mediterranean Roasted Vegetable Medley": "Costco frozen mixed vegetables price",
  "Roasted Red Potatoes": "Costco red potatoes price",
  "Herb-Roasted Fingerling Potatoes": "Costco fingerling potatoes price",
  "Saffron Basmati Rice Pilaf": "Costco basmati rice price",
  "Wild Rice Pilaf": "Costco wild rice blend price",
  "Grain Bowl Station": "Costco quinoa price",
  "Roasted Sweet Potato & Farro Bowl": "Costco sweet potatoes price",
  "Polenta Bruschetta with Mushroom Ragu": "Costco polenta tube price",
  "Pappardelle with Mushroom Truffle Cream": "Costco pappardelle pasta price",
  "Lemon Ricotta Stuffed Shells": "Costco ricotta cheese price",
  "Roasted Vegetable & Goat Cheese Pasta": "Kirkland goat cheese log price",
  "Cacio e Pepe Mac & Cheese Bar": "Kirkland mac and cheese price",
  "DIY Pasta Station with Choice of Sauces": "Costco pasta variety pack price",

  // Breakfast & Brunch Items
  "Chilaquiles Breakfast Casserole": "Costco tortilla chips price",
  "Frittata Bites with Roasted Vegetables": "Costco eggs liquid price",
  "Brunch Yogurt & Granola Parfait Bar": "Kirkland granola price",
  "Mini Belgian Waffle Bar": "Kirkland waffle mix price",
  "Cinnamon Roll Bites with Cream Cheese Glaze": "Kirkland cinnamon rolls price",
  "Jalapeño Cheddar Cornbread Muffins": "Kirkland cornbread mix price",
  "Artisan Bread & Butter Board": "Kirkland artisan bread price",
  "Rosemary Focaccia with Olive Oil Dip": "Costco focaccia bread price",
  "Garlic Naan Bread Station": "Costco naan bread price",

  // Desserts
  "Baklava Bites": "Costco baklava price",
  "Banana Pudding Cups": "Costco bananas price",
  "Bananas Foster": "Costco bananas price",
  "Brownie Bites with Ganache Drizzle": "Kirkland brownie bites price",
  "Cake Pops Display": "Costco cake pops price",
  "Chocolate-Dipped Strawberries Display": "Costco strawberries price",
  "Coconut Macaroons Dipped in Chocolate": "Costco coconut flakes price",
  "Frozen Yogurt Parfait Bar": "Kirkland frozen yogurt price",
  "Lemon Bars with Powdered Sugar": "Kirkland lemon bars price",
  "Mascarpone Berry Parfaits": "Costco mixed berries frozen price",
  "Mini Cheesecake Bites Variety": "Kirkland cheesecake bites price",
  "Mini Dessert Churros with Dipping Sauces": "Costco churros price",
  "Mini Fruit Tarts": "Kirkland fruit tarts price",
  "Mini Pecan Pie Bites": "Kirkland pecan pie price",
  "Panna Cotta Shooters with Berry Compose": "Costco heavy cream price",
  "Pie Bar with Three Varieties": "Kirkland pie assortment price",
  "Profiterole Tower with Chocolate Drizzle": "Costco cream puffs price",
  "Wedding Cake Push Pops": "Costco cake price",
  "Berry & Lemon Tartlets": "Kirkland lemon tartlets price",

  // Meat & Seafood Entrees
  "Chicken Cacciatore Braised Thighs": "Costco chicken thighs price",
  "Chicken Tikka Masala": "Costco chicken breast per pound price",
  "Balsamic-Glazed Meatballs with Polenta": "Costco frozen meatballs price",
  "Swedish Meatballs with Lingonberry Cream": "Costco frozen meatballs price",
  "Mojo-Marinated pulled Pork Shoulder": "Costco pork shoulder price",
  "Teriyaki Glazed Pork Belly Bites": "Costco pork belly price",
  "Andouille Sausage Jambalaya": "Costco andouille sausage price",
  "Sweet Italian Sausage Station with Peppers & Onions": "Costco italian sausage price",
  "Beef & Broccoli Stir-Fry": "Costco beef stir fry meat price",
  "Grilled Skirt Steak Fajita Carving": "Costco skirt steak price",
  "Paella Valenciana Station": "Costco paella rice price",

  // Beverages & Bars
  "Build-Your-Own Bloody Mary Bar": "Kirkland bloody mary mix price",
  "Hibiscus Agua Fresca Bar": "Costco hibiscus tea price",

  // Rice Krispie & S'mores variants
  "Rice Krispie Treat Bar": "Kirkland rice krispies price",
  "S'mores Bar": "Kirkland marshmallows price",
  "S'mores Station": "Kirkland marshmallows price",
}

/**
 * Returns the Costco search query for a given ingredient name.
 * Falls back to a generated search if not explicitly mapped.
 */
export function getSearchQuery(ingredientName: string): string {
  return INGREDIENT_COSTCO_MAP[ingredientName] || `Costco ${ingredientName.toLowerCase().replace(/ base mix$/, "")} price`
}