const fs = require('fs');

let code = fs.readFileSync('scratch/VocabFlashcards.js', 'utf8');

const search = `</div>
                
                <div className="grid`;

const replace = `</div>

                {/* New GRE Copy */}
                <div className="mt-6 mb-8 p-6 bg-gradient-to-br from-white to-slate-50 dark:from-surfaceDark dark:to-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <i className="fa-solid fa-rocket text-primary text-lg"></i>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed md:text-lg">
                            These are the most important GRE words you need to know. <br/>
                            Every single word comes with <strong className="text-slate-900 dark:text-white">3 powerful synonyms</strong> and <strong className="text-slate-900 dark:text-white">3 strong antonyms</strong>. <br/>
                            Master this list and you’ll multiply your vocabulary by at least <strong className="text-primary font-black text-xl">5×</strong> — turning just <span className="text-primary font-black">{liveVocab.length} words</span> into a massive edge on test day.
                        </p>
                    </div>
                </div>
                
                <div className="grid`;

code = code.replace(search, replace);
fs.writeFileSync('scratch/VocabFlashcards.js', code);
console.log('Patched VocabFlashcards 2');
