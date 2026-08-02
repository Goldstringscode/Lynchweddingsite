const fs = require('fs');
let bb = fs.readFileSync('components/menu-builder/buffet-builder-tab.tsx', 'utf8');

// 1. Add servingGuests to BuffetStation
bb = bb.replace(
  'items: { item: BuffetItem; portion?: string }[]',
  'items: { item: BuffetItem; portion?: string; servingGuests?: number }[]'
);
console.log('1. servingGuests added');

// 2. Update recalculateMenu - find it by matching the function pattern
const calcStart = bb.indexOf('const recalculateMenu');
if (calcStart >= 0) {
  const before = bb.substring(0, calcStart);
  const rest = bb.substring(calcStart);
  // Find the closing of the function (first '}' at root level)
  let depth = 0;
  let endIdx = 0;
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  if (endIdx > 0) {
    const newFn = `const recalculateMenu = (menu: BuffetMenu) => {
    let totalPerPerson = 0
    for (const station of menu.stations) {
      for (const si of station.items) {
        const gc = menu.guest_count || 150
        const sg = si.servingGuests ?? gc
        const portionMultiplier = si.portion === "large" ? 1.5 : si.portion === "small" ? 0.67 : 1
        const itemCost = (si.item.price_per_person || 0) * portionMultiplier * (sg / gc)
        totalPerPerson += itemCost
      }
    }
    menu.total_cost_per_person = totalPerPerson
    menu.total_menu_cost = totalPerPerson * (menu.guest_count || 150)
  }`;
    bb = before + newFn + rest.substring(endIdx);
    console.log('2. recalculateMenu updated');
  } else {
    console.log('2. Could not find recalculateMenu end');
  }
} else {
  console.log('2. Could not find recalculateMenu');
}

// 3. Change "Add to Buffet" / "Added to Buffet" labels
bb = bb.replace('"Added to Buffet"', '"Remove from Menu"');
bb = bb.replace('"Add to Buffet"', '"Add to Menu"');
console.log('3. Button labels updated');

// 4. Add gc to addToBuffet
// Find the addToBuffet function
const addStart = bb.indexOf('const addToBuffet');
if (addStart >= 0) {
  // Add gc after existingStation declaration
  bb = bb.replace(
    'const existingStation = activeMenu.stations.find(s => s.type === stationType)',
    'const gc = activeMenu.guest_count || 150\n    const existingStation = activeMenu.stations.find(s => s.type === stationType)'
  );
  // Add servingGuests to push
  bb = bb.replace(
    'existingStation.items.push({ item })',
    'existingStation.items.push({ item, servingGuests: gc })'
  );
  bb = bb.replace(
    'items: [{ item }],',
    'items: [{ item, servingGuests: gc }],'
  );
  console.log('4. addToBuffet updated');
} else {
  console.log('4. Could not find addToBuffet');
}

fs.writeFileSync('components/menu-builder/buffet-builder-tab.tsx', bb, 'utf8');
console.log('Done');