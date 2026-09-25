const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldHandleStartBlock = `    const isFullListDomain = ['Translations', 'Idioms', 'Prepositions', 'Sentence correction'].includes(subDomain);

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
    };`;

const newHandleStartBlock = `    const isFullListDomain = ['Translations', 'Idioms', 'Prepositions'].includes(subDomain);
    const sentenceRules = subDomain === 'Sentence correction' ? Array.from(new Set(activeData.map(v => v.rule))) : [];

    const handleStart = (category) => {
        if (!isPro && category !== 'All' && category !== 'Random' && !['A','B','C'].includes(category) && subDomain !== 'Sentence correction') {
            alert('Unlock Pro to access items for letters D to Z. Click on Past Papers or Current Affairs to see how to upgrade.');
            return;
        }
        let filtered = [];
        if (category === 'Random') {
            filtered = [...activeData].sort(() => 0.5 - Math.random());
        } else if (category === 'All') {
            filtered = activeData;
        } else if (subDomain === 'Sentence correction') {
            filtered = activeData.filter(v => v.rule === category);
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
    };`;

code = code.replace(oldHandleStartBlock, newHandleStartBlock);

const oldUIButtons = `                {isFullListDomain ? (
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
                ) : (`;

const newUIButtons = `                {subDomain === 'Sentence correction' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin pb-10">
                        <button 
                            onClick={() => handleStart('Random')}
                            disabled={activeData.length === 0}
                            className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50 mb-2"
                        >
                            <i className="fa-solid fa-shuffle"></i> Mix All Rules (Random Practice)
                        </button>
                        {sentenceRules.map((rule, idx) => {
                            const ruleShort = rule.split(':')[0] || \`Rule \${idx + 1}\`;
                            const ruleName = rule.split(':').slice(1).join(':') || rule;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleStart(rule)}
                                    className="p-4 rounded-2xl border-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:border-primary hover:text-primary shadow-sm font-bold transition-all text-left flex flex-col gap-1"
                                >
                                    <span className="text-primary text-sm uppercase tracking-wider">{ruleShort}</span>
                                    <span className="w-full block font-semibold">{ruleName.trim()}</span>
                                </button>
                            )
                        })}
                    </div>
                ) : isFullListDomain ? (
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
                ) : (`;

code = code.replace(oldUIButtons, newUIButtons);
fs.writeFileSync('src/app/page.js', code);
