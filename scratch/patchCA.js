const fs = require('fs');

let code = fs.readFileSync('scratch/CurrentAffairsView.js', 'utf8');
const start = code.indexOf('{/* Top Featured Editorial */}');
const end = code.indexOf('{/* Two Column Layout */}');

const newEditorial = `{/* Top Featured Editorial */}
            {topArticle && (
                <div className="bg-white dark:bg-surfaceDark rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 mb-10 flex flex-col group">
                    {topArticle.enclosure?.link && (
                        <div className="w-full h-48 md:h-72 bg-slate-100 overflow-hidden relative border-b border-slate-200 dark:border-slate-700">
                            <img src={topArticle.enclosure.link} alt={topArticle.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    )}
                    <div className="p-6 md:p-10">
                        <div className="flex flex-col items-center text-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                            <div className="bg-primary/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-4 border border-primary/20">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                                <span className="font-bold text-primary uppercase tracking-widest text-xs">Latest Dawn Editorial</span>
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight font-serif">{topArticle.title}</h3>
                            <p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">{new Date(topArticle.pubDate).toDateString()}</p>
                        </div>
                        
                        <div className="columns-1 md:columns-2 gap-10 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            <div className="break-inside-avoid-column mb-6">
                                <p className="text-lg md:text-xl font-serif italic border-l-4 border-primary pl-4 mb-6">This editorial summary was auto-generated to give you the most crucial points quickly.</p>
                            </div>
                            {topArticle.summaryPoints?.length > 0 ? topArticle.summaryPoints.map((point, idx) => (
                                <p key={idx} className="mb-4 text-justify">
                                    {idx === 0 ? <span className="float-left text-5xl font-black text-slate-900 dark:text-white pr-3 font-serif mt-2">{point.charAt(0)}</span> : null}
                                    {idx === 0 ? point.substring(1) : point}
                                </p>
                            )) : (
                                <p>No summary available for this editorial.</p>
                            )}
                            
                            <div className="mt-8 break-inside-avoid-column">
                                <a href={topArticle.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-xl font-bold hover:bg-primary dark:hover:bg-primary transition-colors shadow-md w-full justify-center">
                                    Read Full Editorial <i className="fa-solid fa-arrow-up-right-from-square opacity-80"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            `;

code = code.substring(0, start) + newEditorial + code.substring(end);
fs.writeFileSync('scratch/CurrentAffairsView.js', code);
console.log('Fixed CurrentAffairsView');
