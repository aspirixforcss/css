const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldUiLogic = `                                  <div>
                                      <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors text-sm leading-snug line-clamp-2">{article.title}</h4>
                                      <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(article.pubDate).toLocaleDateString()}</p>
                                  </div>`;

const newUiLogic = `                                  <div>
                                      <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors text-sm leading-snug line-clamp-2">{article.title}</h4>
                                      <p className="text-xs text-slate-400 mt-2 font-medium">{article.sourceName} • {new Date(article.pubDate).toLocaleDateString()}</p>
                                  </div>`;

// Apply twice (once for national, once for international)
code = code.replace(oldUiLogic, newUiLogic);
code = code.replace(oldUiLogic, newUiLogic);

// Add the source to the top article view
const oldTopUiLogic = `                              <p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">{new Date(topArticle.pubDate).toDateString()}</p>`;
const newTopUiLogic = `                              <p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">{topArticle.sourceName} • {new Date(topArticle.pubDate).toDateString()}</p>`;
code = code.replace(oldTopUiLogic, newTopUiLogic);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed UI logic for source names');
