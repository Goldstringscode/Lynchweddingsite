/**
 * Seed 100 Vegan Fine-Dining Entrees
 * Inserts high-end vegan main courses suitable for weddings
 * into the menu_items table with section='vegan'
 */
const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(
  process.env.SUPABASE_URL || "https://asnkchxmqanvdljzgshv.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "[REDACTED]"
)

// Helper: build ingredient list with pricing
function ings(cost) {
  return [
    { item: "Base preparation", quantity: "1 serving", costcoPrice: +(cost * 1.1).toFixed(2), wincoPrice: +(cost * 1.25).toFixed(2), samsClubPrice: +(cost * 1.05).toFixed(2) },
    { item: "Seasonings & aromatics", quantity: "to taste", costcoPrice: 0.35, wincoPrice: 0.45, samsClubPrice: 0.3 },
    { item: "Herbs & garnish", quantity: "1 portion", costcoPrice: 0.4, wincoPrice: 0.5, samsClubPrice: 0.35 },
    { item: "Cooking oil & finishing", quantity: "1 tbsp", costcoPrice: 0.2, wincoPrice: 0.25, samsClubPrice: 0.18 },
  ]
}

// Helper: build ingredient_links
function links(cost, price) {
  return {
    costco: { costPerServing: +(cost * 1.1).toFixed(2), totalFor150: +((cost * 1.1) * 150).toFixed(0) },
    winco: { costPerServing: +(cost * 1.25).toFixed(2), totalFor150: +((cost * 1.25) * 150).toFixed(0) },
    sams: { costPerServing: +(cost * 1.05).toFixed(2), totalFor150: +((cost * 1.05) * 150).toFixed(0) },
    blended: { costPerServing: cost, totalFor150: +(cost * 150).toFixed(0) },
    savingsPerServing: +((cost * 1.25) - (cost * 1.05)).toFixed(2),
    savingsPercent: +((((cost * 1.25) - (cost * 1.05)) / (cost * 1.25)) * 100).toFixed(1),
    menuPrice: price,
    profitMargin: +(((price - cost) / price) * 100).toFixed(1),
    lastUpdated: new Date().toISOString().split("T")[0],
  }
}

