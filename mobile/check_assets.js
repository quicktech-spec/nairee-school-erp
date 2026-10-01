const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('App.js', 'utf8');
const regex = /require\(['"`](\.\/assets\/[^'"`]+)['"`]\)/g;
let m;
let missing = 0;
while ((m = regex.exec(content)) !== null) {
  const file = m[1];
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(file, '=>', exists ? 'EXISTS ✅' : 'MISSING ❌');
  if (!exists) missing++;
}
console.log('Total missing assets:', missing);
