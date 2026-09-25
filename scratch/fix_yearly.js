const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const btnYearlyOld = '<div className="text-4xl font-black text-primary mb-4">Rs 1000<span className="text-lg font-medium opacity-60">/yr</span></div>';
const btnYearlyNew = btnYearlyOld + '\\n                  <button onClick={() => onUpgrade(\\\'yearly\\\')} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Select Yearly</button>';

code = code.replace(btnYearlyOld, btnYearlyNew);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed yearly button');
