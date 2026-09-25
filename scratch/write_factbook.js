const fs = require('fs');

const code = `const FactBook = ({ facts, setFacts }) => {
    const [newFactTitle, setNewFactTitle] = useState('');
    const [newFactContent, setNewFactContent] = useState('');
    const [newFactTag, setNewFactTag] = useState('Economy');
    const [filterTag, setFilterTag] = useState('All');

    const tags = ["Economy", "Budget", "Education", "Security", "Health", "Gender", "Crime", "Governance", "Climate", "Tech", "International Relations", "Society", "History", "Law", "Energy", "Infrastructure", "Agriculture", "Other"];

    const handleSave = () => {
        if (!newFactTitle || !newFactContent) return;
        setFacts([{ id: Date.now(), title: newFactTitle, content: newFactContent, tag: newFactTag, date: new Date().toLocaleDateString() }, ...facts]);
        setNewFactTitle('');
        setNewFactContent('');
    };
    const removeFact = (id) => {
        setFacts(facts.filter(f => f.id !== id));
    };

    const filteredFacts = filterTag === 'All' ? facts : facts.filter(f => f.tag === filterTag);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full h-full flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 flex flex-col">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Fact Book</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Create MS-Word style rich facts and figures notes.</p>
                <div className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col flex-1">
                    <input type="text" placeholder="Fact Title (e.g. GDP Growth 2024)" value={newFactTitle} onChange={e => setNewFactTitle(e.target.value)} className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 bg-transparent py-3 mb-4 outline-none text-slate-800 dark:text-white placeholder:text-slate-400" />
                    
                    <select value={newFactTag} onChange={e => setNewFactTag(e.target.value)} className="w-full mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 outline-none">
                        {tags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <textarea placeholder="Write your detailed facts, statistics, and references here..." value={newFactContent} onChange={e => setNewFactContent(e.target.value)} className="flex-1 w-full resize-none bg-transparent outline-none text-slate-600 dark:text-slate-300 leading-relaxed min-h-[250px]"></textarea>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                            <i className="fa-solid fa-save mr-2"></i> Save Fact
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Saved Facts & Figures</h3>
                    <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="p-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 outline-none max-w-[150px]">
                        <option value="All">All Categories</option>
                        {tags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                    {filteredFacts.length === 0 ? (
                        <div className="text-center p-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-500 font-medium">
                            {facts.length === 0 ? "No facts added yet. Start typing on the left!" : "No facts found in this category."}
                        </div>
                    ) : (
                        filteredFacts.map(fact => (
                            <div key={fact.id} className="bg-white dark:bg-surfaceDark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{fact.title}</h4>
                                        <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md inline-block self-start">{fact.tag || 'Other'}</span>
                                    </div>
                                    <button onClick={() => removeFact(fact.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap mt-2">{fact.content}</p>
                                <div className="mt-3 text-xs font-semibold text-slate-400 text-right">{fact.date}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}`;

fs.writeFileSync('scratch/FactBook.js', code);
console.log('Rewritten FactBook');
