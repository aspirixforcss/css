const fs = require('fs');
let code = fs.readFileSync('src/app/MPTMockTest.js', 'utf8');
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/app/MPTMockTest.js', code);
console.log('Fixed escaping');
