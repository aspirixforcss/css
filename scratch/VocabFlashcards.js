const VocabFlashcards = ({ isPro }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [deck, setDeck] = useState([]);
    
    const [liveVocab, setLiveVocab] = useState([]);
    const [isFetchingExcel, setIsFetchingExcel] = useState(true);
    const [excelError, setExcelError] = useState(null);

    useEffect(() => {
        const fetchExcel = async () => {
            try {
                const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
                const FOLDER_ID = '1fiaZu0HaW-hcclXv5jx7gJG-z2bKwOgw';
                
                const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&key=${API_KEY}`);
                const searchData = await searchRes.json();
                
                if (searchData.error) throw new Error(searchData.error.message);
                
                const file = searchData.files.find(f => f.name.toLowerCase().includes('gre') || f.name.toLowerCase().includes('vocab') || f.mimeType === 'application/vnd.google-apps.spreadsheet' || f.name.includes('.xlsx'));
                if (!file) throw new Error("Could not find 'GRE frequent words' Excel file in your Drive folder.");

                let fileUrl;
                if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
                    fileUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&key=${API_KEY}`;
                } else {
                    fileUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
                }
                const fileRes = await fetch(fileUrl);
                if (!fileRes.ok) throw new Error("Failed to download file. Make sure the folder is shared as 'Anyone with the link'.");
                
                const arrayBuffer = await fileRes.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                
                let allVocab = [];
                
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet);
                    
                    data.forEach(row => {
                        const word = row.Word || row.word || row.WORD || "";
                        if (word.trim()) {
                            const syn = row.Synonyms || row.synonyms || row.SYNONYMS || "";
                            const ant = row.Antonyms || row.antonyms || row.ANTONYMS || "";
                            allVocab.push({
                                word: word.trim(),
                                meaning: row.Meaning || row.meaning || row.MEANING || "No meaning provided",
                                synonyms: syn ? syn.toString().split(',').map(s=>s.trim()).filter(Boolean) : [],
                                antonyms: ant ? ant.toString().split(',').map(s=>s.trim()).filter(Boolean) : [],
                                example: row.Example || row.example || row.EXAMPLE || "No example provided"
                            });
                        }
                    });
                });
                
                if (allVocab.length > 0) {
                    setLiveVocab(allVocab);
                } else {
                    throw new Error("No valid words found in the Excel sheet columns (Ensure column is named 'Word').");
                }
            } catch (err) {
                console.error("Excel fetch failed, using fallback:", err);
                setExcelError(err.message);
            } finally {
                setIsFetchingExcel(false);
            }
        };
        fetchExcel();
    }, []);

    const activeData = liveVocab.length > 0 ? liveVocab : sampleVocab;

    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleStart = (category) => {
        if (!isPro && !['A','B','C'].includes(category)) {
            alert('Unlock Pro to access vocabulary for letters D to Z. Click on Past Papers or Current Affairs to see how to upgrade.');
            return;
        }
        let filtered = [];
        if (category === 'Random') {
            filtered = [...activeData].sort(() => 0.5 - Math.random());
        } else {
            filtered = activeData.filter(v => v.word.toUpperCase().startsWith(category));
        }
        if (filtered.length > 0) {
            setDeck(filtered);
            setSelectedCategory(category);
            setCurrentIndex(0);
            setFlipped(false);
        }
    };

    const getAvailableLetters = () => {
        const available = new Set(activeData.map(v => v.word.charAt(0).toUpperCase()));
        return available;
    };
    const availableLetters = getAvailableLetters();

    if (isFetchingExcel) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center">
                <i className="fa-solid fa-cloud-arrow-down text-primary animate-bounce text-6xl mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Syncing Live Excel Data...</h2>
                <p className="text-slate-500 mt-2">Connecting to your Google Drive folder...</p>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Vocabulary Flashcards</h2>
                <div className="mb-8 p-4 rounded-xl border flex items-start gap-3 text-sm font-medium bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {liveVocab.length > 0 
                        ? <><i className="fa-solid fa-circle-check text-green-500 text-lg mt-0.5"></i> <div>Live Synced from Excel: <strong className="text-green-600 dark:text-green-400">{liveVocab.length} words</strong> loaded!</div>

                {/* New GRE Copy */}
                <div className="mt-4 mb-6 p-4 max-w-4xl bg-gradient-to-br from-white to-slate-50 dark:from-surfaceDark dark:to-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden animate-fade-in mx-auto">
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
                </div>
</>
                        : <><i className="fa-solid fa-circle-exclamation text-amber-500 text-lg mt-0.5"></i> <div><strong>Excel Sync Failed:</strong> {excelError} <br/><span className="text-slate-400 font-normal">Using {sampleVocab.length} default words. (Did you change your Google Drive folder access to "Anyone with the link"?)</span></div></>}
                </div>
                
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
                                className={`p-4 rounded-2xl border-2 font-bold transition-all text-center ${hasWords ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:border-primary hover:text-primary shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 text-slate-400/50 opacity-50 cursor-not-allowed'}`}
                            >
                                {letter} Series
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const handleNext = () => {
        setFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % deck.length);
    };

    const handlePrev = () => {
        setFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    };

    const card = deck[currentIndex];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setSelectedCategory(null)} className="text-slate-500 hover:text-primary font-bold flex items-center gap-2 transition-colors">
                    <i className="fa-solid fa-arrow-left"></i> Exit Series
                </button>
                <div className="font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-lg border border-primary/20">
                    {selectedCategory === 'Random' ? 'Random Mix' : `${selectedCategory} Series`}
                </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center mb-10 w-full">
                <div 
                    onClick={() => setFlipped(!flipped)}
                    className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01] min-h-[400px] relative overflow-hidden"
                >
                    <div className={`w-full h-full flex flex-col items-center justify-center transition-opacity duration-300 ${flipped ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        <h3 className="text-5xl md:text-6xl font-black text-primary mb-4">{card.word}</h3>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mt-8 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full"><i className="fa-solid fa-hand-pointer text-primary"></i> Tap to reveal</p>
                    </div>
                    
                    <div className={`w-full h-full flex flex-col items-start justify-center transition-opacity duration-300 ${!flipped ? 'opacity-0 hidden' : 'opacity-100'} text-left`}>
                        <h4 className="text-3xl font-black text-slate-800 dark:text-white mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4 w-full text-center md:text-left">{card.word}</h4>
                        
                        <div className="mb-6 w-full bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider block mb-1">Meaning</span>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{card.meaning}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                                <span className="font-bold text-green-600 dark:text-green-400 text-xs uppercase tracking-wider block mb-1">Synonyms</span>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.synonyms?.join(', ') || 'N/A'}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                <span className="font-bold text-red-600 dark:text-red-400 text-xs uppercase tracking-wider block mb-1">Antonyms</span>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.antonyms?.join(', ') || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl italic text-slate-600 dark:text-slate-300 border-l-4 border-primary">
                            "{card.example}"
                        </div>
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
}