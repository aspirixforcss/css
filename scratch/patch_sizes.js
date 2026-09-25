const fs = require('fs');

// 1. Sidebar Logo Patch
let sbCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');
const oldSb = `<div className="relative flex items-center justify-center w-full mt-6 mb-4 h-14 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-5 left-2 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-44 h-11 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const newSb = `<div className="relative flex items-center justify-center w-full mt-8 mb-4 h-12 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-6 left-0 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-16" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
sbCode = sbCode.replace(oldSb, newSb);
fs.writeFileSync('scratch/Sidebar.js', sbCode);

// 2. App Logo Patch
let appCode = fs.readFileSync('scratch/App.js', 'utf8');
const oldApp = `<div className="relative flex items-center h-12 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-4 -left-2 w-14 h-14 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-40 h-10 bg-white drop-shadow-sm relative z-0 ml-3" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const newApp = `<div className="relative flex items-center h-10 mt-2 pl-2 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-3 -left-1 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-28 h-7 bg-white drop-shadow-sm relative z-0 ml-12" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
appCode = appCode.replace(oldApp, newApp);
fs.writeFileSync('scratch/App.js', appCode);

// 3. VocabFlashcards Patch
let vocabCode = fs.readFileSync('scratch/VocabFlashcards.js', 'utf8');
const oldVocab = `<div className="mt-6 mb-8 p-6 bg-gradient-to-br from-white to-slate-50 dark:from-surfaceDark dark:to-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <i className="fa-solid fa-rocket text-primary text-lg"></i>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed md:text-lg">
                            These are the most important GRE words you need to know. <br/>
                            Every single word comes with <strong className="text-slate-900 dark:text-white">3 powerful synonyms</strong> and <strong className="text-slate-900 dark:text-white">3 strong antonyms</strong>. <br/>
                            Master this list and you’ll multiply your vocabulary by at least <strong className="text-primary font-black text-xl">5×</strong> — turning just <span className="text-primary font-black">{liveVocab.length} words</span> into a massive 3000 plus words.
                        </p>
                    </div>
                </div>`;

const newVocab = `<div className="mt-4 mb-6 p-4 max-w-4xl bg-gradient-to-br from-white to-slate-50 dark:from-surfaceDark dark:to-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden animate-fade-in mx-auto">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="fa-solid fa-rocket text-primary text-sm"></i>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm md:text-base">
                            These are the most important GRE words you need to know. <br/>
                            Every single word comes with <strong className="text-slate-900 dark:text-white">3 powerful synonyms</strong> and <strong className="text-slate-900 dark:text-white">3 strong antonyms</strong>. <br/>
                            Master this list and you’ll multiply your vocabulary by at least <strong className="text-primary font-black text-lg">5×</strong> — turning just <span className="text-primary font-black">{liveVocab.length} words</span> into a massive 3000 plus words.
                        </p>
                    </div>
                </div>`;
vocabCode = vocabCode.replace(oldVocab, newVocab);
fs.writeFileSync('scratch/VocabFlashcards.js', vocabCode);

console.log('All 3 patched in scratch');
