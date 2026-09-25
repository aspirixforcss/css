const fs = require('fs');

let code = fs.readFileSync('scratch/CurrentAffairsView.js', 'utf8');

code = code.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n    const [activeArticle, setActiveArticle] = useState(null);'
);

code = code.replace(
    'const topArticle = news.dawn?.[0];',
    'const topArticle = activeArticle || news.dawn?.[0];'
);

code = code.replace(
    '<span className="font-bold text-primary uppercase tracking-widest text-xs">Latest Dawn Editorial</span>',
    '<span className="font-bold text-primary uppercase tracking-widest text-xs">{activeArticle ? "Featured Article" : "Latest Dawn Editorial"}</span>'
);

code = code.replace(
    'Read Full Editorial',
    'Read Full Article'
);

const oldNationalLink = `<a key={idx} href={article.link} target="_blank" rel="noreferrer" className="group flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">`;
const newNationalLink = `<button key={idx} onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left group flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">`;

code = code.replaceAll(oldNationalLink, newNationalLink);
code = code.replaceAll('</a>\n                        ))}', '</button>\n                        ))}');

fs.writeFileSync('scratch/CurrentAffairsView.js', code);
console.log('Fixed CurrentAffairsView');
