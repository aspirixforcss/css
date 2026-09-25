const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');
code = code.replace(/\\nexport default App;\\n/g, '');
code += '\nexport default App;\n';
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed export');
