const { createClient } = require('@supabase/supabase-js')

const client = createClient(
  'https://asnkchxmqanvdljzgshv.supabase.co',
  'sb_secret_tM5ALPnz-OOn2ukcRQaWIQ_cH80GyHm'
)

const ITEMS = [
  // ===== APPETIZERS (30+) =====
  { name: "Truffle Lobster Bisque", section: "appetizers", category_name: "Soups & Starters", price: 18.00, cost_per_serving: 6.50, portion_weight_g: 240, is_signature: true, difficulty: "hard", prep_time: 45, nutrition: { calories: 320, protein: 18, carbs: 12, fat: 24, fiber: 1 }, description: "Creamy bisque with Maine lobster, white truffle oil, and sherry cream" },
  { name: "Seared Scallops", section: "appetizers", category_name: "Seafood Starters", price: 22.00, cost_per_serving: 8.20, portion_weight_g: 150, is_signature: true, difficulty: "medium", prep_time: 25, nutrition: { calories: 280, protein: 24, carbs: 6, fat: 18, fiber: 0 }, description: "U-10 scallops with caper brown butter and microgreens" },
  { name: "Bruschetta Trio", section: "appetizers", category_name: "Light Bites", price: 14.00, cost_per_serving: 4.80, portion_weight_g: 180, difficulty: "easy", prep_time: 20, nutrition: { calories: 240, protein: 8, carbs: 28, fat: 12, fiber: 3 }, description: "Heirloom tomato, roasted pepper & goat cheese, and mushroom & thyme" },
  { name: "Crispy Calamari", section: "appetizers", category_name: "Fried Favorites", price: 16.00, cost_per_serving: 5.50, portion_weight_g: 200, difficulty: "easy", prep_time: 15, nutrition: { calories: 380, protein: 16, carbs: 32, fat: 22, fiber: 1 }, description: "Flash-fried calamari with spicy marinara and lemon aioli" },
  { name: "Prosciutto-Wrapped Melon", section: "appetizers", category_name: "Cold Appetizers", price: 15.00, cost_per_serving: 5.20, portion_weight_g: 160, difficulty: "easy", prep_time: 10, nutrition: { calories: 180, protein: 12, carbs: 14, fat: 10, fiber: 1 }, description: "Prosciutto di Parma wrapped around seasonal melon with balsamic drizzle" },
  { name: "Smoked Salmon Tartare", section: "appetizers", category_name: "Seafood Starters", price: 20.00, cost_per_serving: 7.50, portion_weight_g: 140, is_signature: true, difficulty: "medium", prep_time: 30, nutrition: { calories: 260, protein: 22, carbs: 4, fat: 18, fiber: 0 }, description: "House-cured salmon with capers, red onion, and toasted brioche points" },
  { name: "Stuffed Mushrooms", section: "appetizers", category_name: "Hot Appetizers", price: 14.00, cost_per_serving: 4.50, portion_weight_g: 200, difficulty: "easy", prep_time: 25, nutrition: { calories: 220, protein: 10, carbs: 14, fat: 16, fiber: 2 }, description: "Cremini mushrooms stuffed with herbed ricotta and panko" },
  { name: "Shrimp Cocktail", section: "appetizers", category_name: "Seafood Starters", price: 18.00, cost_per_serving: 7.00, portion_weight_g: 180, difficulty: "easy", prep_time: 15, nutrition: { calories: 200, protein: 28, carbs: 4, fat: 8, fiber: 0 }, description: "Colossal shrimp with housemade cocktail sauce and lemon" },
  { name: "Caprese Skewers", section: "appetizers", category_name: "Light Bites", price: 12.00, cost_per_serving: 3.80, portion_weight_g: 150, difficulty: "easy", prep_time: 15, nutrition: { calories: 190, protein: 10, carbs: 6, fat: 16, fiber: 1 }, description: "Fresh mozzarella, cherry tomato, and basil drizzled with balsamic glaze" },
  { name: "Crab Cakes", section: "appetizers", category_name: "Seafood Starters", price: 20.00, cost_per_serving: 8.00, portion_weight_g: 160, difficulty: "medium", prep_time: 30, nutrition: { calories: 340, protein: 20, carbs: 18, fat: 22, fiber: 1 }, description: "Jumbo lump crab cakes with remoulade sauce" },
  { name: "Mini Beef Wellington", section: "appetizers", category_name: "Hot Appetizers", price: 24.00, cost_per_serving: 9.50, portion_weight_g: 120, is_signature: true, difficulty: "hard", prep_time: 60, nutrition: { calories: 380, protein: 22, carbs: 16, fat: 26, fiber: 1 }, description: "Petite filet wrapped in puff pastry with duxelles and prosciutto" },
  { name: "Charcuterie Board", section: "appetizers", category_name: "Cold Appetizers", price: 22.00, cost_per_serving: 8.80, portion_weight_g: 250, difficulty: "easy", prep_time: 20, nutrition: { calories: 420, protein: 24, carbs: 10, fat: 34, fiber: 2 }, description: "Curated selection of artisan meats, cheeses, nuts, and honey" },
  { name: "Spinach Artichoke Dip", section: "appetizers", category_name: "Hot Appetizers", price: 14.00, cost_per_serving: 4.20, portion_weight_g: 220, difficulty: "easy", prep_time: 25, nutrition: { calories: 310, protein: 12, carbs: 14, fat: 24, fiber: 2 }, description: "Creamy dip with crispy tortilla chips" },
  { name: "Ahi Tuna Poke", section: "appetizers", category_name: "Seafood Starters", price: 19.00, cost_per_serving: 7.80, portion_weight_g: 160, difficulty: "medium", prep_time: 20, nutrition: { calories: 240, protein: 26, carbs: 8, fat: 12, fiber: 1 }, description: "Sushi-grade ahi with sesame, avocado, and wonton chips" },
  { name: "Roasted Beet Salad", section: "appetizers", category_name: "Salads", price: 15.00, cost_per_serving: 4.50, portion_weight_g: 200, difficulty: "easy", prep_time: 45, nutrition: { calories: 210, protein: 6, carbs: 22, fat: 12, fiber: 5 }, description: "Roasted golden and red beets with goat cheese and candied pecans" },
  { name: "French Onion Soup", section: "appetizers", category_name: "Soups & Starters", price: 14.00, cost_per_serving: 3.80, portion_weight_g: 280, difficulty: "medium", prep_time: 60, nutrition: { calories: 340, protein: 14, carbs: 26, fat: 20, fiber: 2 }, description: "Classic onion soup with Gruyère crouton" },
  { name: "Tuna Tartare", section: "appetizers", category_name: "Seafood Starters", price: 20.00, cost_per_serving: 8.00, portion_weight_g: 140, is_signature: true, difficulty: "medium", prep_time: 25, nutrition: { calories: 220, protein: 24, carbs: 4, fat: 12, fiber: 0 }, description: "Fresh ahi with avocado mousse and sesame tuile" },
  { name: "Fried Mac & Cheese Bites", section: "appetizers", category_name: "Fried Favorites", price: 13.00, cost_per_serving: 3.50, portion_weight_g: 180, difficulty: "easy", prep_time: 30, nutrition: { calories: 360, protein: 14, carbs: 28, fat: 22, fiber: 1 }, description: "Crispy breaded mac & cheese with sriracha aioli" },
  { name: "Antipasto Platter", section: "appetizers", category_name: "Cold Appetizers", price: 18.00, cost_per_serving: 7.00, portion_weight_g: 220, difficulty: "easy", prep_time: 15, nutrition: { calories: 380, protein: 20, carbs: 12, fat: 28, fiber: 3 }, description: "Cured meats, marinated vegetables, olives, and aged cheeses" },
  { name: "Spring Rolls", section: "appetizers", category_name: "Fried Favorites", price: 13.00, cost_per_serving: 3.20, portion_weight_g: 180, difficulty: "easy", prep_time: 25, nutrition: { calories: 280, protein: 8, carbs: 30, fat: 16, fiber: 2 }, description: "Crispy Vietnamese spring rolls with sweet chili sauce" },
  { name: "Deviled Eggs", section: "appetizers", category_name: "Light Bites", price: 11.00, cost_per_serving: 2.80, portion_weight_g: 160, difficulty: "easy", prep_time: 20, nutrition: { calories: 200, protein: 12, carbs: 2, fat: 16, fiber: 0 }, description: "Classic deviled eggs with smoked paprika and chives" },
  { name: "Lobster Corn Dogs", section: "appetizers", category_name: "Fried Favorites", price: 22.00, cost_per_serving: 9.00, portion_weight_g: 140, is_signature: true, difficulty: "medium", prep_time: 30, nutrition: { calories: 300, protein: 16, carbs: 20, fat: 18, fiber: 0 }, description: "Lobster tail dipped in tempura batter with wasabi aioli" },
  { name: "Caesar Salad", section: "appetizers", category_name: "Salads", price: 13.00, cost_per_serving: 3.00, portion_weight_g: 200, difficulty: "easy", prep_time: 10, nutrition: { calories: 280, protein: 10, carbs: 12, fat: 22, fiber: 3 }, description: "Romaine with house-made Caesar dressing and garlic croutons" },
  { name: "Tomato Basil Soup", section: "appetizers", category_name: "Soups & Starters", price: 11.00, cost_per_serving: 2.50, portion_weight_g: 280, difficulty: "easy", prep_time: 35, nutrition: { calories: 190, protein: 4, carbs: 22, fat: 10, fiber: 3 }, description: "Roasted tomato soup with basil pesto drizzle" },
  { name: "Bacon-Wrapped Dates", section: "appetizers", category_name: "Hot Appetizers", price: 14.00, cost_per_serving: 4.00, portion_weight_g: 140, difficulty: "easy", prep_time: 20, nutrition: { calories: 260, protein: 10, carbs: 22, fat: 16, fiber: 3 }, description: "Medjool dates stuffed with goat cheese and wrapped in bacon" },
  { name: "Grilled Vegetable Platter", section: "appetizers", category_name: "Light Bites", price: 14.00, cost_per_serving: 4.00, portion_weight_g: 250, difficulty: "easy", prep_time: 20, nutrition: { calories: 180, protein: 6, carbs: 20, fat: 10, fiber: 6 }, description: "Seasonal grilled vegetables with romesco sauce" },
  { name: "Gazpacho Shooter", section: "appetizers", category_name: "Soups & Starters", price: 10.00, cost_per_serving: 2.20, portion_weight_g: 120, difficulty: "easy", prep_time: 120, nutrition: { calories: 80, protein: 2, carbs: 12, fat: 4, fiber: 2 }, description: "Chilled Andalusian gazpacho in shot glasses" },
  { name: "Oysters Rockefeller", section: "appetizers", category_name: "Seafood Starters", price: 24.00, cost_per_serving: 10.00, portion_weight_g: 160, is_signature: true, difficulty: "hard", prep_time: 35, nutrition: { calories: 240, protein: 14, carbs: 10, fat: 16, fiber: 1 }, description: "Baked oysters with spinach, herbs, and Pernod-butter crumbs" },
  { name: "Fried Pickles", section: "appetizers", category_name: "Fried Favorites", price: 10.00, cost_per_serving: 2.00, portion_weight_g: 180, difficulty: "easy", prep_time: 15, nutrition: { calories: 240, protein: 4, carbs: 28, fat: 14, fiber: 2 }, description: "Dill pickle chips with chipotle ranch dipping sauce" },
  { name: "Wild Mushroom Risotto", section: "appetizers", category_name: "Light Bites", price: 16.00, cost_per_serving: 5.00, portion_weight_g: 220, difficulty: "medium", prep_time: 40, nutrition: { calories: 340, protein: 8, carbs: 40, fat: 18, fiber: 2 }, description: "Creamy arborio rice with wild mushrooms and truffle oil" },

  // ===== PROTEINS / ENTREES (30+) =====
  { name: "Filet Mignon", section: "proteins", category_name: "Beef", price: 52.00, cost_per_serving: 24.00, portion_weight_g: 280, is_signature: true, difficulty: "hard", prep_time: 30, nutrition: { calories: 520, protein: 48, carbs: 2, fat: 36, fiber: 0 } },
  { name: "Herb-Crusted Rack of Lamb", section: "proteins", category_name: "Lamb", price: 48.00, cost_per_serving: 22.00, portion_weight_g: 260, is_signature: true, difficulty: "hard", prep_time: 35, nutrition: { calories: 480, protein: 40, carbs: 4, fat: 34, fiber: 0 } },
  { name: "Pan-Seared Salmon", section: "proteins", category_name: "Fish", price: 36.00, cost_per_serving: 14.00, portion_weight_g: 220, difficulty: "medium", prep_time: 20, nutrition: { calories: 380, protein: 42, carbs: 2, fat: 22, fiber: 0 } },
  { name: "Roasted Chicken Breast", section: "proteins", category_name: "Poultry", price: 28.00, cost_per_serving: 8.00, portion_weight_g: 240, difficulty: "easy", prep_time: 35, nutrition: { calories: 340, protein: 46, carbs: 0, fat: 16, fiber: 0 } },
  { name: "Grilled Ribeye Steak", section: "proteins", category_name: "Beef", price: 46.00, cost_per_serving: 20.00, portion_weight_g: 320, difficulty: "medium", prep_time: 25, nutrition: { calories: 640, protein: 52, carbs: 0, fat: 48, fiber: 0 } },
  { name: "Lobster Tail", section: "proteins", category_name: "Seafood", price: 58.00, cost_per_serving: 28.00, portion_weight_g: 200, is_signature: true, difficulty: "hard", prep_time: 25, nutrition: { calories: 280, protein: 36, carbs: 2, fat: 14, fiber: 0 } },
  { name: "Veal Osso Buco", section: "proteins", category_name: "Veal", price: 44.00, cost_per_serving: 18.00, portion_weight_g: 340, is_signature: true, difficulty: "hard", prep_time: 180, nutrition: { calories: 520, protein: 44, carbs: 8, fat: 32, fiber: 1 } },
  { name: "Grilled Swordfish", section: "proteins", category_name: "Fish", price: 38.00, cost_per_serving: 16.00, portion_weight_g: 240, difficulty: "medium", prep_time: 20, nutrition: { calories: 320, protein: 40, carbs: 0, fat: 18, fiber: 0 } },
  { name: "Pork Tenderloin", section: "proteins", category_name: "Pork", price: 32.00, cost_per_serving: 10.00, portion_weight_g: 250, difficulty: "medium", prep_time: 30, nutrition: { calories: 360, protein: 44, carbs: 4, fat: 18, fiber: 0 } },
  { name: "Duck Confit", section: "proteins", category_name: "Poultry", price: 38.00, cost_per_serving: 14.00, portion_weight_g: 260, is_signature: true, difficulty: "hard", prep_time: 240, nutrition: { calories: 480, protein: 36, carbs: 2, fat: 36, fiber: 0 } },
  { name: "Vegetable Wellington", section: "proteins", category_name: "Vegetarian", price: 30.00, cost_per_serving: 10.00, portion_weight_g: 280, difficulty: "hard", prep_time: 60, nutrition: { calories: 380, protein: 12, carbs: 34, fat: 24, fiber: 6 } },
  { name: "Pan-Seared Halibut", section: "proteins", category_name: "Fish", price: 42.00, cost_per_serving: 18.00, portion_weight_g: 220, difficulty: "medium", prep_time: 20, nutrition: { calories: 340, protein: 46, carbs: 2, fat: 16, fiber: 0 } },
  { name: "Braised Short Ribs", section: "proteins", category_name: "Beef", price: 40.00, cost_per_serving: 16.00, portion_weight_g: 300, difficulty: "hard", prep_time: 240, nutrition: { calories: 580, protein: 48, carbs: 6, fat: 40, fiber: 0 } },
  { name: "Grilled Lamb Chops", section: "proteins", category_name: "Lamb", price: 44.00, cost_per_serving: 20.00, portion_weight_g: 260, difficulty: "medium", prep_time: 25, nutrition: { calories: 460, protein: 38, carbs: 2, fat: 34, fiber: 0 } },
  { name: "Seared Ahi Tuna", section: "proteins", category_name: "Fish", price: 38.00, cost_per_serving: 16.00, portion_weight_g: 200, difficulty: "medium", prep_time: 15, nutrition: { calories: 260, protein: 40, carbs: 2, fat: 10, fiber: 0 } },
  { name: "Stuffed Chicken Marsala", section: "proteins", category_name: "Poultry", price: 32.00, cost_per_serving: 10.00, portion_weight_g: 260, difficulty: "medium", prep_time: 40, nutrition: { calories: 420, protein: 44, carbs: 10, fat: 22, fiber: 1 } },
  { name: "Lamb Shank", section: "proteins", category_name: "Lamb", price: 42.00, cost_per_serving: 18.00, portion_weight_g: 340, difficulty: "hard", prep_time: 180, nutrition: { calories: 540, protein: 44, carbs: 4, fat: 38, fiber: 0 } },
  { name: "Wild Salmon en Croûte", section: "proteins", category_name: "Fish", price: 40.00, cost_per_serving: 16.00, portion_weight_g: 240, is_signature: true, difficulty: "hard", prep_time: 50, nutrition: { calories: 440, protein: 38, carbs: 18, fat: 24, fiber: 1 } },
  { name: "Prime NY Strip", section: "proteins", category_name: "Beef", price: 48.00, cost_per_serving: 22.00, portion_weight_g: 300, difficulty: "medium", prep_time: 25, nutrition: { calories: 580, protein: 50, carbs: 0, fat: 42, fiber: 0 } },
  { name: "Roasted Pork Loin", section: "proteins", category_name: "Pork", price: 30.00, cost_per_serving: 9.00, portion_weight_g: 260, difficulty: "medium", prep_time: 50, nutrition: { calories: 340, protein: 42, carbs: 2, fat: 18, fiber: 0 } },
  { name: "Eggplant Parmesan", section: "proteins", category_name: "Vegetarian", price: 26.00, cost_per_serving: 7.00, portion_weight_g: 300, difficulty: "medium", prep_time: 45, nutrition: { calories: 380, protein: 16, carbs: 30, fat: 24, fiber: 6 } },
  { name: "Surf & Turf", section: "proteins", category_name: "Beef", price: 64.00, cost_per_serving: 30.00, portion_weight_g: 340, is_signature: true, difficulty: "hard", prep_time: 35, nutrition: { calories: 620, protein: 56, carbs: 4, fat: 42, fiber: 0 } },
  { name: "Parmesan Crusted Chicken", section: "proteins", category_name: "Poultry", price: 30.00, cost_per_serving: 9.00, portion_weight_g: 250, difficulty: "easy", prep_time: 30, nutrition: { calories: 440, protein: 46, carbs: 8, fat: 24, fiber: 0 } },
  { name: "Pan-Seared Trout", section: "proteins", category_name: "Fish", price: 34.00, cost_per_serving: 12.00, portion_weight_g: 240, difficulty: "medium", prep_time: 20, nutrition: { calories: 320, protein: 38, carbs: 2, fat: 18, fiber: 0 } },
  { name: "Wagyu Burger", section: "proteins", category_name: "Beef", price: 28.00, cost_per_serving: 12.00, portion_weight_g: 280, difficulty: "easy", prep_time: 20, nutrition: { calories: 580, protein: 36, carbs: 28, fat: 36, fiber: 2 } },
  { name: "Honey Glazed Ham", section: "proteins", category_name: "Pork", price: 34.00, cost_per_serving: 12.00, portion_weight_g: 280, difficulty: "medium", prep_time: 120, nutrition: { calories: 420, protein: 40, carbs: 18, fat: 20, fiber: 0 } },
  { name: "Vegan Stuffed Peppers", section: "proteins", category_name: "Vegetarian", price: 26.00, cost_per_serving: 7.00, portion_weight_g: 300, difficulty: "medium", prep_time: 45, nutrition: { calories: 320, protein: 14, carbs: 36, fat: 16, fiber: 8 } },
  { name: "Branzino Mediterranean", section: "proteins", category_name: "Fish", price: 40.00, cost_per_serving: 16.00, portion_weight_g: 260, is_signature: true, difficulty: "hard", prep_time: 30, nutrition: { calories: 360, protein: 44, carbs: 4, fat: 18, fiber: 1 } },
  { name: "Beef Tenderloin Medallions", section: "proteins", category_name: "Beef", price: 44.00, cost_per_serving: 20.00, portion_weight_g: 240, difficulty: "medium", prep_time: 25, nutrition: { calories: 440, protein: 44, carbs: 2, fat: 28, fiber: 0 } },
  { name: "Miso-Glazed Cod", section: "proteins", category_name: "Fish", price: 38.00, cost_per_serving: 16.00, portion_weight_g: 220, difficulty: "medium", prep_time: 30, nutrition: { calories: 340, protein: 36, carbs: 10, fat: 18, fiber: 0 } },

  // ===== SIDES (30+) =====
  { name: "Truffle Mashed Potatoes", section: "sides", category_name: "Potatoes & Grains", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 200, difficulty: "easy", prep_time: 30, nutrition: { calories: 260, protein: 6, carbs: 28, fat: 16, fiber: 2 } },
  { name: "Roasted Asparagus", section: "sides", category_name: "Vegetables", price: 11.00, cost_per_serving: 4.00, portion_weight_g: 180, difficulty: "easy", prep_time: 15, nutrition: { calories: 80, protein: 5, carbs: 6, fat: 5, fiber: 3 } },
  { name: "Grilled Seasonal Vegetables", section: "sides", category_name: "Vegetables", price: 10.00, cost_per_serving: 3.00, portion_weight_g: 220, difficulty: "easy", prep_time: 15, nutrition: { calories: 100, protein: 4, carbs: 12, fat: 6, fiber: 4 } },
  { name: "Wild Rice Pilaf", section: "sides", category_name: "Potatoes & Grains", price: 10.00, cost_per_serving: 2.50, portion_weight_g: 200, difficulty: "medium", prep_time: 40, nutrition: { calories: 220, protein: 6, carbs: 38, fat: 6, fiber: 3 } },
  { name: "Creamed Spinach", section: "sides", category_name: "Vegetables", price: 10.00, cost_per_serving: 3.00, portion_weight_g: 200, difficulty: "easy", prep_time: 20, nutrition: { calories: 180, protein: 6, carbs: 8, fat: 14, fiber: 2 } },
  { name: "Roasted Fingerling Potatoes", section: "sides", category_name: "Potatoes & Grains", price: 10.00, cost_per_serving: 2.50, portion_weight_g: 200, difficulty: "easy", prep_time: 30, nutrition: { calories: 200, protein: 4, carbs: 32, fat: 8, fiber: 3 } },
  { name: "Honey-Glazed Carrots", section: "sides", category_name: "Vegetables", price: 10.00, cost_per_serving: 2.00, portion_weight_g: 180, difficulty: "easy", prep_time: 25, nutrition: { calories: 140, protein: 2, carbs: 26, fat: 4, fiber: 4 } },
  { name: "Sautéed Green Beans", section: "sides", category_name: "Vegetables", price: 9.00, cost_per_serving: 2.50, portion_weight_g: 180, difficulty: "easy", prep_time: 10, nutrition: { calories: 80, protein: 3, carbs: 8, fat: 5, fiber: 3 } },
  { name: "Mac & Cheese", section: "sides", category_name: "Potatoes & Grains", price: 12.00, cost_per_serving: 3.50, portion_weight_g: 240, difficulty: "easy", prep_time: 30, nutrition: { calories: 420, protein: 16, carbs: 34, fat: 26, fiber: 1 } },
  { name: "Roasted Brussels Sprouts", section: "sides", category_name: "Vegetables", price: 11.00, cost_per_serving: 3.00, portion_weight_g: 200, difficulty: "easy", prep_time: 30, nutrition: { calories: 120, protein: 5, carbs: 14, fat: 7, fiber: 5 } },
  { name: "Sweet Potato Casserole", section: "sides", category_name: "Potatoes & Grains", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 220, difficulty: "medium", prep_time: 45, nutrition: { calories: 280, protein: 4, carbs: 44, fat: 12, fiber: 4 } },
  { name: "Grilled Polenta", section: "sides", category_name: "Potatoes & Grains", price: 10.00, cost_per_serving: 2.00, portion_weight_g: 200, difficulty: "medium", prep_time: 30, nutrition: { calories: 180, protein: 4, carbs: 30, fat: 6, fiber: 2 } },
  { name: "Sautéed Mushrooms", section: "sides", category_name: "Vegetables", price: 11.00, cost_per_serving: 4.00, portion_weight_g: 160, difficulty: "easy", prep_time: 15, nutrition: { calories: 80, protein: 4, carbs: 6, fat: 6, fiber: 1 } },
  { name: "Garlic Green Beans", section: "sides", category_name: "Vegetables", price: 9.00, cost_per_serving: 2.50, portion_weight_g: 180, difficulty: "easy", prep_time: 12, nutrition: { calories: 90, protein: 3, carbs: 8, fat: 6, fiber: 3 } },
  { name: "Truffle Fries", section: "sides", category_name: "Potatoes & Grains", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 220, difficulty: "easy", prep_time: 20, nutrition: { calories: 340, protein: 4, carbs: 38, fat: 20, fiber: 3 } },
  { name: "Corn on the Cob", section: "sides", category_name: "Vegetables", price: 8.00, cost_per_serving: 2.00, portion_weight_g: 200, difficulty: "easy", prep_time: 15, nutrition: { calories: 140, protein: 4, carbs: 30, fat: 2, fiber: 3 } },
  { name: "Roasted Cauliflower", section: "sides", category_name: "Vegetables", price: 10.00, cost_per_serving: 2.50, portion_weight_g: 220, difficulty: "easy", prep_time: 30, nutrition: { calories: 80, protein: 4, carbs: 10, fat: 4, fiber: 4 } },
  { name: "Cheddar Grits", section: "sides", category_name: "Potatoes & Grains", price: 10.00, cost_per_serving: 2.00, portion_weight_g: 240, difficulty: "easy", prep_time: 25, nutrition: { calories: 260, protein: 8, carbs: 32, fat: 12, fiber: 1 } },
  { name: "Steamed Broccoli", section: "sides", category_name: "Vegetables", price: 8.00, cost_per_serving: 1.50, portion_weight_g: 180, difficulty: "easy", prep_time: 8, nutrition: { calories: 55, protein: 4, carbs: 8, fat: 1, fiber: 4 } },
  { name: "Baked Beans", section: "sides", category_name: "Vegetables", price: 9.00, cost_per_serving: 2.00, portion_weight_g: 220, difficulty: "easy", prep_time: 120, nutrition: { calories: 240, protein: 10, carbs: 40, fat: 4, fiber: 8 } },
  { name: "Sautéed Kale", section: "sides", category_name: "Vegetables", price: 10.00, cost_per_serving: 3.00, portion_weight_g: 180, difficulty: "easy", prep_time: 12, nutrition: { calories: 70, protein: 4, carbs: 8, fat: 4, fiber: 3 } },
  { name: "Lemon Herb Rice", section: "sides", category_name: "Potatoes & Grains", price: 8.00, cost_per_serving: 1.80, portion_weight_g: 200, difficulty: "easy", prep_time: 25, nutrition: { calories: 200, protein: 4, carbs: 40, fat: 3, fiber: 1 } },
  { name: "Roasted Butternut Squash", section: "sides", category_name: "Vegetables", price: 11.00, cost_per_serving: 3.00, portion_weight_g: 220, difficulty: "easy", prep_time: 35, nutrition: { calories: 120, protein: 2, carbs: 22, fat: 4, fiber: 4 } },
  { name: "Twice-Baked Potato", section: "sides", category_name: "Potatoes & Grains", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 280, difficulty: "medium", prep_time: 60, nutrition: { calories: 360, protein: 10, carbs: 38, fat: 20, fiber: 3 } },
  { name: "Grilled Zucchini", section: "sides", category_name: "Vegetables", price: 9.00, cost_per_serving: 2.00, portion_weight_g: 200, difficulty: "easy", prep_time: 12, nutrition: { calories: 50, protein: 3, carbs: 6, fat: 3, fiber: 2 } },
  { name: "Quinoa & Arugula Salad", section: "sides", category_name: "Salads", price: 11.00, cost_per_serving: 3.50, portion_weight_g: 180, difficulty: "easy", prep_time: 20, nutrition: { calories: 200, protein: 8, carbs: 26, fat: 8, fiber: 4 } },
  { name: "Creamy Coleslaw", section: "sides", category_name: "Salads", price: 8.00, cost_per_serving: 1.50, portion_weight_g: 180, difficulty: "easy", prep_time: 15, nutrition: { calories: 160, protein: 2, carbs: 14, fat: 12, fiber: 2 } },
  { name: "Tabbouleh", section: "sides", category_name: "Salads", price: 9.00, cost_per_serving: 2.00, portion_weight_g: 180, difficulty: "easy", prep_time: 20, nutrition: { calories: 140, protein: 4, carbs: 22, fat: 6, fiber: 4 } },
  { name: "Grilled Asparagus with Hollandaise", section: "sides", category_name: "Vegetables", price: 13.00, cost_per_serving: 5.00, portion_weight_g: 180, is_signature: true, difficulty: "medium", prep_time: 20, nutrition: { calories: 210, protein: 5, carbs: 6, fat: 19, fiber: 3 } },
  { name: "Lobster Mac & Cheese", section: "sides", category_name: "Potatoes & Grains", price: 18.00, cost_per_serving: 8.00, portion_weight_g: 240, is_signature: true, difficulty: "medium", prep_time: 35, nutrition: { calories: 520, protein: 22, carbs: 36, fat: 32, fiber: 1 } },

  // ===== DESSERTS (30+) =====
  { name: "Classic Crème Brûlée", section: "desserts", category_name: "Classic Desserts", price: 14.00, cost_per_serving: 3.50, portion_weight_g: 160, difficulty: "medium", prep_time: 180, nutrition: { calories: 340, protein: 4, carbs: 30, fat: 24, fiber: 0 } },
  { name: "Chocolate Lava Cake", section: "desserts", category_name: "Chocolate Desserts", price: 16.00, cost_per_serving: 5.00, portion_weight_g: 140, is_signature: true, difficulty: "hard", prep_time: 35, nutrition: { calories: 420, protein: 6, carbs: 44, fat: 26, fiber: 2 } },
  { name: "Tiramisu", section: "desserts", category_name: "Classic Desserts", price: 15.00, cost_per_serving: 4.00, portion_weight_g: 180, difficulty: "medium", prep_time: 240, nutrition: { calories: 380, protein: 6, carbs: 36, fat: 24, fiber: 0 } },
  { name: "New York Cheesecake", section: "desserts", category_name: "Classic Desserts", price: 14.00, cost_per_serving: 3.50, portion_weight_g: 200, difficulty: "medium", prep_time: 240, nutrition: { calories: 440, protein: 8, carbs: 34, fat: 32, fiber: 0 } },
  { name: "Lemon Sorbet", section: "desserts", category_name: "Light Desserts", price: 10.00, cost_per_serving: 2.00, portion_weight_g: 160, difficulty: "easy", prep_time: 240, nutrition: { calories: 120, protein: 0, carbs: 30, fat: 0, fiber: 0 } },
  { name: "Fruit Tart", section: "desserts", category_name: "Light Desserts", price: 14.00, cost_per_serving: 4.50, portion_weight_g: 180, difficulty: "medium", prep_time: 120, nutrition: { calories: 280, protein: 4, carbs: 38, fat: 14, fiber: 2 } },
  { name: "Panna Cotta", section: "desserts", category_name: "Classic Desserts", price: 13.00, cost_per_serving: 3.00, portion_weight_g: 160, difficulty: "medium", prep_time: 240, nutrition: { calories: 300, protein: 4, carbs: 24, fat: 22, fiber: 0 } },
  { name: "Molten Chocolate Cake", section: "desserts", category_name: "Chocolate Desserts", price: 16.00, cost_per_serving: 5.00, portion_weight_g: 150, difficulty: "hard", prep_time: 30, nutrition: { calories: 460, protein: 6, carbs: 48, fat: 28, fiber: 2 } },
  { name: "Bread Pudding", section: "desserts", category_name: "Classic Desserts", price: 13.00, cost_per_serving: 3.00, portion_weight_g: 200, difficulty: "easy", prep_time: 60, nutrition: { calories: 360, protein: 8, carbs: 44, fat: 18, fiber: 2 } },
  { name: "Mango Sorbet", section: "desserts", category_name: "Light Desserts", price: 10.00, cost_per_serving: 2.00, portion_weight_g: 160, difficulty: "easy", prep_time: 240, nutrition: { calories: 130, protein: 0, carbs: 32, fat: 0, fiber: 1 } },
  { name: "Grand Marnier Soufflé", section: "desserts", category_name: "Classic Desserts", price: 18.00, cost_per_serving: 6.00, portion_weight_g: 140, is_signature: true, difficulty: "hard", prep_time: 30, nutrition: { calories: 320, protein: 8, carbs: 32, fat: 18, fiber: 0 } },
  { name: "White Chocolate Raspberry Cheesecake", section: "desserts", category_name: "Chocolate Desserts", price: 16.00, cost_per_serving: 5.00, portion_weight_g: 200, difficulty: "medium", prep_time: 240, nutrition: { calories: 480, protein: 8, carbs: 38, fat: 34, fiber: 1 } },
  { name: "Apple Crumble", section: "desserts", category_name: "Classic Desserts", price: 13.00, cost_per_serving: 3.50, portion_weight_g: 220, difficulty: "easy", prep_time: 50, nutrition: { calories: 340, protein: 3, carbs: 48, fat: 16, fiber: 3 } },
  { name: "Espresso Affogato", section: "desserts", category_name: "Light Desserts", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 120, difficulty: "easy", prep_time: 5, nutrition: { calories: 180, protein: 4, carbs: 18, fat: 10, fiber: 0 } },
  { name: "Crêpes Suzette", section: "desserts", category_name: "Classic Desserts", price: 16.00, cost_per_serving: 5.00, portion_weight_g: 200, is_signature: true, difficulty: "hard", prep_time: 30, nutrition: { calories: 360, protein: 6, carbs: 40, fat: 20, fiber: 1 } },
  { name: "Dark Chocolate Mousse", section: "desserts", category_name: "Chocolate Desserts", price: 14.00, cost_per_serving: 4.00, portion_weight_g: 160, difficulty: "medium", prep_time: 180, nutrition: { calories: 380, protein: 6, carbs: 30, fat: 28, fiber: 3 } },
  { name: "Peach Bellini Sorbet", section: "desserts", category_name: "Light Desserts", price: 11.00, cost_per_serving: 2.50, portion_weight_g: 160, difficulty: "easy", prep_time: 240, nutrition: { calories: 140, protein: 0, carbs: 34, fat: 0, fiber: 0 } },
  { name: "Baklava", section: "desserts", category_name: "International Desserts", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 140, difficulty: "medium", prep_time: 60, nutrition: { calories: 320, protein: 4, carbs: 30, fat: 22, fiber: 2 } },
  { name: "Cannoli", section: "desserts", category_name: "International Desserts", price: 12.00, cost_per_serving: 3.00, portion_weight_g: 120, difficulty: "easy", prep_time: 20, nutrition: { calories: 280, protein: 6, carbs: 26, fat: 18, fiber: 1 } },
  { name: "Churros with Chocolate", section: "desserts", category_name: "International Desserts", price: 12.00, cost_per_serving: 2.50, portion_weight_g: 180, difficulty: "easy", prep_time: 30, nutrition: { calories: 360, protein: 4, carbs: 40, fat: 22, fiber: 2 } },
  { name: "Lemon Ricotta Cake", section: "desserts", category_name: "Light Desserts", price: 14.00, cost_per_serving: 4.00, portion_weight_g: 180, difficulty: "medium", prep_time: 60, nutrition: { calories: 300, protein: 8, carbs: 34, fat: 16, fiber: 1 } },
  { name: "Profiteroles", section: "desserts", category_name: "Classic Desserts", price: 15.00, cost_per_serving: 4.50, portion_weight_g: 160, difficulty: "hard", prep_time: 60, nutrition: { calories: 340, protein: 6, carbs: 28, fat: 24, fiber: 1 } },
  { name: "Salted Caramel Pot de Crème", section: "desserts", category_name: "Chocolate Desserts", price: 14.00, cost_per_serving: 3.50, portion_weight_g: 140, difficulty: "medium", prep_time: 180, nutrition: { calories: 380, protein: 4, carbs: 32, fat: 28, fiber: 0 } },
  { name: "Strawberry Shortcake", section: "desserts", category_name: "Light Desserts", price: 14.00, cost_per_serving: 4.00, portion_weight_g: 200, difficulty: "easy", prep_time: 30, nutrition: { calories: 280, protein: 4, carbs: 38, fat: 14, fiber: 2 } },
  { name: "Matcha Green Tea Cake", section: "desserts", category_name: "International Desserts", price: 15.00, cost_per_serving: 4.50, portion_weight_g: 180, difficulty: "medium", prep_time: 60, nutrition: { calories: 320, protein: 6, carbs: 40, fat: 16, fiber: 1 } },
  { name: "Bananas Foster", section: "desserts", category_name: "Classic Desserts", price: 15.00, cost_per_serving: 4.00, portion_weight_g: 200, difficulty: "medium", prep_time: 15, nutrition: { calories: 360, protein: 2, carbs: 46, fat: 20, fiber: 2 } },
  { name: "Key Lime Pie", section: "desserts", category_name: "Light Desserts", price: 13.00, cost_per_serving: 3.50, portion_weight_g: 180, difficulty: "easy", prep_time: 180, nutrition: { calories: 320, protein: 4, carbs: 36, fat: 18, fiber: 0 } },
  { name: "Chocolate Fondue", section: "desserts", category_name: "Chocolate Desserts", price: 18.00, cost_per_serving: 6.00, portion_weight_g: 220, difficulty: "easy", prep_time: 15, nutrition: { calories: 420, protein: 6, carbs: 44, fat: 26, fiber: 2 } },
  { name: "Pistachio Baklava", section: "desserts", category_name: "International Desserts", price: 14.00, cost_per_serving: 3.50, portion_weight_g: 150, is_signature: true, difficulty: "medium", prep_time: 60, nutrition: { calories: 350, protein: 5, carbs: 28, fat: 26, fiber: 3 } },
  { name: "Mille-Feuille", section: "desserts", category_name: "Classic Desserts", price: 16.00, cost_per_serving: 5.00, portion_weight_g: 160, is_signature: true, difficulty: "hard", prep_time: 120, nutrition: { calories: 380, protein: 6, carbs: 32, fat: 26, fiber: 1 } },
]

