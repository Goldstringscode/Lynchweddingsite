const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(
  process.env.SUPABASE_URL || "https://asnkchxmqanvdljzgshv.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "sb_secret_tM5ALPnz-OOn2ukcRQaWIQ_cH80GyHm"
)

// ====================================================================
// 20 ADDITIONAL FINE DINING ITEMS PER SECTION (100 total)
// Sourced from Michelin-starred & world-class restaurants:
// French Laundry, Per Se, Le Bernardin, Eleven Madison Park, 
// Alinea, Noma, Daniel, Jean-Georges, Masa, The Modern, etc.
// Each item is a fine dining staple — mix of expensive signatures ($24-38)
// and elegant affordable options ($12-18)
// ====================================================================

// --- 20 MORE HORS D'OEUVRES ---
const horsDOeuvres = [
  { name: "Truffle Popcorn with Parmesan", desc: "Black truffle oil, pecorino, and chive popcorn in mini cones", price: 12, cost: 3.5, weight: 40, cal: 180, pro: 6, carb: 14, fat: 12, fib: 1, sig: false, diff: "easy", prep: 10, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Lobster Corn Dogs", desc: "Tempura-battered lobster tail on skewers with sriracha aioli", price: 26, cost: 11, weight: 65, cal: 260, pro: 16, carb: 16, fat: 16, fib: 0, sig: true, diff: "medium", prep: 30, allergens: ["shellfish","gluten","eggs"], season: ["spring","summer"] },
  { name: "Foie Gras Macaron", desc: "Salted foie gras mousse in raspberry-black pepper macaron shells", price: 28, cost: 13, weight: 35, cal: 220, pro: 6, carb: 12, fat: 18, fib: 1, sig: true, diff: "hard", prep: 45, allergens: ["gluten","eggs","nuts"], season: ["winter"] },
  { name: "Osetra Caviar Puffs", desc: "Choux pastry puffs with crème fraîche and Osetra caviar", price: 38, cost: 18, weight: 30, cal: 140, pro: 6, carb: 8, fat: 10, fib: 0, sig: true, diff: "hard", prep: 40, allergens: ["fish","dairy","gluten","eggs"], season: ["winter"] },
  { name: "Hamachi Ceviche Tostadas", desc: "Yellowtail hamachi with yuzu, avocado, and crispy tostada shells", price: 18, cost: 7, weight: 55, cal: 160, pro: 12, carb: 10, fat: 8, fib: 1, sig: false, diff: "medium", prep: 20, allergens: ["fish","gluten"], season: ["spring","summer"] },
  { name: "Heirloom Tomato Tartlets", desc: "Puff pastry shells with burrata, confit cherry tomatoes, and basil oil", price: 14, cost: 4.5, weight: 55, cal: 190, pro: 8, carb: 12, fat: 14, fib: 1, sig: false, diff: "easy", prep: 20, allergens: ["dairy","gluten"], season: ["summer","fall"] },
  { name: "Duck Confit Spring Rolls", desc: "Crispy spring rolls with duck confit, hoisin, and pickled daikon", price: 16, cost: 5.5, weight: 60, cal: 240, pro: 14, carb: 18, fat: 14, fib: 1, sig: false, diff: "medium", prep: 30, allergens: ["gluten","soy","sesame"], season: ["fall","winter"] },
  { name: "Wagyu Tartare Cones", desc: "A5 wagyu tartare with quail egg and sesame tuile cones", price: 28, cost: 12, weight: 45, cal: 200, pro: 14, carb: 6, fat: 16, fib: 0, sig: true, diff: "hard", prep: 35, allergens: ["eggs","sesame","gluten"], season: ["all"] },
  { name: "Mushroom Arancini with Truffle", desc: "Crispy saffron risotto balls with porcini and black truffle aioli", price: 16, cost: 5, weight: 75, cal: 280, pro: 8, carb: 30, fat: 16, fib: 2, sig: false, diff: "medium", prep: 40, allergens: ["dairy","gluten","eggs"], season: ["fall","winter"] },
  { name: "Parmesan Custard with Caviar", desc: "Warm parmesan custard topped with trout roe and chives", price: 22, cost: 9, weight: 50, cal: 200, pro: 12, carb: 6, fat: 16, fib: 0, sig: true, diff: "hard", prep: 35, allergens: ["dairy","eggs","fish"], season: ["all"] },
  { name: "Crispy Artichoke Bottoms", desc: "Fried artichoke hearts with lemon aioli and pecorino", price: 13, cost: 3.8, weight: 60, cal: 160, pro: 5, carb: 12, fat: 12, fib: 3, sig: false, diff: "easy", prep: 20, allergens: ["dairy","eggs"], season: ["spring","fall"] },
  { name: "Smoked Trout Rillettes", desc: "House-smoked trout with cornichons, capers, and toast points", price: 15, cost: 5, weight: 55, cal: 170, pro: 14, carb: 8, fat: 12, fib: 0, sig: false, diff: "medium", prep: 25, allergens: ["fish","dairy","gluten"], season: ["all"] },
  { name: "Mini Lobster Rolls", desc: "New England-style lobster salad in mini toasted brioche rolls", price: 24, cost: 10, weight: 65, cal: 280, pro: 16, carb: 14, fat: 18, fib: 0, sig: false, diff: "medium", prep: 25, allergens: ["shellfish","dairy","gluten","eggs"], season: ["spring","summer"] },
  { name: "Sesame Tuna Poke Skewers", desc: "Sushi-grade yellowfin with sesame, serrano, and wonton crisps", price: 18, cost: 6.5, weight: 55, cal: 170, pro: 18, carb: 8, fat: 8, fib: 1, sig: false, diff: "medium", prep: 20, allergens: ["fish","sesame","gluten"], season: ["spring","summer"] },
  { name: "Frico Crisps with Fig Jam", desc: "Lacy parmesan frico wafers with fig jam and toasted walnuts", price: 12, cost: 3, weight: 35, cal: 150, pro: 8, carb: 10, fat: 10, fib: 1, sig: false, diff: "easy", prep: 15, allergens: ["dairy","nuts"], season: ["fall","winter"] },
  { name: "Chestnut Soup Shooters", desc: "Velvety chestnut soup with truffle oil in shot glasses", price: 13, cost: 4, weight: 80, cal: 200, pro: 4, carb: 22, fat: 12, fib: 3, sig: false, diff: "medium", prep: 25, allergens: ["dairy","nuts"], season: ["fall","winter"] },
  { name: "Shrimp Toast Canapés", desc: "Crispy shrimp mousse on brioche with chili-garlic glaze", price: 15, cost: 5, weight: 50, cal: 200, pro: 12, carb: 12, fat: 12, fib: 0, sig: false, diff: "medium", prep: 25, allergens: ["shellfish","gluten","eggs","soy"], season: ["all"] },
  { name: "Raclette & Cornichon Skewers", desc: "Melted raclette cheese with mini cornichons and speck", price: 14, cost: 4.2, weight: 45, cal: 180, pro: 10, carb: 4, fat: 16, fib: 0, sig: false, diff: "easy", prep: 10, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Vietnamese Summer Rolls", desc: "Rice paper rolls with shrimp, herbs, and peanut-hoisin dipping sauce", price: 13, cost: 3.8, weight: 60, cal: 130, pro: 8, carb: 14, fat: 4, fib: 2, sig: false, diff: "easy", prep: 20, allergens: ["shellfish","peanuts","soy"], season: ["spring","summer"] },
  { name: "Truffled Egg Mimosa", desc: "Deviled quail eggs with black truffle and chive on buckwheat blini", price: 16, cost: 5.5, weight: 40, cal: 160, pro: 10, carb: 8, fat: 12, fib: 0, sig: false, diff: "medium", prep: 25, allergens: ["eggs","dairy","gluten"], season: ["spring","summer","fall"] },
]

// --- 20 MORE APPETIZERS ---
const appetizers = [
  { name: "French Onion Soup Gratinée", desc: "Classic caramelized onion soup with gruyère crouton", price: 16, cost: 5, weight: 200, cal: 340, pro: 16, carb: 22, fat: 22, fib: 2, sig: false, diff: "medium", prep: 50, allergens: ["dairy","gluten"], season: ["fall","winter"] },
  { name: "Burrata with 20-Year Balsamic", desc: "Creamy burrata with aged balsamic, heirloom tomatoes, and basil", price: 18, cost: 6, weight: 140, cal: 320, pro: 14, carb: 8, fat: 26, fib: 2, sig: false, diff: "easy", prep: 10, allergens: ["dairy"], season: ["spring","summer"] },
  { name: "Hamachi Crudo", desc: "Yellowtail hamachi with yuzu, shiso, pickled ginger, and micro cilantro", price: 24, cost: 9, weight: 90, cal: 180, pro: 18, carb: 6, fat: 10, fib: 0, sig: true, diff: "medium", prep: 15, allergens: ["fish"], season: ["spring","summer"] },
  { name: "Foie Gras Torchon", desc: "Sauternes-poached foie gras torchon with brioche and fig compote", price: 34, cost: 15, weight: 80, cal: 380, pro: 10, carb: 14, fat: 34, fib: 1, sig: true, diff: "hard", prep: 60, allergens: ["gluten","dairy","eggs"], season: ["winter"] },
  { name: "Cauliflower & Truffle Velouté", desc: "Silky cauliflower soup with black truffle, chive oil, and crème fraîche", price: 16, cost: 5, weight: 180, cal: 220, pro: 6, carb: 18, fat: 16, fib: 3, sig: false, diff: "medium", prep: 30, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Warm Octopus & Potato Salad", desc: "Spanish-style grilled octopus with fingerling potatoes and pimentón aioli", price: 22, cost: 8, weight: 140, cal: 260, pro: 22, carb: 18, fat: 12, fib: 2, sig: false, diff: "medium", prep: 40, allergens: ["shellfish","eggs"], season: ["all"] },
  { name: "Tuna Tartare Tower", desc: "Diced ahi tuna with avocado, sesame, nori, and wonton crisps", price: 22, cost: 8, weight: 110, cal: 240, pro: 22, carb: 10, fat: 14, fib: 2, sig: false, diff: "medium", prep: 20, allergens: ["fish","sesame","gluten","soy"], season: ["spring","summer"] },
  { name: "Roasted Beet & Goat Cheese Terrine", desc: "Layered roasted beets with whipped goat cheese, candied pecans, and sorrel", price: 16, cost: 5, weight: 130, cal: 240, pro: 10, carb: 20, fat: 14, fib: 4, sig: false, diff: "medium", prep: 45, allergens: ["dairy","nuts"], season: ["fall","spring"] },
  { name: "Lobster Bisque", desc: "Classic lobster bisque with cognac, tarragon, and crème fraîche", price: 20, cost: 8, weight: 180, cal: 300, pro: 14, carb: 14, fat: 22, fib: 1, sig: false, diff: "hard", prep: 55, allergens: ["shellfish","dairy","gluten"], season: ["all"] },
  { name: "Crispy Calamari with Chorizo", desc: "Flash-fried calamari with Spanish chorizo, lemon, and smoked paprika aioli", price: 17, cost: 6, weight: 130, cal: 320, pro: 18, carb: 16, fat: 22, fib: 1, sig: false, diff: "easy", prep: 15, allergens: ["shellfish","gluten","eggs"], season: ["all"] },
  { name: "Chilled Pea & Mint Soup", desc: "Velvety chilled English pea soup with crème fraîche and fresh mint", price: 14, cost: 4, weight: 160, cal: 140, pro: 6, carb: 16, fat: 8, fib: 4, sig: false, diff: "easy", prep: 20, allergens: ["dairy"], season: ["spring","summer"] },
  { name: "Escargot en Croûte", desc: "Garlic-herb escargot in puff pastry with beurre blanc", price: 20, cost: 7, weight: 100, cal: 340, pro: 14, carb: 18, fat: 24, fib: 1, sig: false, diff: "hard", prep: 50, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Artichoke & Spinach Dip Gratin", desc: "Hot artichoke and spinach dip with aged gruyère and house-made crostini", price: 15, cost: 4.5, weight: 160, cal: 360, pro: 14, carb: 18, fat: 28, fib: 3, sig: false, diff: "easy", prep: 25, allergens: ["dairy","gluten"], season: ["all"] },
  { name: "Heirloom Caprese Tower", desc: "Buffalo mozzarella, heirloom tomatoes, basil gel, and 25-year balsamic", price: 17, cost: 6, weight: 130, cal: 280, pro: 14, carb: 8, fat: 22, fib: 2, sig: false, diff: "easy", prep: 15, allergens: ["dairy"], season: ["spring","summer","fall"] },
  { name: "Mushroom & Thyme Pâté en Croûte", desc: "Wild mushroom pâté wrapped in buttery pastry with Dijon and cornichons", price: 18, cost: 6, weight: 100, cal: 300, pro: 8, carb: 20, fat: 24, fib: 2, sig: false, diff: "hard", prep: 60, allergens: ["gluten","dairy","eggs"], season: ["fall","winter"] },
  { name: "Oysters Rockefeller 2.0", desc: "Baked oysters with Pernod-spinach, beurre blanc, and crispy prosciutto", price: 24, cost: 9, weight: 100, cal: 220, pro: 14, carb: 8, fat: 16, fib: 1, sig: true, diff: "hard", prep: 35, allergens: ["shellfish","dairy","gluten"], season: ["fall","winter"] },
  { name: "Fennel & Blood Orange Salad", desc: "Shaved fennel, blood orange segments, arugula, and shaved ricotta salata", price: 14, cost: 4, weight: 120, cal: 140, pro: 4, carb: 16, fat: 8, fib: 4, sig: false, diff: "easy", prep: 15, allergens: ["dairy"], season: ["winter","spring"] },
  { name: "Seared Foie Gras with Sauternes Gelée", desc: "Seared foie gras with Sauternes gelée, brioche, and micro greens", price: 36, cost: 16, weight: 70, cal: 380, pro: 8, carb: 12, fat: 34, fib: 0, sig: true, diff: "hard", prep: 30, allergens: ["gluten"], season: ["winter"] },
  { name: "Parmesan & Black Truffle Fondue", desc: "Warm parmesan fondue with black truffle and seasonal crudité", price: 18, cost: 6, weight: 120, cal: 340, pro: 18, carb: 8, fat: 28, fib: 1, sig: false, diff: "medium", prep: 20, allergens: ["dairy","eggs"], season: ["fall","winter"] },
  { name: "Smoked Salmon Carpaccio", desc: "House-cured salmon with dill crème fraîche, capers, and rye crostini", price: 19, cost: 7, weight: 100, cal: 220, pro: 18, carb: 10, fat: 14, fib: 1, sig: false, diff: "medium", prep: 20, allergens: ["fish","dairy","gluten"], season: ["all"] },
]

// --- 20 MORE PROTEINS ---
const proteins = [
  { name: "Dry-Aged Ribeye with Café de Paris", desc: "28-day dry-aged 12oz ribeye with Café de Paris butter", price: 48, cost: 20, weight: 340, cal: 720, pro: 60, carb: 2, fat: 52, fib: 0, sig: true, diff: "hard", prep: 30, allergens: ["dairy"], season: ["all"] },
  { name: "Pan-Roasted Halibut with Saffron Broth", desc: "Wild Alaskan halibut with saffron-tomato broth and fennel confit", price: 38, cost: 15, weight: 200, cal: 380, pro: 42, carb: 8, fat: 20, fib: 2, sig: false, diff: "medium", prep: 30, allergens: ["fish"], season: ["spring","summer"] },
  { name: "Herb-Crusted Rack of Lamb", desc: "New Zealand rack of lamb with pistachio-herb crust and rosemary jus", price: 46, cost: 18, weight: 240, cal: 560, pro: 48, carb: 6, fat: 38, fib: 1, sig: true, diff: "hard", prep: 35, allergens: ["nuts","dairy"], season: ["spring","fall"] },
  { name: "Butter-Poached Lobster Tail", desc: "Maine lobster tail poached in beurre monté with chive oil", price: 44, cost: 18, weight: 200, cal: 340, pro: 36, carb: 2, fat: 22, fib: 0, sig: true, diff: "hard", prep: 30, allergens: ["shellfish","dairy"], season: ["all"] },
  { name: "Duck Confit with Sour Cherry", desc: "Slow-cooked duck leg confit with tart cherry gastrique", price: 34, cost: 12, weight: 250, cal: 480, pro: 38, carb: 18, fat: 30, fib: 1, sig: false, diff: "hard", prep: 180, allergens: [], season: ["fall","winter"] },
  { name: "Seared Sea Scallops with Cauliflower Purée", desc: "U-10 diver scallops with cauliflower purée and brown butter", price: 36, cost: 14, weight: 160, cal: 320, pro: 30, carb: 12, fat: 18, fib: 2, sig: false, diff: "medium", prep: 25, allergens: ["shellfish","dairy"], season: ["all"] },
  { name: "Wagyu Strip Loin with Truffle Demi", desc: "A5 Miyazaki wagyu strip loin with black truffle demi-glace", price: 68, cost: 30, weight: 200, cal: 640, pro: 40, carb: 4, fat: 52, fib: 0, sig: true, diff: "hard", prep: 25, allergens: ["dairy"], season: ["all"] },
  { name: "Sous-Vide Chicken Supreme", desc: "Air-chilled chicken breast with morel cream and spring vegetables", price: 32, cost: 10, weight: 220, cal: 380, pro: 44, carb: 10, fat: 18, fib: 3, sig: false, diff: "medium", prep: 45, allergens: ["dairy"], season: ["spring"] },
  { name: "Grilled Swordfish with Puttanesca", desc: "Mediterranean-style grilled swordfish with olive-caper sauce", price: 36, cost: 13, weight: 200, cal: 340, pro: 40, carb: 6, fat: 18, fib: 1, sig: false, diff: "medium", prep: 25, allergens: ["fish"], season: ["summer","fall"] },
  { name: "Veal Milanese with Arugula", desc: "Breaded veal cutlet with shaved parmesan and lemon-arugula salad", price: 34, cost: 12, weight: 260, cal: 520, pro: 42, carb: 22, fat: 30, fib: 1, sig: false, diff: "medium", prep: 25, allergens: ["gluten","eggs","dairy"], season: ["spring","summer"] },
  { name: "Branzino with Lemon-Caper Brown Butter", desc: "Whole Mediterranean sea bass with brown butter, capers, and lemon", price: 36, cost: 13, weight: 280, cal: 380, pro: 46, carb: 2, fat: 22, fib: 0, sig: false, diff: "medium", prep: 25, allergens: ["fish","dairy"], season: ["all"] },
  { name: "Pork Belly with Apple Gastrique", desc: "Crispy pork belly with caramelized apple gastrique and watercress", price: 30, cost: 10, weight: 200, cal: 520, pro: 28, carb: 18, fat: 38, fib: 1, sig: false, diff: "hard", prep: 180, allergens: [], season: ["fall","winter"] },
  { name: "Filet Mignon with Périgord Sauce", desc: "8oz center-cut filet with Périgord truffle sauce and pommes purée", price: 52, cost: 22, weight: 280, cal: 560, pro: 52, carb: 12, fat: 34, fib: 1, sig: true, diff: "hard", prep: 30, allergens: ["dairy"], season: ["all"] },
  { name: "Miso-Glazed Black Cod", desc: "Sake-miso marinated black cod with bok choy and yuzu", price: 38, cost: 15, weight: 180, cal: 360, pro: 32, carb: 12, fat: 22, fib: 1, sig: true, diff: "medium", prep: 40, allergens: ["fish","soy","sesame"], season: ["all"] },
  { name: "Lamb Merguez with Couscous", desc: "Spiced lamb merguez sausages with harissa couscous and yogurt", price: 28, cost: 9, weight: 240, cal: 480, pro: 30, carb: 28, fat: 26, fib: 3, sig: false, diff: "medium", prep: 30, allergens: ["dairy","gluten"], season: ["spring","summer"] },
  { name: "Venison Loin with Juniper Sauce", desc: "Pan-seared venison loin with juniper berry sauce and parsnip purée", price: 42, cost: 16, weight: 200, cal: 420, pro: 44, carb: 10, fat: 24, fib: 2, sig: true, diff: "hard", prep: 30, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Seared Yellowfin Tuna with Soy-Ginger", desc: "Sushi-grade yellowfin with soy-ginger glaze and wasabi mash", price: 34, cost: 12, weight: 180, cal: 320, pro: 40, carb: 12, fat: 12, fib: 1, sig: false, diff: "medium", prep: 20, allergens: ["fish","soy"], season: ["spring","summer"] },
  { name: "Osso Buco with Gremolata", desc: "Braised veal shank with saffron risotto and gremolata", price: 44, cost: 16, weight: 340, cal: 620, pro: 48, carb: 32, fat: 32, fib: 1, sig: true, diff: "hard", prep: 240, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Chilean Sea Bass with Miso Broth", desc: "Buttery Chilean sea bass in white miso broth with enoki mushrooms", price: 42, cost: 17, weight: 200, cal: 380, pro: 34, carb: 8, fat: 26, fib: 1, sig: true, diff: "medium", prep: 30, allergens: ["fish","soy"], season: ["all"] },
  { name: "Grilled Wagyu Skirt Steak", desc: "Snake River Farms wagyu skirt steak with chimichurri and charred scallion", price: 38, cost: 15, weight: 220, cal: 520, pro: 44, carb: 4, fat: 36, fib: 1, sig: false, diff: "medium", prep: 20, allergens: [], season: ["spring","summer","fall"] },
]

// --- 20 MORE SIDES ---
const sides = [
  { name: "Truffle Mashed Potatoes", desc: "Creamy Yukon Gold potatoes with black truffle and chives", price: 14, cost: 4, weight: 180, cal: 320, pro: 6, carb: 28, fat: 22, fib: 2, sig: false, diff: "easy", prep: 30, allergens: ["dairy"], season: ["all"] },
  { name: "Roasted Brussels Sprouts with Bacon", desc: "Crispy brussels sprouts with lardons, balsamic glaze, and pecorino", price: 13, cost: 3.5, weight: 150, cal: 220, pro: 10, carb: 16, fat: 14, fib: 5, sig: false, diff: "easy", prep: 25, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Pommes Anna", desc: "Classic French sliced potato cake with clarified butter and thyme", price: 12, cost: 3, weight: 120, cal: 260, pro: 4, carb: 24, fat: 18, fib: 2, sig: false, diff: "hard", prep: 50, allergens: ["dairy"], season: ["all"] },
  { name: "Saffron Risotto Milanese", desc: "Creamy carnaroli risotto with saffron and aged parmesan", price: 16, cost: 5, weight: 180, cal: 380, pro: 10, carb: 42, fat: 20, fib: 1, sig: false, diff: "hard", prep: 40, allergens: ["dairy"], season: ["all"] },
  { name: "Grilled Asparagus with Hollandaise", desc: "Jumbo asparagus spears with classic hollandaise sauce", price: 14, cost: 4.5, weight: 120, cal: 220, pro: 6, carb: 6, fat: 20, fib: 3, sig: false, diff: "medium", prep: 20, allergens: ["eggs","dairy"], season: ["spring"] },
  { name: "Lobster Mac & Cheese", desc: "Cavatappi with lobster, gruyère, parmesan, and toasted panko", price: 22, cost: 8, weight: 200, cal: 520, pro: 24, carb: 36, fat: 32, fib: 1, sig: true, diff: "medium", prep: 30, allergens: ["shellfish","dairy","gluten"], season: ["all"] },
  { name: "Sautéed Wild Mushrooms", desc: "Mixed wild mushrooms with garlic, thyme, and sherry butter", price: 14, cost: 4.5, weight: 120, cal: 140, pro: 6, carb: 8, fat: 10, fib: 2, sig: false, diff: "easy", prep: 15, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Roasted Carrots with Honey & Yogurt", desc: "Rainbow carrots with honey glaze, labneh, and za'atar", price: 12, cost: 3, weight: 140, cal: 160, pro: 4, carb: 22, fat: 8, fib: 4, sig: false, diff: "easy", prep: 25, allergens: ["dairy"], season: ["spring","fall"] },
  { name: "Crispy Fingerling Potatoes", desc: "Roasted fingerling potatoes with rosemary, garlic confit, and sea salt", price: 11, cost: 2.5, weight: 150, cal: 240, pro: 4, carb: 32, fat: 12, fib: 3, sig: false, diff: "easy", prep: 30, allergens: [], season: ["all"] },
  { name: "Creamed Spinach Gratin", desc: "Creamed spinach with gruyère and nutmeg gratinée", price: 12, cost: 3, weight: 160, cal: 260, pro: 10, carb: 10, fat: 22, fib: 3, sig: false, diff: "easy", prep: 25, allergens: ["dairy"], season: ["all"] },
  { name: "Ratatouille Provençale", desc: "Summer vegetable tian with olive oil, herbs de Provence, and goat cheese", price: 13, cost: 3.5, weight: 160, cal: 140, pro: 5, carb: 14, fat: 8, fib: 4, sig: false, diff: "medium", prep: 40, allergens: ["dairy"], season: ["summer","fall"] },
  { name: "Grilled Polenta with Mushroom Ragu", desc: "Creamy grilled polenta with wild mushroom ragu and parmesan", price: 13, cost: 3.5, weight: 180, cal: 260, pro: 8, carb: 30, fat: 12, fib: 3, sig: false, diff: "medium", prep: 30, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Warm Farro & Roasted Vegetable Salad", desc: "Toasted farro with roasted squash, kale, goat cheese, and vinaigrette", price: 13, cost: 3.5, weight: 170, cal: 260, pro: 8, carb: 36, fat: 12, fib: 5, sig: false, diff: "easy", prep: 30, allergens: ["dairy","gluten"], season: ["fall","winter"] },
  { name: "Truffle Fries with Aioli", desc: "Crispy pommes frites with truffle oil and garlic aioli", price: 11, cost: 2.5, weight: 140, cal: 340, pro: 4, carb: 34, fat: 22, fib: 2, sig: false, diff: "easy", prep: 20, allergens: ["eggs"], season: ["all"] },
  { name: "Haricots Verts with Almonds", desc: "French green beans with toasted almonds and lemon beurre noisette", price: 12, cost: 3, weight: 120, cal: 140, pro: 5, carb: 8, fat: 10, fib: 3, sig: false, diff: "easy", prep: 15, allergens: ["nuts","dairy"], season: ["spring","summer"] },
  { name: "Crispy Cauliflower with Curry Sauce", desc: "Flash-fried cauliflower florets with curry aioli and cilantro", price: 12, cost: 3, weight: 140, cal: 200, pro: 5, carb: 14, fat: 16, fib: 3, sig: false, diff: "easy", prep: 20, allergens: ["eggs"], season: ["all"] },
  { name: "Sweet Potato Gratin with Marshmallow", desc: "Layered sweet potatoes with brown butter, pecans, and torched marshmallow", price: 13, cost: 3.5, weight: 170, cal: 320, pro: 4, carb: 38, fat: 18, fib: 4, sig: false, diff: "medium", prep: 45, allergens: ["nuts","dairy","eggs"], season: ["fall","winter"] },
  { name: "Sautéed Kale with Garlic & Lemon", desc: "Lacinato kale with garlic confit, Calabrian chili, and lemon", price: 10, cost: 2.5, weight: 140, cal: 120, pro: 4, carb: 8, fat: 8, fib: 3, sig: false, diff: "easy", prep: 15, allergens: [], season: ["fall","winter","spring"] },
  { name: "Truffle Risotto with Porcini", desc: "Arborio risotto with porcini mushrooms and white truffle oil", price: 18, cost: 6, weight: 180, cal: 360, pro: 8, carb: 40, fat: 20, fib: 1, sig: false, diff: "hard", prep: 40, allergens: ["dairy"], season: ["fall","winter"] },
  { name: "Roasted Root Vegetable Medley", desc: "Seasonal root vegetables with honey-thyme glaze and goat cheese", price: 12, cost: 3, weight: 160, cal: 180, pro: 4, carb: 28, fat: 8, fib: 5, sig: false, diff: "easy", prep: 30, allergens: ["dairy"], season: ["fall","winter"] },
]

// --- 20 MORE DESSERTS ---
const desserts = [
  { name: "Classic Crème Brûlée", desc: "Madagascar vanilla crème brûlée with caramelized sugar lid", price: 14, cost: 3.5, weight: 120, cal: 380, pro: 6, carb: 30, fat: 28, fib: 0, sig: false, diff: "medium", prep: 180, allergens: ["dairy","eggs"], season: ["all"] },
  { name: "Chocolate Soufflé with Crème Anglaise", desc: "Individual Valrhona chocolate soufflé with vanilla crème anglaise", price: 18, cost: 5, weight: 100, cal: 380, pro: 10, carb: 38, fat: 22, fib: 2, sig: false, diff: "hard", prep: 35, allergens: ["dairy","eggs","gluten"], season: ["all"] },
  { name: "Mille-Feuille with Vanilla Pastry Cream", desc: "Layered puff pastry with vanilla bean pastry cream and powdered sugar", price: 16, cost: 4.5, weight: 100, cal: 400, pro: 6, carb: 36, fat: 28, fib: 1, sig: false, diff: "hard", prep: 60, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Warm Apple Tarte Tatin", desc: "Caramelized apple tarte tatin with Calvados crème fraîche", price: 16, cost: 4.5, weight: 130, cal: 420, pro: 4, carb: 48, fat: 26, fib: 3, sig: false, diff: "hard", prep: 50, allergens: ["dairy","gluten","eggs"], season: ["fall","winter"] },
  { name: "Dark Chocolate Nemesis", desc: "Flourless Belgian chocolate cake with raspberry coulis", price: 16, cost: 5, weight: 100, cal: 440, pro: 8, carb: 38, fat: 32, fib: 3, sig: false, diff: "medium", prep: 40, allergens: ["eggs","dairy"], season: ["all"] },
  { name: "Lemon Posset with Shortbread", desc: "Silky lemon cream with fresh berries and buttery shortbread", price: 14, cost: 3.5, weight: 110, cal: 340, pro: 4, carb: 34, fat: 22, fib: 1, sig: false, diff: "easy", prep: 20, allergens: ["dairy","gluten"], season: ["spring","summer"] },
  { name: "Panna Cotta with Strawberries", desc: "Buttermilk panna cotta with macerated strawberries and basil oil", price: 14, cost: 3.5, weight: 120, cal: 300, pro: 6, carb: 24, fat: 22, fib: 1, sig: false, diff: "easy", prep: 20, allergens: ["dairy"], season: ["spring","summer"] },
  { name: "Baked Alaska", desc: "Vanilla, chocolate, and raspberry ice cream in toasted meringue", price: 22, cost: 7, weight: 160, cal: 480, pro: 8, carb: 48, fat: 30, fib: 1, sig: true, diff: "hard", prep: 45, allergens: ["dairy","eggs","nuts"], season: ["all"] },
  { name: "Cheesecake with Passion Fruit Glaze", desc: "New York-style cheesecake with passion fruit glaze and mango coulis", price: 16, cost: 5, weight: 140, cal: 420, pro: 10, carb: 34, fat: 28, fib: 1, sig: false, diff: "medium", prep: 240, allergens: ["dairy","eggs","gluten"], season: ["spring","summer"] },
  { name: "Tiramisu with Espresso Gelée", desc: "Classic tiramisu with espresso gelée and cocoa dust", price: 15, cost: 4, weight: 120, cal: 360, pro: 8, carb: 34, fat: 22, fib: 0, sig: false, diff: "medium", prep: 240, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Passion Fruit & Coconut Pavlova", desc: "Crisp meringue with passion fruit curd, coconut cream, and tropical fruit", price: 17, cost: 5, weight: 110, cal: 320, pro: 4, carb: 36, fat: 20, fib: 1, sig: false, diff: "hard", prep: 60, allergens: ["eggs","dairy","nuts"], season: ["spring","summer"] },
  { name: "Chocolate Lava Cake", desc: "Warm Valrhona lava cake with vanilla ice cream", price: 18, cost: 5.5, weight: 110, cal: 460, pro: 8, carb: 42, fat: 32, fib: 2, sig: false, diff: "hard", prep: 25, allergens: ["dairy","eggs","gluten"], season: ["all"] },
  { name: "Sticky Toffee Pudding", desc: "Warm date cake with toffee sauce and clotted cream", price: 15, cost: 4, weight: 140, cal: 480, pro: 6, carb: 56, fat: 28, fib: 2, sig: false, diff: "medium", prep: 40, allergens: ["dairy","eggs","gluten"], season: ["fall","winter"] },
  { name: "Raspberry & Rose Macaron Tower", desc: "Assorted raspberry-rose macarons with lychee cream", price: 16, cost: 5, weight: 80, cal: 280, pro: 4, carb: 32, fat: 16, fib: 1, sig: false, diff: "hard", prep: 50, allergens: ["nuts","eggs","dairy"], season: ["spring","summer"] },
  { name: "Coconut Rice Pudding with Mango", desc: "Creamy coconut rice pudding with fresh mango and toasted coconut", price: 13, cost: 3, weight: 140, cal: 320, pro: 6, carb: 44, fat: 14, fib: 2, sig: false, diff: "easy", prep: 25, allergens: ["dairy"], season: ["spring","summer"] },
  { name: "Saffron Pear Tartelette", desc: "Poached pear in saffron syrup with almond frangipane", price: 16, cost: 4.5, weight: 110, cal: 340, pro: 4, carb: 38, fat: 20, fib: 3, sig: false, diff: "medium", prep: 50, allergens: ["nuts","dairy","gluten","eggs"], season: ["fall","winter"] },
  { name: "Mango Lassi Panna Cotta", desc: "Indian-inspired mango lassi panna cotta with pistachio brittle", price: 13, cost: 3.5, weight: 120, cal: 260, pro: 6, carb: 28, fat: 16, fib: 1, sig: false, diff: "easy", prep: 20, allergens: ["dairy","nuts"], season: ["spring","summer"] },
  { name: "Black Forest Trifle", desc: "Chocolate sponge, sour cherry compote, and kirsch chantilly cream", price: 16, cost: 4.5, weight: 150, cal: 420, pro: 6, carb: 40, fat: 28, fib: 2, sig: false, diff: "medium", prep: 30, allergens: ["dairy","gluten","eggs"], season: ["all"] },
  { name: "Cardamom Crème Caramel", desc: "Silky cardamom-scented crème caramel with honey-pistachio praline", price: 14, cost: 3.5, weight: 120, cal: 340, pro: 6, carb: 32, fat: 22, fib: 0, sig: false, diff: "medium", prep: 210, allergens: ["dairy","eggs","nuts"], season: ["all"] },
  { name: "Grand Marnier Soufflé", desc: "Classic Grand Marnier soufflé with orange crème anglaise", price: 20, cost: 6, weight: 100, cal: 360, pro: 8, carb: 34, fat: 22, fib: 0, sig: true, diff: "hard", prep: 35, allergens: ["dairy","eggs","gluten"], season: ["all"] },
]

// ====================================================================
// SEED HELPER
// ====================================================================

const ALL_SECTIONS = [
  { key: "hors-doeuvres", label: "Hors d'Oeuvres", data: horsDOeuvres },
  { key: "appetizers", label: "Appetizers", data: appetizers },
  { key: "proteins", label: "Proteins", data: proteins },
  { key: "sides", label: "Sides", data: sides },
  { key: "desserts", label: "Desserts", data: desserts },
]

async function run() {
  let totalInserted = 0

  for (const section of ALL_SECTIONS) {
    let inserted = 0
    for (const h of section.data) {
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
      const season = h.season[0] === "all" ? ["spring","summer","fall","winter"] : h.season
      const { error } = await supabase.from("menu_items").insert({
        category: section.key,
        section: section.key,
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
        allergens: h.allergens || [],
        season_tags: season,
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
    console.log(`Inserted ${inserted} / ${section.data.length} ${section.label}`)
    totalInserted += inserted
  }

  // Update sort_order for ALL items
  const sectionOrder = { "hors-doeuvres": 1, appetizers: 2, proteins: 3, sides: 4, desserts: 5 }
  const { data: existing } = await supabase.from("menu_items").select("id,section")
  for (const item of existing || []) {
    const so = sectionOrder[item.section] || 10
    await supabase.from("menu_items").update({ sort_order: so }).eq("id", item.id)
  }
  console.log("Updated sort_order for all", existing?.length, "items")

  // Final count
  const { data: counts } = await supabase.from("menu_items").select("section, name")
  const sectionCounts = {}
  for (const c of counts || []) {
    sectionCounts[c.section] = (sectionCounts[c.section] || 0) + 1
  }
  console.log("\nFinal counts by section:")
  for (const [s, c] of Object.entries(sectionCounts)) {
    if (c) console.log(`  ${s}: ${c}`)
  }
  console.log(`\nTOTAL: ${counts?.length || 0} items`)
}

run().catch(console.error)