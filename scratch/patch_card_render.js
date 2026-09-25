const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldFront = `                        <h3 className={\`\${currentCard.word.length > 50 ? 'text-2xl md:text-3xl' : 'text-5xl md:text-6xl'} font-black text-primary mb-4 leading-snug\`}>{currentCard.word}</h3>`;
const newFront = `                        {subDomain === 'Pair of words' && currentCard.word.includes('/') ? (
                            <h3 className={\`\${currentCard.word.length > 50 ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'} font-black mb-4 leading-snug\`}>
                                <span className="text-blue-600 dark:text-blue-400">{currentCard.word.split('/')[0].trim()}</span>
                                <span className="text-slate-300 dark:text-slate-600 mx-4">/</span>
                                <span className="text-purple-600 dark:text-purple-400">{currentCard.word.split('/')[1].trim()}</span>
                            </h3>
                        ) : (
                            <h3 className={\`\${currentCard.word.length > 50 ? 'text-2xl md:text-3xl' : 'text-5xl md:text-6xl'} font-black text-primary mb-4 leading-snug\`}>{currentCard.word}</h3>
                        )}`;

code = code.replace(oldFront, newFront);

const oldBackWord = `                        <h4 className={\`\${currentCard.word.length > 40 ? 'text-lg md:text-xl' : 'text-3xl'} font-black text-slate-800 dark:text-white mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4 w-full text-center md:text-left leading-relaxed\`}>{currentCard.word}</h4>`;
const newBackWord = `                        {subDomain === 'Pair of words' && currentCard.word.includes('/') ? (
                            <h4 className={\`\${currentCard.word.length > 40 ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-black mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4 w-full text-center md:text-left leading-relaxed\`}>
                                <span className="text-blue-600 dark:text-blue-400">{currentCard.word.split('/')[0].trim()}</span>
                                <span className="text-slate-300 dark:text-slate-600 mx-3">/</span>
                                <span className="text-purple-600 dark:text-purple-400">{currentCard.word.split('/')[1].trim()}</span>
                            </h4>
                        ) : (
                            <h4 className={\`\${currentCard.word.length > 40 ? 'text-lg md:text-xl' : 'text-3xl'} font-black text-slate-800 dark:text-white mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4 w-full text-center md:text-left leading-relaxed\`}>{currentCard.word}</h4>
                        )}`;

code = code.replace(oldBackWord, newBackWord);

const oldBackMeaning = `                        <div className="mb-6 w-full bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider block mb-1">{subDomain === 'Translations' ? 'Translation' : (subDomain === 'Sentence correction' ? 'Correction' : 'Meaning')}</span>
                            <p className={\`\${currentCard.meaning.length > 80 ? 'text-md md:text-lg' : 'text-lg md:text-xl'} font-semibold text-slate-700 dark:text-slate-200 leading-relaxed\`}>{currentCard.meaning}</p>
                        </div>`;

const newBackMeaning = `                        {subDomain === 'Pair of words' ? (
                            <div className="w-full flex flex-col gap-4 mb-6">
                                {currentCard.meaning.split('\\n').map((m, idx) => {
                                    const isFirst = idx === 0;
                                    const titleColor = isFirst ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400';
                                    const bgColor = isFirst ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-purple-50 dark:bg-purple-900/10';
                                    const borderColor = isFirst ? 'border-blue-100 dark:border-blue-900/20' : 'border-purple-100 dark:border-purple-900/20';
                                    
                                    const parts = m.split(':');
                                    const wordPart = parts.length > 1 ? parts[0] : (isFirst ? 'Word 1' : 'Word 2');
                                    const meaningText = parts.length > 1 ? parts.slice(1).join(':') : m;
                                    
                                    const exampleLine = (currentCard.example || '').split('\\n')[idx] || '';
                                    const exParts = exampleLine.split(':');
                                    const exampleText = exParts.length > 1 ? exParts.slice(1).join(':') : exampleLine;

                                    return (
                                        <div key={idx} className={\`p-4 rounded-2xl border \${bgColor} \${borderColor}\`}>
                                            <span className={\`font-bold \${titleColor} text-xs uppercase tracking-wider block mb-2\`}>{wordPart.trim()}</span>
                                            <p className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 leading-relaxed mb-4">{meaningText.trim()}</p>
                                            {exampleText && exampleText.trim() && (
                                                <div className="italic text-slate-600 dark:text-slate-400 text-sm md:text-base border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-1">
                                                    "{exampleText.trim()}"
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="mb-6 w-full bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider block mb-1">{subDomain === 'Translations' ? 'Translation' : (subDomain === 'Sentence correction' ? 'Correction' : 'Meaning')}</span>
                                <p className={\`\${currentCard.meaning.length > 80 ? 'text-md md:text-lg' : 'text-lg md:text-xl'} font-semibold text-slate-700 dark:text-slate-200 leading-relaxed\`}>{currentCard.meaning}</p>
                            </div>
                        )}`;

code = code.replace(oldBackMeaning, newBackMeaning);

const oldExample = `                        {currentCard.example && currentCard.example.trim().length > 0 && (
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl italic text-slate-600 dark:text-slate-300 border-l-4 border-primary mt-auto">
                                "{currentCard.example}"
                            </div>
                        )}`;

const newExample = `                        {subDomain !== 'Pair of words' && currentCard.example && currentCard.example.trim().length > 0 && (
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl italic text-slate-600 dark:text-slate-300 border-l-4 border-primary mt-auto">
                                "{currentCard.example}"
                            </div>
                        )}`;

code = code.replace(oldExample, newExample);

fs.writeFileSync('src/app/page.js', code);
