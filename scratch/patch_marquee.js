const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldMarquee = 'dYs" <span className="font-bold text-red-500">MPT CSS {targetYear} Exam is on October 10, {targetYear - 1}</span> dYs"';
const newMarquee = '🚨 <span className="font-bold text-red-500">MPT CSS {targetYear} Exam is on October, {targetYear}</span> 🚨';

code = code.replace(oldMarquee, newMarquee);

fs.writeFileSync('src/app/page.js', code);
console.log("Success");
