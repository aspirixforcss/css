const fs = require('fs');
let code = fs.readFileSync('scratch/NewDashboard.js', 'utf8');
code = code.replace('<p className="text-sm font-medium">', '<p className="text-sm font-bold text-slate-700 dark:text-slate-300">');
fs.writeFileSync('scratch/NewDashboard.js', code);
