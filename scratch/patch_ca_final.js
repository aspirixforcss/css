const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldTopInfo = `<p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">{new Date(topArticle.pubDate).toDateString()}</p>`;
const newTopInfo = `<p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">{topArticle.sourceName || "Dawn News"} • {new Date(topArticle.pubDate).toDateString()}</p>`;
code = code.replace(oldTopInfo, newTopInfo);

const oldTextLayout = `<div className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-justify space-y-4">
                            {(topArticle.fullText || "").split('\\n\\n').filter(s => s.trim().length > 0).map((paragraph, idx) => (
                                <p key={idx} className="leading-7">`;
const newTextLayout = `<div className="columns-1 md:columns-2 gap-10 text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-justify">
                            {(topArticle.fullText || "").split('\\n\\n').filter(s => s.trim().length > 0).map((paragraph, idx) => (
                                <p key={idx} className="leading-7 mb-4 break-inside-avoid-column">`;
code = code.replace(oldTextLayout, newTextLayout);

const oldLinkLayout = `                                </p>
                            ))}
                        </div>
                    </div>
                </div>`;
const newLinkLayout = `                                </p>
                            ))}
                        </div>
                        
                        {topArticle.link && (
                            <div className="mt-8 flex justify-center md:justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                                <a href={topArticle.link} target="_blank" rel="noopener noreferrer" className="bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
                                    Read Full Article <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                            </div>
                        )}
                    </div>
                </div>`;
code = code.replace(oldLinkLayout, newLinkLayout);

// Now for the list items:
const oldNationalList = `<p className="text-xs text-slate-400 mt-2 font-medium">{new Date(article.pubDate).toLocaleDateString()}</p>`;
const newNationalList = `<p className="text-xs text-slate-400 mt-2 font-medium">{article.sourceName || "Dawn"} • {new Date(article.pubDate).toLocaleDateString()}</p>`;
code = code.replace(oldNationalList, newNationalList); // replace the first instance
code = code.replace(oldNationalList, newNationalList); // replace the second instance (International)

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed CA UI styling and added read more link');