async function seed() {
  console.log(`Seeding ${ITEMS.length} menu items...`)
  
  // First, clear existing items
  const { error: delErr } = await client.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) {
    console.log('Delete warning (expected if table empty):', delErr.message)
  }

  const suggestedPairings = {
    "Filet Mignon": ["Truffle Mashed Potatoes", "Roasted Asparagus", "Creamed Spinach", "Grilled Seasonal Vegetables"],
    "Herb-Crusted Rack of Lamb": ["Wild Rice Pilaf", "Roasted Fingerling Potatoes", "Sautéed Green Beans", "Roasted Brussels Sprouts"],
    "Pan-Seared Salmon": ["Lemon Herb Rice", "Sautéed Green Beans", "Roasted Asparagus", "Grilled Zucchini"],
    "Roasted Chicken Breast": ["Truffle Mashed Potatoes", "Honey-Glazed Carrots", "Roasted Cauliflower", "Garlic Green Beans"],
    "Grilled Ribeye Steak": ["Twice-Baked Potato", "Creamed Spinach", "Roasted Brussels Sprouts", "Grilled Mushrooms"],
    "Lobster Tail": ["Truffle Fries", "Roasted Asparagus with Hollandaise", "Grilled Asparagus", "Lemon Herb Rice"],
    "Veal Osso Buco": ["Wild Rice Pilaf", "Roasted Fingerling Potatoes", "Sautéed Kale", "Grilled Polenta"],
    "Grilled Swordfish": ["Lemon Herb Rice", "Grilled Zucchini", "Roasted Cauliflower", "Sautéed Green Beans"],
    "Pork Tenderloin": ["Sweet Potato Casserole", "Roasted Brussels Sprouts", "Honey-Glazed Carrots", "Garlic Green Beans"],
    "Duck Confit": ["Truffle Mashed Potatoes", "Roasted Brussels Sprouts", "Sautéed Kale", "Roasted Fingerling Potatoes"],
    "Vegetable Wellington": ["Truffle Mashed Potatoes", "Roasted Asparagus", "Sautéed Mushrooms", "Grilled Seasonal Vegetables"],
    "Pan-Seared Halibut": ["Lemon Herb Rice", "Sautéed Green Beans", "Roasted Asparagus", "Grilled Zucchini"],
    "Braised Short Ribs": ["Truffle Mashed Potatoes", "Creamed Spinach", "Roasted Brussels Sprouts", "Mac & Cheese"],
    "Grilled Lamb Chops": ["Wild Rice Pilaf", "Roasted Fingerling Potatoes", "Honey-Glazed Carrots", "Roasted Asparagus"],
    "Seared Ahi Tuna": ["Quinoa & Arugula Salad", "Tabbouleh", "Grilled Zucchini", "Lemon Herb Rice"],
    "Stuffed Chicken Marsala": ["Truffle Mashed Potatoes", "Roasted Asparagus", "Sautéed Mushrooms", "Garlic Green Beans"],
    "Lamb Shank": ["Wild Rice Pilaf", "Roasted Cauliflower", "Roasted Fingerling Potatoes", "Sautéed Kale"],
    "Wild Salmon en Croûte": ["Lemon Herb Rice", "Sautéed Green Beans", "Roasted Asparagus with Hollandaise", "Dill Potatoes"],
    "Prime NY Strip": ["Twice-Baked Potato", "Creamed Spinach", "Roasted Brussels Sprouts", "Sautéed Mushrooms"],
    "Roasted Pork Loin": ["Sweet Potato Casserole", "Honey-Glazed Carrots", "Roasted Cauliflower", "Garlic Green Beans"],
    "Eggplant Parmesan": ["Lemon Herb Rice", "Sautéed Kale", "Grilled Zucchini", "Quinoa & Arugula Salad"],
    "Surf & Turf": ["Truffle Mashed Potatoes", "Roasted Asparagus with Hollandaise", "Creamed Spinach", "Lobster Mac & Cheese"],
    "Parmesan Crusted Chicken": ["Truffle Mashed Potatoes", "Roasted Asparagus", "Sautéed Green Beans", "Mac & Cheese"],
    "Pan-Seared Trout": ["Lemon Herb Rice", "Roasted Cauliflower", "Sautéed Green Beans", "Grilled Zucchini"],
    "Wagyu Burger": ["Truffle Fries", "Creamy Coleslaw", "Corn on the Cob", "Sautéed Mushrooms"],
    "Honey Glazed Ham": ["Sweet Potato Casserole", "Roasted Brussels Sprouts", "Honey-Glazed Carrots", "Mac & Cheese"],
    "Vegan Stuffed Peppers": ["Quinoa & Arugula Salad", "Grilled Polenta", "Sautéed Kale", "Tabbouleh"],
    "Branzino Mediterranean": ["Lemon Herb Rice", "Grilled Zucchini", "Tabbouleh", "Sautéed Green Beans"],
    "Beef Tenderloin Medallions": ["Truffle Mashed Potatoes", "Roasted Asparagus", "Creamed Spinach", "Roasted Brussels Sprouts"],
    "Miso-Glazed Cod": ["Wild Rice Pilaf", "Sautéed Green Beans", "Roasted Cauliflower", "Grilled Seasonal Vegetables"],
  }

  // Build name -> id map after we insert
  const insertedIds = new Map()

  // Insert all items without pairings first
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i]
    const seasonMap = {
      appetizers: ["spring", "summer", "fall"],
      proteins: ["spring", "summer", "fall", "winter"],
      sides: ["spring", "summer", "fall"],
      desserts: ["spring", "summer", "fall", "winter"],
    }
    const allergenMap = {
      "appetizers": ["dairy", "gluten"],
      "proteins": [],
      "sides": ["dairy"],
      "desserts": ["dairy", "gluten", "eggs"],
    }

    // Determine category from section
    let category = "Main Courses"
    if (item.section === "appetizers") category = "Appetizers"
    else if (item.section === "sides") category = "Sides"
    else if (item.section === "desserts") category = "Desserts"

    const { error } = await client.from('menu_items').insert({
      category,
      section: item.section,
      name: item.name,
      description: item.description || "",
      price: item.price,
      suggested_menu_price: item.price,
      cost_per_serving: item.cost_per_serving,
      portion_weight_g: item.portion_weight_g,
      nutrition: JSON.stringify(item.nutrition),
      is_available: true,
      is_signature: item.is_signature || false,
      difficulty: item.difficulty,
      prep_time: item.prep_time,
      season_tags: `{${(seasonMap[item.section] || ["spring", "summer"]).join(",")}}`,
      allergens: `{${(allergenMap[item.section] || []).join(",")}}`,
      sort_order: i,
      ingredient_links: JSON.stringify([{ name: "Costco Business Center", url: "https://www.costcobusinessdelivery.com/" }, { name: "WinCo Foods", url: "https://www.wincofoods.com/" }]),
      ingredient_list: JSON.stringify([{ item: item.name, quantity: "per serving", source: "Costco/WinCo" }]),
      last_priced_date: new Date().toISOString().split('T')[0],
    }).select()

    if (error) {
      console.log(`  ✗ Failed: ${item.name} - ${error.message}`)
      failCount++
    } else {
      successCount++
      insertedIds.set(item.name, item.name) // We'll update pairings separately
    }
  }

  console.log(`\nInserted: ${successCount}, Failed: ${failCount}`)

  // Fetch all items to get their IDs for pairings
  const { data: allItems } = await client.from('menu_items').select('id, name')
  const nameToId = new Map((allItems || []).map(function(i) { return [i.name, i.id] }))

  // Update suggested_pairings
  for (const [proteinName, sideNames] of Object.entries(suggestedPairings)) {
    const proteinId = nameToId.get(proteinName)
    if (!proteinId) continue
    const pairingIds = sideNames
      .map((sn) => nameToId.get(sn))
      .filter(Boolean)
    if (pairingIds.length === 0) continue

    const { error } = await client.from('menu_items').update({
      suggested_pairings: `{${pairingIds.join(",")}}`,
    }).eq('id', proteinId)

    if (error) console.log(`  ✗ Pairing update failed for ${proteinName}: ${error.message}`)
    else console.log(`  ✓ Pairings set for ${proteinName} → ${pairingIds.length} sides`)
  }

  console.log('\n✨ Seeding complete!')
}

seed().catch(console.error)