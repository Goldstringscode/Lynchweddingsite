// Add authenticateAdmin() gate to every admin API route.
// Exceptions (public): POST /api/rsvp (guest form), POST /api/sms/status (Twilio webhook).
const fs = require('fs');
const path = require('path');

const EXEMPT = new Set([
  'app/api/rsvp/route.ts:POST',
  'app/api/sms/status/route.ts:POST',
]);

const IMPORT = `import { authenticateAdmin } from '@/lib/auth'`;

function transform(file) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
  let src = fs.readFileSync(file, 'utf8');
  const hasImport = src.includes("from '@/lib/auth'");
  if (!hasImport) {
    // Insert after the last import line
    const lines = src.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^import .* from ['"]/.test(lines[i])) lastImport = i;
    }
    if (lastImport === -1) {
      console.log('  !! no import found, skipping', rel);
      return false;
    }
    lines.splice(lastImport + 1, 0, IMPORT);
    src = lines.join('\n');
  }

  // For each exported handler, insert the gate as the first statement
  const handlerRe = /(export async function (GET|POST|PATCH|PUT|DELETE)\([^)]*\)\s*\{\s*\n)/g;
  let changed = false;
  src = src.replace(handlerRe, (match, head, method) => {
    if (EXEMPT.has(`${rel}:${method}`)) return match;
    if (match.includes('authenticateAdmin')) return match;
    changed = true;
    return `${head}  const authError = await authenticateAdmin()\n  if (authError) return authError\n`;
  });

  if (!changed) {
    console.log('  !! no handlers transformed (maybe already gated?)', rel);
    return false;
  }
  fs.writeFileSync(file, src);
  console.log('  ✓ gated', rel);
  return true;
}

const files = process.argv.slice(2);
let ok = 0;
for (const f of files) {
  if (transform(f)) ok++;
}
console.log(`\nDone: ${ok}/${files.length} files gated.`);
