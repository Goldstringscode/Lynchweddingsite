const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(
  process.env.SUPABASE_URL || "https://asnkchxmqanvdljzgshv.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "sb_secret_tM5ALPnz-OOn2ukcRQaWIQ_cH80GyHm"
)

// ====================================================================
// 20 ADDITIONAL FINE DINING ITEMS PER SECTION (100 total)
// Research-backed from top restaurants: French Laundry, Per Se, 
// Le Bernardin, Eleven Madison Park, Alinea, Noma, Daniel, etc.
// ====================================================================

const horsDOeuvres = [
  // ← SCOUT WILL FILL THESE
]

const appetizers = [
  // ← SCOUT WILL FILL THESE
]

const proteins = [
  // ← SCOUT WILL FILL THESE
]

const sides = [
  // ← SCOUT WILL FILL THESE
]

const desserts = [
  // ← SCOUT WILL FILL THESE
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
    if (section.data.length === 0) {
      console.log(`⚠️  No data for ${section.label}, skipping`)
      continue
    }

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
    console.log(`Inserted ${inserted} / ${section.data.length} ${section.label}`)
    totalInserted += inserted
  }

  // Update sort_order
  const sectionOrder = { "hors-doeuvres": 1, appetizers: 2, proteins: 3, sides: 4, desserts: 5 }
  const { data: existing } = await supabase.from("menu_items").select("id,section")
  for (const item of existing || []) {
    const so = sectionOrder[item.section] || 10
    await supabase.from("menu_items").update({ sort_order: so }).eq("id", item.id)
  }
  console.log("Updated sort_order for all", existing?.length, "items")

  const { data: counts } = await supabase.from("menu_items").select("section")
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