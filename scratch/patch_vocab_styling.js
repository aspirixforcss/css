const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const startIndex = code.indexOf('    const currentCard = deck[currentIndex];');
const endIndex = code.indexOf('};', startIndex) + 2;

const newRender = `    const currentCard = deck[currentIndex];
    
    const handleNext = () => {
        setFlipped(false); 
        setTimeout(() => setCurrentIndex(prev => (prev + 1) % deck.length), 150);
    };

    const handlePrev = () => {
        setFlipped(false); 
        setTimeout(() => setCurrentIndex(prev => (prev - 1 + deck.length) % deck.length), 150);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setSelectedCategory(null)} className="text-slate-500 hover:text-primary font-bold flex items-center gap-2 transition-colors">
                    <i className="fa-solid fa-arrow-left"></i> Exit Series
                </button>
                <div className="font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-lg border border-primary/20">
                    {subDomain} | {selectedCategory === 'Random' ? 'Random Mix' : (selectedCategory === 'All' ? 'A-Z Series' : \`\${selectedCategory} Series\`)}
                </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center mb-10 w-full">
                <div 
                    onClick={() => setFlipped(!flipped)}
                    className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01] min-h-[400px] relative overflow-hidden"
                >
                    <div className={\`w-full h-full flex flex-col items-center justify-center transition-opacity duration-300 \${flipped ? 'opacity-0 hidden' : 'opacity-100'}\`}>
                        <h3 className={\`\${currentCard.word.length > 50 ? 'text-2xl md:text-3xl' : 'text-5xl md:text-6xl'} font-black text-primary mb-4 leading-snug\`}>{currentCard.word}</h3>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mt-8 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full"><i className="fa-solid fa-hand-pointer text-primary"></i> Tap to reveal</p>
                    </div>
                    
                    <div className={\`w-full h-full flex flex-col items-start justify-center transition-opacity duration-300 \${!flipped ? 'opacity-0 hidden' : 'opacity-100'} text-left overflow-y-auto scrollbar-hide\`}>
                        <h4 className={\`\${currentCard.word.length > 40 ? 'text-lg md:text-xl' : 'text-3xl'} font-black text-slate-800 dark:text-white mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4 w-full text-center md:text-left leading-relaxed\`}>{currentCard.word}</h4>
                        
                        <div className="mb-6 w-full bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider block mb-1">{subDomain === 'Translations' ? 'Translation' : (subDomain === 'Sentence correction' ? 'Correction' : 'Meaning')}</span>
                            <p className={\`\${currentCard.meaning.length > 80 ? 'text-md md:text-lg' : 'text-lg md:text-xl'} font-semibold text-slate-700 dark:text-slate-200 leading-relaxed\`}>{currentCard.meaning}</p>
                        </div>
                        
                        {(currentCard.synonyms?.length > 0 || currentCard.antonyms?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                                {currentCard.synonyms?.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                                        <span className="font-bold text-green-600 dark:text-green-400 text-xs uppercase tracking-wider block mb-1">Synonyms</span>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{currentCard.synonyms.join(', ')}</p>
                                    </div>
                                )}
                                {currentCard.antonyms?.length > 0 && (
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                        <span className="font-bold text-red-600 dark:text-red-400 text-xs uppercase tracking-wider block mb-1">Antonyms</span>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{currentCard.antonyms.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentCard.example && currentCard.example.trim().length > 0 && (
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl italic text-slate-600 dark:text-slate-300 border-l-4 border-primary mt-auto">
                                "{currentCard.example}"
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-6 mt-10">
                    <button onClick={handlePrev} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-md text-xl transform hover:scale-110 active:scale-95">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <span className="font-bold text-slate-500 text-lg bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-full shadow-inner">{currentIndex + 1} / {deck.length}</span>
                    <button onClick={handleNext} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-md text-xl transform hover:scale-110 active:scale-95">
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};`;

code = code.replace(code.substring(startIndex, endIndex), newRender);
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed VocabFlashcards render styling');
