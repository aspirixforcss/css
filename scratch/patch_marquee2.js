const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

code = code.replace(/<marquee.*?<\/marquee>/s, (match) => {
    return `<marquee className="font-medium text-slate-700 dark:text-slate-300 py-3" scrollamount="6">
                        🚨 <span className="font-bold text-red-500">MPT CSS {targetYear} Exam is on October {targetYear}</span> 🚨 &nbsp;&nbsp;|&nbsp;&nbsp; {news.length > 0 ? news.join('  •  ') : 'Loading Dawn News...'}
                    </marquee>`;
});

fs.writeFileSync('src/app/page.js', code);
console.log("Success");
