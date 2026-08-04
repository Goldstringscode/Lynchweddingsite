const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.SUPABASE_URL || "https://asnkchxmqanvdljzgshv.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "SUPABASE_SERVICE_ROLE_KEY_FROM_ENV"
)

// Load scout's data
const d = fs.readFileSync('scout-fine-dining-data.js', 'utf8')

function extractArray(varName) {
  const idx = d.indexOf(`const ${varName} = [`)
  if (idx === -1) return []
  let start = idx + varName.length + 13
  let depth = 1
  let end = start
  while (depth > 0 && end < d.length) {
    if (d[end] === '[') depth++
    else if (d[end] === ']') depth--
    end++
  }
  const arrText = '[' + d.slice(start, end - 1) + ']'
  return eval(arrText)
}

const scoutData = {
  'hors-doeuvres': extractArray('horsDOeuvres'),
  'appetizers': extractArray('appetizers'),
  'proteins': extractArray('proteins'),
  'sides': extractArray('sides'),
  'desserts': extractArray('desserts'),
}

// Normalize allergens: "tree_nuts" -> "tree nuts"
function normalizeAllergens(allergens) {
  if (!allergens || !Array.isArray(allergens)) return []
  return allergens.map(a => a.replace('_', ' '))
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function nameSimilarity(a, b) {
  const aWords = a.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean)
  const bWords = b.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean)
  const common = aWords.filter(w => bWords.includes(w)).length
  const maxLen = Math.max(aWords.length, bWords.length)
  return maxLen > 0 ? common / maxLen : 0
}

async function run() {
  // 1. Get all existing item names
  const { data: existing } = await supabase.from('menu_items').select('id, name, section')
  const existingByName = {}
  for (const item of existing || []) {
    const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    existingByName[key] = item
  }

  let totalInserted = 0
  let totalSkipped = 0

  for (const [section, items] of Object.entries(scoutData)) {
    let inserted = 0
    let skipped = 0

    for (const h of items) {
      const nameKey = h.name.toLowerCase().replace(/[^a-z0-9]/g, '')

      // Check for duplicates by name similarity
      let isDuplicate = false
      if (existingByName[nameKey]) {
        isDuplicate = true
        skipped++
        continue
      }

      // Check fuzzy match
      for (const [existKey, existItem] of Object.entries(existingByName)) {
        if (nameSimilarity(h.name, existItem.name) > 0.7) {
          isDuplicate = true
          skipped++
          break
        }
      }
      if (isDuplicate) continue

      // Seed this item
      const nutr = JSON.stringify({
        calories: h.cal || h.calories,
        protein: h.pro || h.protein,
        carbs: h.carb || h.carbs,
        fat: h.fat,
        fiber: h.fib || h.fiber,
      })

      const cost = h.cost
      const price = h.price
      const ings = [
        { item: h.name + " base mix", quantity: "1 serving", costcoPrice: +(cost * 1.15).toFixed(2), wincoPrice: +(cost * 1.3).toFixed(2) },
        { item: "Seasonings & herbs", quantity: "to taste", costcoPrice: 0.3, wincoPrice: 0.4 },
        { item: "Garnish & plating", quantity: "1 portion", costcoPrice: 0.2, wincoPrice: 0.25 },
        { item: "Oil & butter", quantity: "1 tbsp", costcoPrice: 0.15, wincoPrice: 0.2 },
      ]
      const pricing = {
        costco: { costPerServing: +(cost * 1.15).toFixed(2), totalFor150: +((cost * 1.15) * 150).toFixed(0) },
        winco: { costPerServing: +(cost * 1.3).toFixed(2), totalFor150: +((cost * 1.3) * 150).toFixed(0) },
        blended: { costPerServing: cost, totalFor150: +(cost * 150).toFixed(0) },
        savingsPerServing: +((cost * 1.3) - (cost * 1.15)).toFixed(2),
        savingsPercent: +((((cost * 1.3) - (cost * 1.15)) / (cost * 1.3)) * 100).toFixed(1),
        menuPrice: price,
        profitMargin: +(((price - cost) / price) * 100).toFixed(1),
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      const season = (h.season || []).length > 0
        ? (h.season.includes('all') || h.season.length >= 4 ? ['spring','summer','fall','winter'] : h.season)
        : ['all']

      const { error } = await supabase.from('menu_items').insert({
        category: section,
        section: section,
        name: h.name,
        description: h.desc || h.description || '',
        suggested_menu_price: price,
        cost_per_serving: cost,
        portion_weight_g: h.weight || h.portion_weight || 100,
        nutrition: nutr,
        is_signature: h.sig || h.is_signature || false,
        is_available: true,
        difficulty: h.diff || h.difficulty || 'medium',
        prep_time: h.prep || h.prep_time || 30,
        allergens: normalizeAllergens(h.allergens || []),
        season_tags: season,
        ingredient_list: ings,
        ingredient_links: pricing,
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
      }
    }

    console.log(`${section}: ${inserted} inserted, ${skipped} skipped`)
    totalInserted += inserted
    totalSkipped += skipped
  }

  console.log(`\nTOTAL: ${totalInserted} new items added, ${totalSkipped} duplicates skipped`)

  // Final count
  const { data: finalCounts } = await supabase.from('menu_items').select('section')
  const sectionCounts = {}
  for (const c of finalCounts || []) {
    sectionCounts[c.section] = (sectionCounts[c.section] || 0) + 1
  }
  console.log('\nFinal counts by section:')
  for (const [s, c] of Object.entries(sectionCounts)) {
    if (c) console.log(`  ${s}: ${c}`)
  }
  console.log(`\nGRAND TOTAL: ${finalCounts?.length || 0} items`)
}

run().catch(e => { console.error(e); process.exit(1) })