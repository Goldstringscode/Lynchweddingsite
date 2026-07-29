const fs = require('fs')
const d = fs.readFileSync('scout-fine-dining-data.js', 'utf8')

const sections = [
  { var: 'horsDOeuvres', section: 'hors-doeuvres' },
  { var: 'appetizers', section: 'appetizers' },
  { var: 'proteins', section: 'proteins' },
  { var: 'sides', section: 'sides' },
  { var: 'desserts', section: 'desserts' },
]

for (const { var: varname, section } of sections) {
  // Find the array by matching: horsDOeuvres = [
  const idx = d.indexOf(`const ${varname} = [`)
  if (idx === -1) { console.log(`${varname}: not found`); continue }
  
  // Extract the array text - find matching closing bracket
  let start = idx + varname.length + 13 // skip "const varname = ["
  let depth = 1
  let end = start
  while (depth > 0 && end < d.length) {
    if (d[end] === '[') depth++
    else if (d[end] === ']') depth--
    end++
  }
  
  const arrText = '[' + d.slice(start, end - 1) + ']'
  
  try {
    const arr = eval(arrText)
    const prices = arr.map(x => x.price).filter(p => typeof p === 'number')
    const names = arr.map(x => x.name)
    console.log(`${section}: ${arr.length} items, $${Math.min(...prices)}-$${Math.max(...prices)}`)
    console.log(`  Names: ${names.join(', ')}`)
  } catch(e) {
    console.log(`${varname}: eval error: ${e.message.substring(0, 100)}`)
  }
}