const veganItems = [
  // ===== SEITAN-BASED (hearty meat replacements) =====
  { name: "Vegan Wellington", desc: "Seitan loin wrapped in mushroom duxelles and flaky puff pastry with red wine jus", price: 28, cost: 6.5, weight: 220, cal: 420, pro: 32, carb: 38, fat: 18, fib: 6, diff: "hard", prep: 60, allergens: ["gluten","soy"], season: ["fall","winter"], sig: true, protein: "seitan" },
  { name: "Herb-Crusted Seitan Roast", desc: "Whole seitan roast with rosemary-thyme crust, roasted vegetables, and pan gravy", price: 26, cost: 5.8, weight: 240, cal: 380, pro: 34, carb: 28, fat: 14, fib: 5, diff: "hard", prep: 55, allergens: ["gluten","soy"], season: ["fall","winter"], sig: true, protein: "seitan" },
  { name: "Seitan Bourguignon", desc: "Braised seitan in full-bodied red wine with pearl onions, mushrooms, and carrots", price: 24, cost: 5.5, weight: 280, cal: 360, pro: 28, carb: 30, fat: 12, fib: 6, diff: "medium", prep: 50, allergens: ["gluten","soy"], season: ["fall","winter"], sig: false, protein: "seitan" },
  { name: "Seitan Scallopini with Lemon Caper Sauce", desc: "Pan-seared seitan cutlets in white wine lemon caper sauce with parsley potatoes", price: 22, cost: 5, weight: 200, cal: 320, pro: 30, carb: 22, fat: 14, fib: 4, diff: "medium", prep: 35, allergens: ["gluten","soy"], season: ["spring","summer"], sig: false, protein: "seitan" },
  { name: "BBQ Jackfruit & Seitan Platter", desc: "Smoked jackfruit and seitan tossed in house BBQ with grilled corn and coleslaw", price: 22, cost: 5, weight: 260, cal: 340, pro: 22, carb: 42, fat: 10, fib: 8, diff: "medium", prep: 40, allergens: ["gluten","soy"], season: ["summer","fall"], sig: false, protein: "jackfruit,seitan" },
  { name: "Seitan Stroganoff", desc: "Sliced seitan in creamy mushroom stroganoff sauce over pappardelle pasta", price: 24, cost: 5.5, weight: 300, cal: 440, pro: 28, carb: 42, fat: 16, fib: 5, diff: "medium", prep: 40, allergens: ["gluten","soy"], season: ["fall","winter"], sig: false, protein: "seitan" },
  { name: "Korean BBQ Seitan Bowl", desc: "Gochujang-glazed seitan with pickled vegetables, kimchi rice, and sesame", price: 22, cost: 5.2, weight: 260, cal: 380, pro: 26, carb: 40, fat: 12, fib: 5, diff: "medium", prep: 40, allergens: ["gluten","soy","sesame"], season: ["all"], sig: false, protein: "seitan" },
  { name: "Seitan Osso Buco", desc: "Braised seitan shank in tomato-wine broth with gremolata and saffron risotto", price: 28, cost: 6.2, weight: 280, cal: 420, pro: 30, carb: 36, fat: 16, fib: 6, diff: "hard", prep: 65, allergens: ["gluten","soy"], season: ["fall","winter"], sig: true, protein: "seitan" },
  { name: "Seitan Marsala", desc: "Pan-seared seitan medallions in sweet marsala wine sauce with wild mushrooms", price: 24, cost: 5.5, weight: 210, cal: 340, pro: 28, carb: 24, fat: 14, fib: 4, diff: "medium", prep: 35, allergens: ["gluten","soy"], season: ["all"], sig: false, protein: "seitan" },
  { name: "Seitan & Waffles", desc: "Crispy fried seitan on herb waffles with maple-truffle drizzle", price: 20, cost: 4.8, weight: 240, cal: 420, pro: 24, carb: 44, fat: 18, fib: 4, diff: "medium", prep: 35, allergens: ["gluten","soy"], season: ["spring","summer"], sig: false, protein: "seitan" },

  // ===== TOFU-BASED (silken, extra-firm, pressed) =====
  { name: "Tofu Piccata", desc: "Crispy pan-seared tofu cutlets in lemony caper-butter sauce with capers and parsley", price: 20, cost: 4.5, weight: 200, cal: 280, pro: 22, carb: 16, fat: 16, fib: 3, diff: "medium", prep: 30, allergens: ["soy","gluten"], season: ["spring","summer"], sig: false, protein: "tofu" },
  { name: "Miso-Glazed Tofu Steak", desc: "Thick sliced tofu steaks glazed with white miso-mirin glaze, bok choy, sesame", price: 22, cost: 5, weight: 210, cal: 300, pro: 24, carb: 22, fat: 14, fib: 4, diff: "medium", prep: 35, allergens: ["soy","sesame"], season: ["all"], sig: true, protein: "tofu" },
  { name: "Sichuan Mapo Tofu", desc: "Silken tofu in spicy Sichuan peppercorn-chili sauce with scallions and rice", price: 18, cost: 4, weight: 280, cal: 320, pro: 20, carb: 28, fat: 16, fib: 4, diff: "medium", prep: 25, allergens: ["soy"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Tofu Satay Skewers", desc: "Grilled lemongrass-coconut tofu skewers with spicy peanut sauce and pickled cucumbers", price: 18, cost: 4.2, weight: 180, cal: 300, pro: 20, carb: 18, fat: 16, fib: 3, diff: "easy", prep: 30, allergens: ["soy","peanuts"], season: ["spring","summer"], sig: false, protein: "tofu" },
  { name: "Crispy Tofu Banh Mi Bowl", desc: "Crispy five-spice tofu with pickled daikon, jalapeño, cilantro, and sriracha aioli", price: 20, cost: 4.5, weight: 260, cal: 360, pro: 22, carb: 34, fat: 16, fib: 5, diff: "easy", prep: 25, allergens: ["soy","gluten"], season: ["all"], sig: false, protein: "tofu" },
  { name: "General Tso Style Tofu", desc: "Crispy battered tofu in tangy-sweet chili glaze with steamed broccoli and jasmine rice", price: 20, cost: 4.5, weight: 260, cal: 380, pro: 22, carb: 40, fat: 14, fib: 4, diff: "medium", prep: 30, allergens: ["soy","gluten"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Tofu Katsu Curry", desc: "Panko-crusted tofu cutlet with Japanese curry, rice, and pickled ginger", price: 22, cost: 5, weight: 280, cal: 420, pro: 24, carb: 44, fat: 16, fib: 4, diff: "medium", prep: 35, allergens: ["soy","gluten"], season: ["fall","winter"], sig: false, protein: "tofu" },
  { name: "Smoked Tofu & Kale Salad", desc: "Warm smoked tofu with massaged kale, roasted squash, pomegranate, and tahini", price: 20, cost: 4.5, weight: 240, cal: 320, pro: 22, carb: 24, fat: 18, fib: 6, diff: "easy", prep: 20, allergens: ["soy","sesame"], season: ["fall","winter"], sig: false, protein: "tofu" },
  { name: "Teriyaki Glazed Tofu Bowl", desc: "Grilled teriyaki tofu with steamed edamame, avocado, and sushi rice", price: 20, cost: 4.5, weight: 260, cal: 360, pro: 24, carb: 38, fat: 14, fib: 5, diff: "easy", prep: 25, allergens: ["soy","sesame"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Crispy Tofu & Vegetable Stir-Fry", desc: "Wok-seared crispy tofu with seasonal vegetables in garlic-ginger sauce", price: 18, cost: 4, weight: 260, cal: 300, pro: 20, carb: 24, fat: 14, fib: 5, diff: "easy", prep: 20, allergens: ["soy"], season: ["all"], sig: false, protein: "tofu" },

  // ===== TEMPEH-BASED (nutty, firm, high protein) =====
  { name: "Tempeh Bourguignon", desc: "Braised tempeh in red wine with pearl onions, mushrooms, and root vegetables", price: 22, cost: 5, weight: 280, cal: 340, pro: 24, carb: 28, fat: 14, fib: 8, diff: "medium", prep: 50, allergens: ["soy"], season: ["fall","winter"], sig: false, protein: "tempeh" },
  { name: "Miso-Tahini Glazed Tempeh", desc: "Pan-seared tempeh with miso-tahini glaze, roasted sweet potatoes, and kale", price: 22, cost: 5, weight: 240, cal: 360, pro: 24, carb: 28, fat: 18, fib: 7, diff: "easy", prep: 30, allergens: ["soy","sesame"], season: ["all"], sig: false, protein: "tempeh" },
  { name: "Tempeh Roulade with Wild Mushrooms", desc: "Stuffed tempeh roulade with wild mushroom duxelles and truffle cream sauce", price: 26, cost: 6, weight: 220, cal: 340, pro: 26, carb: 22, fat: 18, fib: 6, diff: "hard", prep: 55, allergens: ["soy"], season: ["fall","winter"], sig: true, protein: "tempeh" },
  { name: "Indonesian-Inspired Tempeh Rendang", desc: "Slow-cooked tempeh in spiced coconut milk with lemongrass, galangal, and kaffir lime", price: 22, cost: 5, weight: 260, cal: 380, pro: 22, carb: 26, fat: 22, fib: 6, diff: "medium", prep: 50, allergens: ["soy"], season: ["all"], sig: true, protein: "tempeh" },
  { name: "Tempeh & Sweet Potato Hash", desc: "Crispy tempeh and sweet potato hash with caramelized onions and smoked paprika", price: 18, cost: 4, weight: 240, cal: 340, pro: 20, carb: 34, fat: 14, fib: 7, diff: "easy", prep: 25, allergens: ["soy"], season: ["fall","winter"], sig: false, protein: "tempeh" },
  { name: "Spicy Tempeh Lettuce Wraps", desc: "Crumbled tempeh in spicy hoisin sauce with water chestnuts, served in butter lettuce", price: 18, cost: 4.2, weight: 200, cal: 280, pro: 20, carb: 22, fat: 14, fib: 5, diff: "easy", prep: 20, allergens: ["soy"], season: ["spring","summer"], sig: false, protein: "tempeh" },
  { name: "Tempeh Tikka Masala", desc: "Tempeh in creamy tomato-cashew curry sauce with basmati rice and naan", price: 20, cost: 4.5, weight: 300, cal: 400, pro: 22, carb: 38, fat: 18, fib: 6, diff: "medium", prep: 35, allergens: ["soy","nuts"], season: ["all"], sig: false, protein: "tempeh" },

  // ===== MUSHROOM-BASED (umami-rich, elegant) =====
  { name: "Stuffed Portobello Steak", desc: "Grilled portobello caps stuffed with herbed cashew ricotta, served with balsamic glaze", price: 24, cost: 5.5, weight: 220, cal: 280, pro: 12, carb: 24, fat: 18, fib: 5, diff: "medium", prep: 35, allergens: ["nuts"], season: ["summer","fall"], sig: true, protein: "mushroom" },
  { name: "Wild Mushroom Ragout", desc: "Medley of chanterelle, oyster, and shiitake mushrooms in rich tomato-herb ragout over polenta", price: 24, cost: 5.5, weight: 260, cal: 320, pro: 10, carb: 34, fat: 16, fib: 5, diff: "medium", prep: 40, allergens: [], season: ["fall","winter"], sig: false, protein: "mushroom" },
  { name: "Mushroom Bourguignon Pie", desc: "Individual puff pastry pie with red wine-braised mushrooms and root vegetables", price: 24, cost: 5.5, weight: 240, cal: 380, pro: 10, carb: 36, fat: 22, fib: 4, diff: "hard", prep: 55, allergens: ["gluten"], season: ["fall","winter"], sig: false, protein: "mushroom" },
  { name: "Grilled Oyster Mushroom Scallops", desc: "King oyster mushroom scallops seared in garlic butter with lemon beurre blanc", price: 26, cost: 6, weight: 180, cal: 220, pro: 8, carb: 16, fat: 16, fib: 3, diff: "medium", prep: 25, allergens: [], season: ["spring","summer"], sig: true, protein: "mushroom" },
  { name: "Mushroom & Truffle Wellington", desc: "Wild mushroom duxelles wrapped in puff pastry with black truffle and cognac sauce", price: 30, cost: 7, weight: 230, cal: 400, pro: 10, carb: 34, fat: 26, fib: 4, diff: "hard", prep: 60, allergens: ["gluten"], season: ["fall","winter"], sig: true, protein: "mushroom" },
  { name: "Crispy Maitake Steak", desc: "Pan-seared maitake mushroom steak with soy-maple glaze and roasted shallots", price: 24, cost: 5.8, weight: 180, cal: 240, pro: 8, carb: 20, fat: 16, fib: 4, diff: "medium", prep: 25, allergens: ["soy"], season: ["fall"], sig: true, protein: "mushroom" },
  { name: "Stuffed Cabbage Rolls with Mushrooms", desc: "Cabbage leaves stuffed with wild mushroom and lentil filling in tomato paprika sauce", price: 20, cost: 4.5, weight: 260, cal: 300, pro: 12, carb: 34, fat: 12, fib: 7, diff: "medium", prep: 50, allergens: [], season: ["fall","winter"], sig: false, protein: "mushroom,lentils" },
  { name: "Lobster Mushroom Bisque", desc: "Creamy lobster mushroom bisque with truffle oil and chive crème fraîche", price: 18, cost: 4, weight: 240, cal: 280, pro: 6, carb: 20, fat: 20, fib: 2, diff: "medium", prep: 40, allergens: ["nuts"], season: ["fall"], sig: false, protein: "mushroom" },

  // ===== LENTIL-BASED (hearty, protein-rich) =====
  { name: "Lentil & Walnut Bolognese", desc: "Slow-simmered lentil-walnut bolognese over pappardelle with cashew parmesan", price: 20, cost: 4.5, weight: 300, cal: 420, pro: 20, carb: 44, fat: 18, fib: 10, diff: "medium", prep: 45, allergens: ["nuts","gluten"], season: ["all"], sig: false, protein: "lentils" },
  { name: "Lentil Shepherd's Pie", desc: "French green lentil and vegetable ragu topped with garlic mashed potatoes, baked golden", price: 22, cost: 5, weight: 280, cal: 380, pro: 18, carb: 40, fat: 14, fib: 9, diff: "medium", prep: 50, allergens: [], season: ["fall","winter"], sig: false, protein: "lentils" },
  { name: "Lentil Stuffed Eggplant", desc: "Roasted eggplant half stuffed with spiced lentil and pine nut filling, tomato sauce", price: 22, cost: 5, weight: 260, cal: 340, pro: 16, carb: 34, fat: 16, fib: 10, diff: "medium", prep: 45, allergens: ["nuts"], season: ["summer","fall"], sig: false, protein: "lentils" },
  { name: "Coconut Lentil Curry", desc: "Red lentils simmered in coconut milk with curry leaves, mustard seeds, and basmati rice", price: 18, cost: 4, weight: 300, cal: 380, pro: 16, carb: 42, fat: 16, fib: 8, diff: "easy", prep: 30, allergens: [], season: ["all"], sig: false, protein: "lentils" },
  { name: "Lentil & Mushroom Meatballs", desc: "Herbed lentil-mushroom meatballs in marinara over spaghetti squash or pasta", price: 20, cost: 4.5, weight: 260, cal: 340, pro: 18, carb: 38, fat: 12, fib: 8, diff: "medium", prep: 40, allergens: ["gluten"], season: ["all"], sig: false, protein: "lentils,mushroom" },

  // ===== CHICKPEA-BASED (versatile, satisfying) =====
  { name: "Chickpea & Spinach Tagine", desc: "Moroccan-spiced chickpea tagine with preserved lemon, olives, and couscous", price: 20, cost: 4, weight: 280, cal: 360, pro: 16, carb: 44, fat: 12, fib: 9, diff: "medium", prep: 40, allergens: ["gluten"], season: ["all"], sig: false, protein: "chickpeas" },
  { name: "Chickpea Chana Masala", desc: "Classic Punjabi chana masala with ginger, garlic, and aromatic spices over basmati rice", price: 18, cost: 3.8, weight: 280, cal: 340, pro: 14, carb: 46, fat: 10, fib: 10, diff: "easy", prep: 35, allergens: [], season: ["all"], sig: false, protein: "chickpeas" },
  { name: "Crispy Chickpea & Avocado Bowl", desc: "Spiced crispy chickpeas with avocado, pickled onions, and tahini dressing", price: 18, cost: 4, weight: 240, cal: 360, pro: 14, carb: 34, fat: 20, fib: 9, diff: "easy", prep: 20, allergens: ["sesame"], season: ["spring","summer"], sig: false, protein: "chickpeas" },
  { name: "Chickpea & Sweet Potato Stew", desc: "Hearty stew with chickpeas, sweet potatoes, and kale in coconut-tomato broth", price: 18, cost: 4, weight: 300, cal: 340, pro: 14, carb: 42, fat: 12, fib: 10, diff: "easy", prep: 35, allergens: [], season: ["fall","winter"], sig: false, protein: "chickpeas" },
  { name: "Falafel Platter", desc: "Crispy baked falafel with warm pita, Israeli salad, hummus, and tahini sauce", price: 18, cost: 4, weight: 260, cal: 380, pro: 16, carb: 44, fat: 16, fib: 8, diff: "medium", prep: 35, allergens: ["gluten","sesame"], season: ["all"], sig: false, protein: "chickpeas" },
  { name: "Socca with Ratatouille", desc: "Chickpea flour socca topped with Provençal ratatouille and basil oil", price: 20, cost: 4.5, weight: 240, cal: 320, pro: 12, carb: 34, fat: 16, fib: 6, diff: "medium", prep: 35, allergens: [], season: ["summer","fall"], sig: false, protein: "chickpeas" },
  { name: "Chickpea & Artichoke Cassoulet", desc: "White bean-chickpea cassoulet with artichoke hearts and herb breadcrumb crust", price: 22, cost: 5, weight: 280, cal: 360, pro: 16, carb: 40, fat: 14, fib: 9, diff: "medium", prep: 50, allergens: ["gluten"], season: ["fall","winter"], sig: true, protein: "chickpeas" },

  // ===== JACKFRUIT-BASED (meaty texture) =====
  { name: "Jackfruit Carnitas Bowl", desc: "Shredded jackfruit carnitas with black beans, cilantro lime rice, and avocado crema", price: 20, cost: 4.5, weight: 280, cal: 360, pro: 12, carb: 48, fat: 12, fib: 8, diff: "easy", prep: 30, allergens: [], season: ["spring","summer"], sig: false, protein: "jackfruit" },
  { name: "Jackfruit & Black Bean Enchiladas", desc: "Jackfruit-black bean enchiladas with mole sauce and cashew crema", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 14, carb: 44, fat: 16, fib: 9, diff: "medium", prep: 40, allergens: ["nuts"], season: ["all"], sig: false, protein: "jackfruit" },
  { name: "BBQ Jackfruit Sliders", desc: "Smoky BBQ jackfruit on toasted brioche buns with pickled slaw", price: 18, cost: 4, weight: 200, cal: 340, pro: 10, carb: 46, fat: 12, fib: 5, diff: "easy", prep: 25, allergens: ["gluten"], season: ["summer"], sig: false, protein: "jackfruit" },
  { name: "Jackfruit Tacos", desc: "Spiced jackfruit in corn tortillas with pickled red onion, cilantro, and lime crema", price: 18, cost: 4, weight: 220, cal: 300, pro: 10, carb: 40, fat: 10, fib: 6, diff: "easy", prep: 20, allergens: [], season: ["spring","summer"], sig: false, protein: "jackfruit" },
  { name: "Jamaican Jackfruit Curry", desc: "Young jackfruit in Jamaican curry with coconut rice and plantains", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 10, carb: 48, fat: 16, fib: 7, diff: "medium", prep: 35, allergens: [], season: ["all"], sig: false, protein: "jackfruit" },

  // ===== VEGETABLE-BASED COMPOSED ENTREES =====
  { name: "Stuffed Acorn Squash", desc: "Roasted acorn squash stuffed with quinoa, cranberries, pecans, and sage", price: 22, cost: 5, weight: 260, cal: 340, pro: 10, carb: 42, fat: 16, fib: 8, diff: "medium", prep: 45, allergens: ["nuts"], season: ["fall","winter"], sig: false, protein: "vegetable" },
  { name: "Cauliflower Steak Béarnaise", desc: "Thick roasted cauliflower steak with classic béarnaise sauce and roasted fingerlings", price: 24, cost: 5.5, weight: 240, cal: 320, pro: 12, carb: 26, fat: 20, fib: 6, diff: "medium", prep: 35, allergens: [], season: ["all"], sig: true, protein: "vegetable" },
  { name: "Eggplant Rollatini", desc: "Thinly sliced eggplant rolled with cashew ricotta in marinara, baked with breadcrumbs", price: 20, cost: 4.5, weight: 240, cal: 320, pro: 12, carb: 28, fat: 18, fib: 6, diff: "medium", prep: 40, allergens: ["nuts","gluten"], season: ["summer","fall"], sig: false, protein: "vegetable" },
  { name: "Roasted Vegetable Napoleon", desc: "Layered roasted vegetables with basil pesto and balsamic reduction tower", price: 24, cost: 5.5, weight: 220, cal: 280, pro: 8, carb: 28, fat: 16, fib: 5, diff: "hard", prep: 45, allergens: ["nuts"], season: ["summer","fall"], sig: true, protein: "vegetable" },
  { name: "Butternut Squash Risotto", desc: "Creamy arborio risotto with roasted butternut squash, sage, and truffle oil", price: 22, cost: 5, weight: 260, cal: 380, pro: 8, carb: 48, fat: 16, fib: 4, diff: "medium", prep: 40, allergens: [], season: ["fall","winter"], sig: false, protein: "vegetable" },
  { name: "Truffled Cauliflower & Potato Gratin", desc: "Layered potatoes and cauliflower in creamy truffle béchamel with golden crust", price: 20, cost: 4.5, weight: 240, cal: 340, pro: 10, carb: 32, fat: 20, fib: 4, diff: "medium", prep: 45, allergens: ["nuts"], season: ["fall","winter"], sig: false, protein: "vegetable" },
  { name: "Artichoke & Spinach Stuffed Pasta Shells", desc: "Jumbo shells stuffed with artichoke-spinach cashew ricotta in pink sauce", price: 22, cost: 5, weight: 280, cal: 380, pro: 14, carb: 40, fat: 18, fib: 6, diff: "medium", prep: 45, allergens: ["gluten","nuts"], season: ["all"], sig: false, protein: "vegetable" },
  { name: "Eggplant Parmesan", desc: "Crispy breaded eggplant layered with marinara and cashew mozzarella, baked golden", price: 20, cost: 4.5, weight: 260, cal: 360, pro: 14, carb: 34, fat: 18, fib: 5, diff: "medium", prep: 40, allergens: ["gluten","nuts"], season: ["summer","fall"], sig: false, protein: "vegetable" },
  { name: "Stuffed Bell Peppers", desc: "Roasted bell peppers stuffed with herbed rice, lentils, and pine nuts", price: 20, cost: 4.5, weight: 260, cal: 340, pro: 14, carb: 40, fat: 14, fib: 7, diff: "medium", prep: 40, allergens: ["nuts"], season: ["summer","fall"], sig: false, protein: "vegetable,lentils" },
  { name: "Roasted Cauliflower Shawarma Bowl", desc: "Spiced roasted cauliflower with tahini, pickled turnips, and warm pita", price: 18, cost: 4, weight: 240, cal: 320, pro: 10, carb: 36, fat: 16, fib: 6, diff: "easy", prep: 30, allergens: ["gluten","sesame"], season: ["all"], sig: false, protein: "vegetable" },

  // ===== GLOBAL INSPIRED VEGAN ENTREES =====
  { name: "Thai Green Curry with Tofu", desc: "Aromatic green curry with crispy tofu, Thai eggplant, and jasmine rice", price: 20, cost: 4.5, weight: 280, cal: 360, pro: 18, carb: 36, fat: 16, fib: 5, diff: "medium", prep: 35, allergens: ["soy"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Massaman Curry with Sweet Potato", desc: "Rich Massaman curry with sweet potato, chickpeas, and peanuts over rice", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 14, carb: 42, fat: 18, fib: 7, diff: "medium", prep: 40, allergens: ["peanuts"], season: ["fall","winter"], sig: false, protein: "chickpeas" },
  { name: "Spicy Peanut Noodle Bowl", desc: "Rice noodles in spicy peanut sauce with edamame, shredded carrots, and scallions", price: 18, cost: 4, weight: 280, cal: 380, pro: 16, carb: 44, fat: 16, fib: 5, diff: "easy", prep: 20, allergens: ["peanuts","soy","sesame"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Vegetable Pad Thai", desc: "Traditional pad Thai with rice noodles, tamarind sauce, tofu, and crushed peanuts", price: 18, cost: 4, weight: 260, cal: 360, pro: 14, carb: 44, fat: 14, fib: 4, diff: "medium", prep: 25, allergens: ["soy","peanuts"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Vegan Pho", desc: "Aromatic vegetable pho with rice noodles, mushrooms, and herb platter", price: 18, cost: 4, weight: 320, cal: 280, pro: 10, carb: 44, fat: 6, fib: 4, diff: "medium", prep: 45, allergens: ["soy","gluten"], season: ["all"], sig: false, protein: "mushroom" },
  { name: "Buddha Bowl with Tahini Dressing", desc: "Quinoa, roasted sweet potato, chickpeas, avocado, and tahini-miso dressing", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 14, carb: 40, fat: 18, fib: 9, diff: "easy", prep: 25, allergens: ["soy","sesame"], season: ["all"], sig: false, protein: "chickpeas" },
  { name: "Mushroom & Spinach Lasagna", desc: "Layered lasagna with wild mushrooms, spinach, cashew béchamel, and marinara", price: 24, cost: 5.5, weight: 300, cal: 420, pro: 14, carb: 40, fat: 22, fib: 5, diff: "hard", prep: 60, allergens: ["gluten","nuts"], season: ["all"], sig: true, protein: "mushroom" },
  { name: "Truffle Mushroom Pizza", desc: "Artisan pizza with wild mushrooms, truffle oil, cashew mozzarella, and arugula", price: 22, cost: 5, weight: 260, cal: 380, pro: 14, carb: 40, fat: 18, fib: 4, diff: "medium", prep: 30, allergens: ["gluten","nuts"], season: ["all"], sig: false, protein: "mushroom" },
  { name: "Harissa-Roasted Cauliflower", desc: "Whole roasted cauliflower with harissa, chickpeas, and lemon-tahini drizzle", price: 22, cost: 5, weight: 280, cal: 320, pro: 14, carb: 32, fat: 16, fib: 8, diff: "medium", prep: 40, allergens: ["sesame"], season: ["fall","winter"], sig: true, protein: "vegetable" },
  { name: "Vegan Paella", desc: "Saffron rice with artichoke hearts, peas, roasted red peppers, and smoked paprika", price: 24, cost: 5.5, weight: 300, cal: 380, pro: 10, carb: 52, fat: 12, fib: 6, diff: "hard", prep: 50, allergens: [], season: ["spring","summer"], sig: true, protein: "vegetable" },

  // ===== ITALIAN-INSPIRED VEGAN ENTREES =====
  { name: "Vegan Osso Buco", desc: "Braised seitan shank with gremolata over saffron risotto Milanese", price: 28, cost: 6.5, weight: 280, cal: 420, pro: 28, carb: 38, fat: 16, fib: 5, diff: "hard", prep: 65, allergens: ["gluten","soy"], season: ["fall","winter"], sig: true, protein: "seitan" },
  { name: "Pappardelle with Wild Mushroom Ragu", desc: "Fresh pappardelle in slow-simmered wild mushroom ragu with truffle oil", price: 22, cost: 5, weight: 280, cal: 380, pro: 12, carb: 44, fat: 16, fib: 4, diff: "medium", prep: 40, allergens: ["gluten"], season: ["fall","winter"], sig: false, protein: "mushroom" },
  { name: "Risotto ai Funghi", desc: "Classic Italian mushroom risotto with porcini, arborio, and truffle oil", price: 22, cost: 5, weight: 260, cal: 380, pro: 8, carb: 48, fat: 16, fib: 3, diff: "medium", prep: 40, allergens: [], season: ["fall","winter"], sig: false, protein: "mushroom" },
  { name: "Gnocchi with Pesto & Cherry Tomatoes", desc: "Potato gnocchi with basil pesto, blistered cherry tomatoes, and pine nuts", price: 20, cost: 4.5, weight: 260, cal: 380, pro: 10, carb: 44, fat: 18, fib: 4, diff: "medium", prep: 30, allergens: ["gluten","nuts"], season: ["summer"], sig: false, protein: "vegetable" },
  { name: "Spaghetti alla Puttanesca", desc: "Spaghetti with tomato-olive-caper sauce, garlic, and fresh herbs", price: 18, cost: 4, weight: 280, cal: 360, pro: 10, carb: 48, fat: 12, fib: 5, diff: "easy", prep: 25, allergens: ["gluten"], season: ["all"], sig: false, protein: "vegetable" },
  { name: "Polenta with Mushroom Ragu", desc: "Creamy polenta topped with slow-braised mushroom and tomato ragu", price: 20, cost: 4.5, weight: 280, cal: 340, pro: 10, carb: 40, fat: 14, fib: 4, diff: "medium", prep: 40, allergens: [], season: ["fall","winter"], sig: false, protein: "mushroom" },
  { name: "Vegan Carbonara", desc: "Silken tofu carbonara with smoked tempeh, peas, and black pepper over spaghetti", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 22, carb: 40, fat: 14, fib: 4, diff: "medium", prep: 25, allergens: ["soy","gluten"], season: ["all"], sig: false, protein: "tofu,tempeh" },

  // ===== ASIAN-INSPIRED VEGAN ENTREES =====
  { name: "Vegetable Lo Mein", desc: "Wok-fried egg noodles with seasonal vegetables in garlic-soy sauce", price: 16, cost: 3.5, weight: 280, cal: 340, pro: 10, carb: 48, fat: 10, fib: 4, diff: "easy", prep: 20, allergens: ["gluten","soy","sesame"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Thai Basil Eggplant", desc: "Wok-seared eggplant in spicy Thai basil sauce with crispy tofu and jasmine rice", price: 20, cost: 4.5, weight: 260, cal: 320, pro: 16, carb: 34, fat: 14, fib: 6, diff: "medium", prep: 25, allergens: ["soy"], season: ["summer"], sig: false, protein: "tofu" },
  { name: "Korean Bibimbap Bowl", desc: "Rice bowl with sautéed vegetables, gochujang, tofu, and sesame", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 18, carb: 46, fat: 14, fib: 5, diff: "medium", prep: 35, allergens: ["soy","sesame"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Japanese Curry with Tofu Katsu", desc: "Panko-crusted tofu cutlet with mild Japanese curry and pickled ginger", price: 22, cost: 5, weight: 280, cal: 420, pro: 22, carb: 46, fat: 16, fib: 4, diff: "medium", prep: 35, allergens: ["soy","gluten"], season: ["fall","winter"], sig: false, protein: "tofu" },
  { name: "Vegan Tom Kha Soup", desc: "Creamy coconut soup with mushrooms, lemongrass, galangal, and chili oil", price: 16, cost: 3.5, weight: 300, cal: 280, pro: 8, carb: 22, fat: 20, fib: 3, diff: "easy", prep: 25, allergens: ["soy"], season: ["all"], sig: false, protein: "mushroom" },
  { name: "Sushi Bowl with Spicy Tofu", desc: "Sushi rice with spicy tofu, avocado, cucumber, edamame, and sriracha mayo", price: 22, cost: 5, weight: 280, cal: 380, pro: 18, carb: 44, fat: 16, fib: 5, diff: "easy", prep: 25, allergens: ["soy","sesame"], season: ["spring","summer"], sig: false, protein: "tofu" },
  { name: "Veggie Dumplings Bowl", desc: "House-made vegetable dumplings with ginger-soy dipping sauce and sesame rice", price: 20, cost: 4.5, weight: 260, cal: 340, pro: 14, carb: 42, fat: 12, fib: 4, diff: "hard", prep: 50, allergens: ["soy","gluten","sesame"], season: ["all"], sig: false, protein: "tofu" },

  // ===== MIDDLE EASTERN / MEDITERRANEAN =====
  { name: "Vegan Moussaka", desc: "Layered eggplant, potato, and lentil ragu topped with creamy béchamel", price: 22, cost: 5, weight: 280, cal: 360, pro: 16, carb: 36, fat: 16, fib: 8, diff: "hard", prep: 60, allergens: ["nuts"], season: ["fall","winter"], sig: true, protein: "lentils" },
  { name: "Stuffed Grape Leaves", desc: "Grape leaves stuffed with herbed rice, pine nuts, and currants, served with avgolemono", price: 20, cost: 4.5, weight: 240, cal: 300, pro: 8, carb: 38, fat: 14, fib: 5, diff: "hard", prep: 55, allergens: ["nuts"], season: ["spring","summer"], sig: false, protein: "vegetable" },
  { name: "Shakshuka with Tofu Feta", desc: "Baked eggs-style shakshuka with tofu feta, crusty bread, and harissa", price: 18, cost: 4, weight: 280, cal: 320, pro: 16, carb: 32, fat: 16, fib: 5, diff: "easy", prep: 25, allergens: ["soy","gluten"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Vegan Kebab Plate", desc: "Spiced seitan kebabs with grilled vegetables, saffron rice, and tzatziki", price: 22, cost: 5, weight: 280, cal: 380, pro: 24, carb: 36, fat: 14, fib: 5, diff: "medium", prep: 40, allergens: ["gluten","soy"], season: ["spring","summer"], sig: false, protein: "seitan" },
  { name: "Falafel & Hummus Bowl", desc: "Crispy baked falafel with hummus, roasted vegetables, pickles, and warm pita", price: 18, cost: 4, weight: 260, cal: 360, pro: 16, carb: 42, fat: 14, fib: 8, diff: "easy", prep: 30, allergens: ["gluten","sesame"], season: ["all"], sig: false, protein: "chickpeas" },

  // ===== INDIAN-INSPIRED =====
  { name: "Chickpea & Spinach Saag", desc: "Creamy spinach and chickpea curry with ginger, garlic, and garam masala", price: 18, cost: 4, weight: 280, cal: 320, pro: 14, carb: 34, fat: 14, fib: 8, diff: "easy", prep: 30, allergens: [], season: ["all"], sig: false, protein: "chickpeas" },
  { name: "Baingan Bharta", desc: "Fire-roasted mashed eggplant with peas, tomatoes, and toasted cumin", price: 18, cost: 4, weight: 260, cal: 280, pro: 8, carb: 30, fat: 14, fib: 7, diff: "easy", prep: 35, allergens: [], season: ["summer","fall"], sig: false, protein: "vegetable" },
  { name: "Dal Makhani", desc: "Slow-cooked black lentils in creamy tomato sauce with garlic naan", price: 18, cost: 4, weight: 280, cal: 340, pro: 16, carb: 40, fat: 12, fib: 9, diff: "medium", prep: 50, allergens: ["gluten"], season: ["all"], sig: false, protein: "lentils" },
  { name: "Vegetable Biryani", desc: "Layered basmati rice with vegetables, saffron, and crispy onions", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 10, carb: 56, fat: 12, fib: 5, diff: "hard", prep: 55, allergens: [], season: ["all"], sig: false, protein: "vegetable" },
  { name: "Palak Tofu", desc: "Cubed tofu in creamy spinach sauce with ginger, garlic, and garam masala", price: 18, cost: 4, weight: 260, cal: 300, pro: 20, carb: 18, fat: 16, fib: 5, diff: "easy", prep: 25, allergens: ["soy"], season: ["all"], sig: false, protein: "tofu" },
  { name: "Vegan Butter Chickpeas", desc: "Creamy tomato-cashew curry with chickpeas, fenugreek, and basmati rice", price: 20, cost: 4.5, weight: 280, cal: 380, pro: 16, carb: 40, fat: 18, fib: 7, diff: "medium", prep: 35, allergens: ["nuts"], season: ["all"], sig: true, protein: "chickpeas" },
  { name: "Aloo Gobi & Dal Bowl", desc: "Roasted cauliflower-potato curry with yellow dal and basmati rice", price: 16, cost: 3.5, weight: 280, cal: 320, pro: 12, carb: 44, fat: 10, fib: 8, diff: "easy", prep: 30, allergens: [], season: ["all"], sig: false, protein: "lentils" },

  // ===== LATIN-INSPIRED =====
  { name: "Vegan Arepas with Black Beans", desc: "Corn arepas filled with garlic black beans, plantains, and avocado", price: 18, cost: 4, weight: 260, cal: 380, pro: 14, carb: 48, fat: 14, fib: 9, diff: "medium", prep: 35, allergens: [], season: ["all"], sig: false, protein: "beans" },
  { name: "Mushroom & Black Bean Tacos", desc: "Sautéed mushrooms and black beans in corn tortillas with salsa verde", price: 16, cost: 3.5, weight: 220, cal: 280, pro: 12, carb: 34, fat: 10, fib: 7, diff: "easy", prep: 20, allergens: [], season: ["all"], sig: false, protein: "mushroom,beans" },
  { name: "Vegan Enchiladas Suizas", desc: "Corn tortillas filled with sweet potato-black bean mixture in tomatillo sauce", price: 18, cost: 4, weight: 280, cal: 340, pro: 12, carb: 44, fat: 12, fib: 8, diff: "medium", prep: 40, allergens: ["nuts"], season: ["all"], sig: false, protein: "beans" },
  { name: "Black Bean & Quinoa Stuffed Poblano", desc: "Roasted poblano pepper stuffed with black bean-quinoa mixture, cashew crema", price: 20, cost: 4.5, weight: 240, cal: 320, pro: 14, carb: 38, fat: 12, fib: 9, diff: "medium", prep: 40, allergens: ["nuts"], season: ["summer","fall"], sig: false, protein: "beans" },
  { name: "Vegan Tamale Plate", desc: "Steamed masa tamales filled with roasted vegetables and mole sauce", price: 20, cost: 4.5, weight: 260, cal: 360, pro: 10, carb: 44, fat: 16, fib: 5, diff: "hard", prep: 60, allergens: [], season: ["fall","winter"], sig: true, protein: "vegetable" },
]

async function main() {
  console.log(`=== Seeding ${veganItems.length} Vegan Entrees ===\n`)

  // Fetch existing to check duplicates
  const { data: existing } = await supabase.from('menu_items').select('id, name')
  const existingNames = new Set((existing || []).map(i => i.name.toLowerCase().replace(/[^a-z0-9]/g, '')))

  let inserted = 0
  let skipped = 0

  for (const h of veganItems) {
    const nameKey = h.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (existingNames.has(nameKey)) {
      console.log(`  ⏭️  ${h.name} — already exists`)
      skipped++
      continue
    }

    const nutr = JSON.stringify({
      calories: h.cal,
      protein: h.pro,
      carbs: h.carb,
      fat: h.fat,
      fiber: h.fib,
    })

    const { error } = await supabase.from('menu_items').insert({
      category: 'vegan',
      section: 'vegan',
      name: h.name,
      description: h.desc,
      suggested_menu_price: h.price,
      cost_per_serving: h.cost,
      portion_weight_g: h.weight,
      nutrition: nutr,
      is_signature: h.sig || false,
      is_available: true,
      difficulty: h.diff || 'medium',
      prep_time: h.prep || 30,
      allergens: h.allergens || [],
      season_tags: h.season || ['all'],
      ingredient_list: JSON.stringify(ings(h.cost)),
      ingredient_links: JSON.stringify(links(h.cost, h.price)),
      sort_order: 1,
      base_portion_size: 'regular',
      has_small_portion: true,
      has_large_portion: true,
    })

    if (error) {
      console.log(`  ❌ ${h.name}: ${error.message}`)
      skipped++
    } else {
      inserted++
      console.log(`  ✅ ${h.name}`)
    }
  }

  console.log(`\n=== Results: ${inserted} inserted, ${skipped} skipped ===`)
}

main().catch(console.error)