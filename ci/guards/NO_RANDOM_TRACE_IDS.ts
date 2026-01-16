import fs from 'fs';
import path from 'path';

const FORBIDDEN = ['generateId(', 'createIdGenerator(', 'uuid', 'nanoid'];
const ROOTS = ['packages', 'apps'];
let violations = 0;

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  const walk = (dir: string) => {
    for (const file of fs.readdirSync(dir)) {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
        const content = fs.readFileSync(full, 'utf8');
        if (
          content.includes('DecisionTrace') &&
          FORBIDDEN.some(f => content.includes(f))
        ) {
          console.error(`❌ Forbidden ID usage in ${full}`);
          violations++;
        }
      }
    }
  };
  walk(root);
}

if (violations > 0) {
  console.error(`❌ ${violations} DecisionTrace ID violations found`);
  process.exit(1);
}

console.log('✅ No random IDs used in DecisionTrace');
