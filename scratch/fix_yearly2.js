const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

code = code.replace(
    '\\n                  <button onClick={() => onUpgrade(\\\'yearly\\\')} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Select Yearly</button>',
    `
                  <button onClick={() => onUpgrade('yearly')} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Select Yearly</button>`
);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed yearly button');
