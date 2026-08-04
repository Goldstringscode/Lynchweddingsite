const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(
  process.env.SUPABASE_URL || "https://asnkchxmqanvdljzgshv.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "SUPABASE_SERVICE_ROLE_KEY_FROM_ENV"
)

const horsDOeuvres = [
  { name: "Oyster Rockefeller", desc: "Baked oysters with spinach, Pernod-butter crumbs, and hollandaise", price: 24, cost: 10, weight: 120, cal: 180, pro: 12, carb: 8, fat: 14, fib: 1, sig: true, diff: "hard", prep: 35, allergens: ["shellfish","dairy","gluten"], season: ["fall","winter"] },
  { name: "Lobster Tartlets", desc: "Mini puff pastry shells with lobster tail, tarragon cream, and caviar", price: 28, cost: 12, weight: 60, cal: 220, pro: 14, carb: 10, fat: 16, fib: 0, sig: true, diff: "hard", prep: 40, allergens: ["shellfish","dairy","gluten","eggs"], season: ["spring","summer"] },
  { name: "Wagyu Beef Sliders", desc: "Petite A5 Wagyu patties on brioche with truffle aioli and arugula", price: 26, cost: 11, weight: 90, cal: 340, pro: 22, carb: 18, fat: 24, fib: 1, sig: true, diff: "hard", prep: 25, allergens: ["gluten","dairy","eggs"], season: ["spring","summer","fall"] },
  { name: "Tuna Poke Cones", desc: "Sushi-grade ahi tuna with avocado, sesame, and sriracha in wonton cones", price: 20, cost: 7.5, weight: 70, cal: 190, pro: 16, carb: 12, fat: 10, fib: 1, sig: false, diff: "medium", prep: 25, allergens: ["fish","sesame","gluten"], season: ["spring","summer"] },
  { name: "Prosciutto Melon Skewers", desc: "Prosciutto di San Daniele wrapped around cantaloupe with balsamic pearls", price: 14, cost: 4.5, weight: 80, cal: 140, pro: 10, carb: 12, fat: 8, fib: 1, sig: false, diff: "easy", prep: 15, allergens: [], season: ["spring","summer","fall"] },
  { name: "Smoked Salmon Blinis", desc: "Buckwheat blinis with crème fraîche, smoked salmon, and chives", price: 18, cost: 6, weight: 55, cal: 160, pro: 10, carb: 14, fat: 10, fib: 1, sig: false, diff: "medium", prep: 25, allergens: ["fish","dairy","gluten","eggs"], season: ["all"] },
  { name: "Mini Crab Cakes", desc: "Jumbo lump crab cakes with remoulade and micro greens", price: 22, cost: 8, weight: 75, cal: 240, pro: 18, carb: 10, fat: 16, fib: 0, sig: false, diff: "medium", prep: 30, allergens: ["shellfish","dairy","gluten","eggs"], season: ["all"] },
  { name: "Bacon-Wrapped Dates", desc: "Medjool dates stuffed with goat cheese, wrapped in applewood bacon", price: 14, cost: 4, weight: 60, cal: 200, pro: 8, carb: 22, fat: 12, fib: 2, sig: false, diff: "easy", prep: 20, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Wild Mushroom Arancini", desc: "Crispy risotto balls with wild mushrooms, mozzarella, and truffle oil", price: 16, cost: 5.5, weight: 85, cal: 260, pro: 10, carb: 28, fat: 14, fib: 2, sig: false, diff: "medium", prep: 35, allergens: ["dairy","gluten","eggs"], season: ["fall","winter"] },
  { name: "Shrimp Ceviche Shooters", desc: "Citrus-marinated shrimp, avocado, and mango in shot glasses", price: 18, cost: 6.5, weight: 90, cal: 160, pro: 14, carb: 10, fat: 8, fib: 2, sig: false, diff: "easy", prep: 20, allergens: ["shellfish"], season: ["spring","summer"] },
  { name: "Mini Beef Wellington Bites", desc: "Petite filet wrapped in puff pastry with mushroom duxelles", price: 24, cost: 9.5, weight: 70, cal: 280, pro: 20, carb: 14, fat: 18, fib: 1, sig: true, diff: "hard", prep: 45, allergens: ["gluten","dairy"], season: ["fall","winter"] },
  { name: "Caprese Skewers", desc: "Fresh mozzarella, cherry tomato, and basil with balsamic glaze drizzle", price: 12, cost: 3.8, weight: 60, cal: 150, pro: 8, carb: 6, fat: 10, fib: 1, sig: false, diff: "easy", prep: 10, allergens: ["dairy"], season: ["spring","summer","fall"] },
  { name: "Truffle Mac & Cheese Bites", desc: "Crispy fried macaroni and cheese with black truffle and parmesan", price: 15, cost: 4.5, weight: 65, cal: 300, pro: 12, carb: 24, fat: 18, fib: 1, sig: false, diff: "medium", prep: 25, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Spanakopita Triangles", desc: "Flaky phyllo triangles with spinach, feta, and dill", price: 12, cost: 3, weight: 70, cal: 180, pro: 6, carb: 14, fat: 12, fib: 2, sig: false, diff: "medium", prep: 30, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Lamb Lollipops", desc: "French-cut lamb chops with herb crust and mint yogurt dip", price: 22, cost: 9, weight: 80, cal: 260, pro: 22, carb: 4, fat: 18, fib: 0, sig: true, diff: "hard", prep: 30, allergens: ["dairy"], season: ["spring","fall"] },
  { name: "Parmesan Crisps with Prosciutto", desc: "Baked parmesan wafers topped with prosciutto and fig jam", price: 14, cost: 4.2, weight: 40, cal: 140, pro: 10, carb: 6, fat: 10, fib: 0, sig: false, diff: "easy", prep: 15, allergens: ["dairy"], season: ["all"] },
  { name: "Crab Rangoon Dip", desc: "Creamy crab rangoon dip with crispy wonton chips", price: 16, cost: 5.5, weight: 100, cal: 280, pro: 12, carb: 18, fat: 20, fib: 0, sig: false, diff: "easy", prep: 20, allergens: ["shellfish","dairy","gluten","eggs"], season: ["all"] },
  { name: "Stuffed Mushrooms", desc: "Cremini mushrooms stuffed with herbed ricotta, garlic, and panko", price: 13, cost: 4, weight: 75, cal: 160, pro: 8, carb: 10, fat: 10, fib: 1, sig: false, diff: "easy", prep: 25, allergens: ["dairy","gluten"], season: ["fall","winter"] },
  { name: "Chicken Satay Skewers", desc: "Grilled lemongrass chicken skewers with peanut dipping sauce", price: 14, cost: 4.5, weight: 70, cal: 200, pro: 22, carb: 6, fat: 12, fib: 1, sig: false, diff: "medium", prep: 30, allergens: ["peanuts","sesame"], season: ["spring","summer"] },
  { name: "Tuna Tartare Tacos", desc: "Ahi tuna tartare in mini wonton shells with avocado crema", price: 20, cost: 7, weight: 60, cal: 180, pro: 14, carb: 12, fat: 10, fib: 1, sig: false, diff: "medium", prep: 25, allergens: ["fish","gluten","eggs"], season: ["spring","summer"] },
  { name: "Goat Cheese & Beet Crostini", desc: "Roasted golden beets on toasted baguette with whipped goat cheese", price: 13, cost: 3.5, weight: 55, cal: 140, pro: 6, carb: 16, fat: 8, fib: 2, sig: false, diff: "easy", prep: 20, allergens: ["dairy","gluten"], season: ["fall","spring"] },
  { name: "Mini Quiche Lorraine", desc: "Petite quiche with bacon, gruyère, and caramelized onion", price: 12, cost: 3.2, weight: 50, cal: 220, pro: 12, carb: 10, fat: 16, fib: 0, sig: false, diff: "medium", prep: 35, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Pulled Pork Sliders", desc: "Slow-roasted pulled pork with apple slaw on Hawaiian rolls", price: 14, cost: 4.5, weight: 85, cal: 290, pro: 18, carb: 20, fat: 14, fib: 1, sig: false, diff: "medium", prep: 45, allergens: ["gluten"], season: ["summer","fall"] },
  { name: "Bruschetta Trio", desc: "Heirloom tomato, roasted pepper and goat cheese, and mushroom and thyme", price: 14, cost: 4.8, weight: 65, cal: 160, pro: 6, carb: 18, fat: 8, fib: 2, sig: false, diff: "easy", prep: 15, allergens: ["dairy","gluten"], season: ["summer","fall"] },
  { name: "Shrimp Cocktail", desc: "Colossal chilled shrimp with classic cocktail sauce and lemon", price: 20, cost: 7, weight: 100, cal: 140, pro: 24, carb: 4, fat: 2, fib: 0, sig: false, diff: "easy", prep: 15, allergens: ["shellfish"], season: ["all"] },
  { name: "Deviled Eggs", desc: "Classic deviled eggs with smoked paprika, chives, and candied bacon", price: 11, cost: 2.8, weight: 45, cal: 140, pro: 8, carb: 2, fat: 12, fib: 0, sig: false, diff: "easy", prep: 20, allergens: ["eggs"], season: ["spring","summer"] },
  { name: "Mini Chicken & Waffles", desc: "Crispy chicken tenders on mini waffles with honey sriracha drizzle", price: 14, cost: 4.5, weight: 80, cal: 310, pro: 18, carb: 24, fat: 16, fib: 1, sig: false, diff: "medium", prep: 30, allergens: ["gluten","eggs","dairy"], season: ["all"] },
  { name: "Edamame Hummus Flatbread", desc: "Crispy flatbread with edamame hummus, pickled radish, and microgreens", price: 12, cost: 3.2, weight: 70, cal: 180, pro: 8, carb: 20, fat: 8, fib: 3, sig: false, diff: "easy", prep: 15, allergens: ["soy","gluten","sesame"], season: ["spring","summer"] },
  { name: "Caviar Blini Bar", desc: "Osetra caviar on blini with crème fraîche, chives, and egg mimosa", price: 32, cost: 14, weight: 40, cal: 100, pro: 8, carb: 6, fat: 6, fib: 0, sig: true, diff: "hard", prep: 30, allergens: ["fish","dairy","gluten","eggs"], season: ["winter"] },
  { name: "Grilled Vegetable Antipasto", desc: "Seasonal grilled vegetables with romesco sauce on crostini", price: 13, cost: 3.5, weight: 80, cal: 130, pro: 4, carb: 16, fat: 6, fib: 3, sig: false, diff: "easy", prep: 20, allergens: ["gluten","nuts"], season: ["spring","summer","fall"] },
]

async function run() {
  // Update existing items' sort_order
  const sectionOrder = { appetizers: 2, proteins: 3, sides: 4, desserts: 5 }
  const { data: existing } = await supabase.from("menu_items").select("id,section")
  for (const item of existing || []) {
    const so = sectionOrder[item.section] || 10
    await supabase.from("menu_items").update({ sort_order: so }).eq("id", item.id)
  }
  console.log("Updated sort_order for", existing?.length, "existing items")

  // Insert 30 hors d'oeuvres
  let inserted = 0
  for (const h of horsDOeuvres) {
    const nutr = JSON.stringify({ calories: h.cal, protein: h.pro, carbs: h.carb, fat: h.fat, fiber: h.fib })
    const ings = [
      { item: h.name + " base mix", quantity: "1 serving", costcoPrice: +(h.cost * 1.15).toFixed(2), wincoPrice: +(h.cost * 1.3).toFixed(2) },
      { item: "Seasonings & herbs", quantity: "to taste", costcoPrice: 0.3, wincoPrice: 0.4 },
      { item: "Garnish & plating", quantity: "1 portion", costcoPrice: 0.2, wincoPrice: 0.25 },
      { item: "Oil & butter", quantity: "1 tbsp", costcoPrice: 0.15, wincoPrice: 0.2 },
    ]
    const pricing = {
      costco: { costPerServing: +(h.cost * 1.15).toFixed(2), totalFor150: +((h.cost * 1.15) * 150).toFixed(0) },
      winco: { costPerServing: +(h.cost * 1.3).toFixed(2), totalFor150: +((h.cost * 1.3) * 150).toFixed(0) },
      blended: { costPerServing: h.cost, totalFor150: +(h.cost * 150).toFixed(0) },
      savingsPerServing: +((h.cost * 1.3) - (h.cost * 1.15)).toFixed(2),
      savingsPercent: +((((h.cost * 1.3) - (h.cost * 1.15)) / (h.cost * 1.3)) * 100).toFixed(1),
      menuPrice: h.price,
      profitMargin: +(((h.price - h.cost) / h.price) * 100).toFixed(1),
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    const { error } = await supabase.from("menu_items").insert({
      category: "hors-doeuvres",
      section: "hors-doeuvres",
      name: h.name,
      description: h.desc,
      suggested_menu_price: h.price,
      cost_per_serving: h.cost,
      portion_weight_g: h.weight,
      nutrition: nutr,
      is_signature: h.sig,
      is_available: true,
      difficulty: h.diff,
      prep_time: h.prep,
      allergens: h.allergens,
      season_tags: h.season[0] === "all" ? ["spring","summer","fall","winter"] : h.season,
      ingredient_list: ings,
      ingredient_links: pricing,
      sort_order: 1,
      base_portion_size: "regular",
      has_small_portion: true,
      has_large_portion: true,
    })
    if (error) console.log("Insert error:", h.name, error.message)
    else inserted++
  }
  console.log("Inserted", inserted, "hors d'oeuvres")
}
run()