const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const startIndex = code.indexOf('const VocabFlashcards = ({ isPro }) => {');
const endIndex = code.indexOf('const AboutView = () => (');

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find bounds");
    process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

const newVocab = `const VocabFlashcards = ({ isPro }) => {
    const [subDomain, setSubDomain] = useState('GRE Vocabulary');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [deck, setDeck] = useState([]);
    
    const [liveVocab, setLiveVocab] = useState([]);
    const [isFetchingExcel, setIsFetchingExcel] = useState(true);
    const [excelError, setExcelError] = useState(null);
    const [cachedData, setCachedData] = useState({});

    const domains = ["GRE Vocabulary", "Pair of words", "Idioms", "Sentence correction", "Prepositions", "Translations"];

    const getFilePattern = (domain) => {
        switch(domain) {
            case 'GRE Vocabulary': return 'gre';
            case 'Pair of words': return 'pair';
            case 'Idioms': return 'idiom';
            case 'Sentence correction': return 'sentence';
            case 'Prepositions': return 'preposition';
            case 'Translations': return 'translation';
            default: return 'gre';
        }
    };

    useEffect(() => {
        if (cachedData[subDomain]) {
            setLiveVocab(cachedData[subDomain]);
            setIsFetchingExcel(false);
            setExcelError(null);
            return;
        }

        const fetchExcel = async () => {
            setIsFetchingExcel(true);
            setExcelError(null);
            setLiveVocab([]);
            try {
                const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
                const FOLDER_ID = '1fiaZu0HaW-hcclXv5jx7gJG-z2bKwOgw';
                
                const searchRes = await fetch(\`https://www.googleapis.com/drive/v3/files?q='\${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&key=\${API_KEY}\`);
                const searchData = await searchRes.json();
                
                if (searchData.error) throw new Error(searchData.error.message);
                
                const pattern = getFilePattern(subDomain);
                const file = searchData.files.find(f => f.name.toLowerCase().includes(pattern));
                
                if (!file) throw new Error(\`Could not find Excel file for \${subDomain} in your Drive folder.\`);

                let fileUrl;
                if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
                    fileUrl = \`https://www.googleapis.com/drive/v3/files/\${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&key=\${API_KEY}\`;
                } else {
                    fileUrl = \`https://www.googleapis.com/drive/v3/files/\${file.id}?alt=media&key=\${API_KEY}\`;
                }
                const fileRes = await fetch(fileUrl);
                if (!fileRes.ok) throw new Error("Failed to download file. Make sure the folder is shared as 'Anyone with the link'.");
                
                const arrayBuffer = await fileRes.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                
                let allVocab = [];
                
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    data.forEach(row => {
                        if (!row || row.length < 2) return;
                        
                        const rowStr = row.join(' ').toLowerCase();
                        if (rowStr.includes('word') && rowStr.includes('meaning')) return;
                        if (rowStr.includes('sentence') && rowStr.includes('preposition')) return;
                        if (rowStr.includes('incorrect') && rowStr.includes('correct')) return;
                        if (rowStr.includes('urdu') && rowStr.includes('english')) return;
                        if (rowStr.includes('idiom') && rowStr.includes('meaning')) return;
                        if (rowStr.includes('rule 1') || rowStr.includes('rule 2')) return;

                        let word = "";
                        let meaning = "";
                        let example = "";
                        let syn = [];
                        let ant = [];

                        if (subDomain === 'Sentence correction') {
                            if (typeof row[0] === 'number') {
                                word = row[1];
                                meaning = row[2];
                            } else {
                                word = row[0];
                                meaning = row[1];
                            }
                        } else if (subDomain === 'Translations') {
                            word = row[0];
                            meaning = row[1];
                        } else if (subDomain === 'Prepositions') {
                            word = row[0];
                            meaning = row[1];
                        } else if (subDomain === 'Idioms') {
                            word = row[0];
                            meaning = row[1];
                            example = row[2] || "";
                        } else {
                            word = row[0];
                            meaning = row[1];
                            if (row[2]) syn = row[2].toString().split(',').map(s=>s.trim());
                            if (row[3]) ant = row[3].toString().split(',').map(s=>s.trim());
                            if (row[4]) example = row[4];
                        }

                        if (word && meaning) {
                            allVocab.push({
                                word: String(word).trim(),
                                meaning: String(meaning).trim(),
                                synonyms: syn,
                                antonyms: ant,
                                example: String(example || "").trim()
                            });
                        }
                    });
                });
                
                if (allVocab.length > 0) {
                    setLiveVocab(allVocab);
                    setCachedData(prev => ({ ...prev, [subDomain]: allVocab }));
                } else {
                    throw new Error(\`No valid items found in the Excel sheet for \${subDomain}.\`);
                }
            } catch (err) {
                console.error("Excel fetch failed, using fallback:", err);
                setExcelError(err.message);
                setLiveVocab([]);
            } finally {
                setIsFetchingExcel(false);
            }
        };
        fetchExcel();
    }, [subDomain, cachedData]);

    const activeData = liveVocab.length > 0 ? liveVocab : (subDomain === 'GRE Vocabulary' ? sampleVocab : []);

    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const isFullListDomain = ['Translations', 'Idioms', 'Prepositions', 'Sentence correction'].includes(subDomain);

    const handleStart = (category) => {
        if (!isPro && category !== 'All' && category !== 'Random' && !['A','B','C'].includes(category)) {
            alert('Unlock Pro to access items for letters D to Z. Click on Past Papers or Current Affairs to see how to upgrade.');
            return;
        }
        let filtered = [];
        if (category === 'Random') {
            filtered = [...activeData].sort(() => 0.5 - Math.random());
        } else if (category === 'All') {
            filtered = activeData;
        } else {
            filtered = activeData.filter(v => v.word.toUpperCase().startsWith(category));
        }
        if (filtered.length > 0) {
            setDeck(filtered);
            setSelectedCategory(category);
            setCurrentIndex(0);
            setFlipped(false);
        } else {
            alert('No cards available for this category yet!');
        }
    };

    const getAvailableLetters = () => {
        const available = new Set(activeData.map(v => v.word.charAt(0).toUpperCase()));
        return available;
    };
    const availableLetters = getAvailableLetters();

    if (isFetchingExcel && !cachedData[subDomain]) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center">
                <i className="fa-solid fa-cloud-arrow-down text-primary animate-bounce text-6xl mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Syncing Live Excel Data...</h2>
                <p className="text-slate-500 mt-2">Fetching \${subDomain} from Google Drive...</p>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Study Flashcards</h2>
                
                {/* Domain Tabs */}
                <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
                    {domains.map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => { setSubDomain(tab); setSelectedCategory(null); }} 
                            className={\`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-all \${subDomain === tab ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}\`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="mb-8 p-4 rounded-xl border flex items-start gap-3 text-sm font-medium bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {liveVocab.length > 0 
                        ? <><i className="fa-solid fa-circle-check text-green-500 text-lg mt-0.5"></i> <div>Live Synced from Excel: <strong className="text-green-600 dark:text-green-400">{liveVocab.length} items</strong> loaded for {subDomain}!</div>
                          {subDomain === 'GRE Vocabulary' && (
                              <div className="mt-4 mb-2 p-4 max-w-4xl bg-gradient-to-br from-white to-slate-50 dark:from-surfaceDark dark:to-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden animate-fade-in">
                                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                  <div className="flex gap-3 items-start">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <i className="fa-solid fa-rocket text-primary text-sm"></i>
                                      </div>
                                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm md:text-base">
                                          These are the most important GRE words you need to know. <br/>
                                          Every single word comes with <strong className="text-slate-900 dark:text-white">3 powerful synonyms</strong> and <strong className="text-slate-900 dark:text-white">3 strong antonyms</strong>. <br/>
                                          Master this list and you'll multiply your vocabulary by at least <strong className="text-primary font-black text-lg">5X</strong> - turning just <span className="text-primary font-black">{liveVocab.length} words</span> into a massive collection.
                                      </p>
                                  </div>
                              </div>
                          )}
                          </>
                        : <><i className="fa-solid fa-circle-exclamation text-amber-500 text-lg mt-0.5"></i> <div><strong>Excel Sync Failed:</strong> {excelError} <br/><span className="text-slate-400 font-normal">{subDomain === 'GRE Vocabulary' ? \`Using \${sampleVocab.length} default words.\` : 'No default data available for this section.'}</span></div></>}
                </div>
                
                {isFullListDomain ? (
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                        <button 
                            onClick={() => handleStart('All')}
                            disabled={activeData.length === 0}
                            className="flex-1 p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-layer-group"></i> Start All (A-Z)
                        </button>
                        <button 
                            onClick={() => handleStart('Random')}
                            disabled={activeData.length === 0}
                            className="flex-1 p-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-shuffle"></i> Start Random Mix
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <button 
                            onClick={() => handleStart('Random')}
                            disabled={activeData.length === 0}
                            className="col-span-2 md:col-span-4 lg:col-span-6 p-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-shuffle"></i> Start Random Mix
                        </button>
                        
                        {letters.map(letter => {
                            const hasWords = availableLetters.has(letter);
                            return (
                                <button
                                    key={letter}
                                    onClick={() => hasWords && handleStart(letter)}
                                    disabled={!hasWords}
                                    className={\`p-4 rounded-2xl border-2 font-bold transition-all text-center \${hasWords ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:border-primary hover:text-primary shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 text-slate-400/50 opacity-50 cursor-not-allowed'}\`}
                                >
                                    {letter} Series
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const currentCard = deck[currentIndex];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold flex items-center gap-2 transition-colors"
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Categories
                </button>
                <div className="text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-sm">
                    {subDomain} | {selectedCategory} : {currentIndex + 1} / {deck.length}
                </div>
            </div>

            <div 
                className="w-full aspect-[4/3] md:aspect-[2/1] relative perspective-1000 cursor-pointer group"
                onClick={() => setFlipped(!flipped)}
            >
                <div className={\`w-full h-full transition-transform duration-500 transform-style-3d \${flipped ? 'rotate-y-180' : ''}\`}>
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white dark:bg-surfaceDark rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center p-6 md:p-8 text-center overflow-y-auto scrollbar-hide">
                        <div className="absolute top-6 right-6 text-slate-300 dark:text-slate-600">
                            <i className="fa-solid fa-hand-pointer animate-pulse text-xl"></i>
                        </div>
                        <div className="flex flex-col min-h-full justify-center w-full">
                            <h3 className={\`\${currentCard.word.length > 50 ? 'text-2xl md:text-3xl' : 'text-4xl md:text-6xl'} font-black text-slate-800 dark:text-white mb-4 tracking-tight leading-snug\`}>{currentCard.word}</h3>
                            <p className="text-slate-400 font-medium mt-auto">Click to reveal details</p>
                        </div>
                    </div>
                    
                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-primary to-primaryDark text-white rounded-3xl shadow-2xl rotate-y-180 flex flex-col p-6 md:p-10 overflow-y-auto scrollbar-hide">
                        <div className="flex flex-col min-h-full justify-center">
                            <h3 className={\`\${currentCard.word.length > 30 ? 'text-lg md:text-xl' : 'text-2xl md:text-4xl'} font-black mb-2 opacity-90 border-b border-white/20 pb-4\`}>{currentCard.word}</h3>
                            <p className={\`\${currentCard.meaning.length > 80 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-medium mb-6 leading-relaxed\`}>{currentCard.meaning}</p>
                            
                            {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2">Synonyms</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentCard.synonyms.map((s,i) => <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">{s}</span>)}
                                    </div>
                                </div>
                            )}
                            
                            {currentCard.antonyms && currentCard.antonyms.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2">Antonyms</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentCard.antonyms.map((a,i) => <span key={i} className="px-3 py-1 bg-black/10 rounded-full text-sm font-medium">{a}</span>)}
                                    </div>
                                </div>
                            )}

                            {currentCard.example && (
                                <div className="bg-black/20 p-4 rounded-xl mt-auto">
                                    <p className="italic font-medium">"{currentCard.example}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-8">
                <button 
                    onClick={() => { setFlipped(false); setTimeout(() => setCurrentIndex(prev => Math.max(0, prev - 1)), 150); }}
                    disabled={currentIndex === 0}
                    className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                >
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <div className="text-slate-400 font-bold">
                    Use arrows to navigate
                </div>
                <button 
                    onClick={() => { setFlipped(false); setTimeout(() => setCurrentIndex(prev => Math.min(deck.length - 1, prev + 1)), 150); }}
                    disabled={currentIndex === deck.length - 1}
                    className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                >
                    <i className="fa-solid fa-arrow-right text-xl"></i>
                </button>
            </div>
        </div>
    );
};
`

fs.writeFileSync('src/app/page.js', before + newVocab + after);
console.log('Successfully patched flashcards logic');
