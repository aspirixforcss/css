const fs = require('fs');
let code = fs.readFileSync('scratch/CurrentAffairsView.js', 'utf8');

code = code.replace(/\$\{className\}/g, 'group flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors');

fs.writeFileSync('scratch/CurrentAffairsView.js', code);
