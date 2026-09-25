const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const regex = /<div className="p-6 border-b border-slate-100 dark:border-slate-800\/50">\s*<div className="flex justify-center w-full mt-8 mb-6 cursor-pointer group transition-transform/g;
const replacement = `<div className="px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/50">\n                  <div className="flex justify-center w-full mt-2 mb-1 cursor-pointer group transition-transform`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/page.js', code);
console.log('Replaced correctly');
