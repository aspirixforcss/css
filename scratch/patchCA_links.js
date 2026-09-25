const fs = require('fs');
let code = fs.readFileSync('scratch/CurrentAffairsView.js', 'utf8');

const anchorRegex = /<a key=\{idx\} href=\{article\.link\} target="_blank" rel="noreferrer" className="(.*?)"(?:.*?)>(.*?)<\/a>/gs;
code = code.replace(anchorRegex, (match, className, innerHTML) => {
    return `<button key={idx} onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left \${className}">${innerHTML}</button>`;
});

fs.writeFileSync('scratch/CurrentAffairsView.js', code);
console.log('Fixed CA links');
