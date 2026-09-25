const fs = require('fs');

let code = fs.readFileSync('scratch/VocabFlashcards.js', 'utf8');

// Remove the Live Synced banner
const excelBannerRegex = /<div className=\{`p-4 rounded-xl border flex items-start gap-3 text-sm font-bold shadow-sm \$\{!excelError \? 'bg-green-50\/50 dark:bg-green-900\/10 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-amber-50\/50 dark:bg-amber-900\/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'\}`\}>[\s\S]*?<\/div>/;
code = code.replace(excelBannerRegex, '');

// Update the marketing copy
const oldCopyRegex = /Master this list and you’ll multiply your vocabulary by at least <strong className="text-primary font-black text-xl">5×<\/strong> — turning just <span className="text-primary font-black">\{liveVocab\.length\} words<\/span> into a massive edge on test day\./;
const newCopy = `Master this list and you’ll multiply your vocabulary by at least <strong className="text-primary font-black text-xl">5×</strong> — turning just <span className="text-primary font-black">{liveVocab.length} words</span> into a massive 3000 plus words.`;
code = code.replace(oldCopyRegex, newCopy);

fs.writeFileSync('scratch/VocabFlashcards.js', code);
console.log('VocabFlashcards patched');
