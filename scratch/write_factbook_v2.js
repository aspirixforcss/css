const fs = require('fs');

const code = `const FactBook = ({ facts, setFacts }) => {
    const [newFactTitle, setNewFactTitle] = useState('');
    const [newFactContent, setNewFactContent] = useState('');
    const [newFactTag, setNewFactTag] = useState('Economy');
    const [filterTag, setFilterTag] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);

    const tags = ["Economy", "Budget", "Education", "Security", "Health", "Gender", "Crime", "Governance", "Climate", "Tech", "International Relations", "Society", "History", "Law", "Energy", "Infrastructure", "Agriculture", "Other"];

    const handleSave = () => {
        if (!newFactTitle || !newFactContent) return;
        setFacts([{ id: Date.now().toString(), title: newFactTitle, content: newFactContent, tag: newFactTag, date: new Date().toLocaleDateString() }, ...facts]);
        setNewFactTitle('');
        setNewFactContent('');
        setShowAddModal(false);
    };
    const removeFact = (id) => {
        setFacts(facts.filter(f => f.id !== id));
    };

    const filteredFacts = filterTag === 'All' ? facts : facts.filter(f => f.tag === filterTag);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                        <i className="fa-solid fa-book-bookmark text-primary"></i> 
                        My Fact Book
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Your personal collection of rich facts, figures, and data points.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 flex items-center gap-2">
                    <i className="fa-solid fa-plus"></i> Add New Fact
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
                <button 
                    onClick={() => setFilterTag('All')}
                    className={\`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-colors \${filterTag === 'All' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-surfaceDark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}\`}
                >
                    All Categories
                </button>
                {tags.map(t => (
                    <button 
                        key={t}
                        onClick={() => setFilterTag(t)}
                        className={\`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-colors \${filterTag === t ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-surfaceDark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}\`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Facts Masonry Grid */}
            {filteredFacts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-folder-open text-3xl text-slate-400"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No facts found</h3>
                    <p className="text-slate-500 max-w-sm">
                        {facts.length === 0 ? "Your Fact Book is completely empty. Start adding statistics and figures!" : "No facts found in this category. Try selecting another tag."}
                    </p>
                    {facts.length === 0 && (
                        <button onClick={() => setShowAddModal(true)} className="mt-6 text-primary font-bold hover:underline">
                            + Add Your First Fact
                        </button>
                    )}
                </div>
            ) : (
                <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                    {filteredFacts.map(fact => (
                        <div key={fact.id} className="bg-white dark:bg-surfaceDark p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group break-inside-avoid">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-lg self-start">
                                        {fact.tag || 'Other'}
                                    </span>
                                    <h4 className="font-extrabold text-xl text-slate-800 dark:text-white leading-tight">{fact.title}</h4>
                                </div>
                                <button onClick={() => removeFact(fact.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                                    <i className="fa-solid fa-trash text-sm"></i>
                                </button>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium mb-4">{fact.content}</p>
                            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                <i className="fa-regular fa-calendar-check"></i> {fact.date}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-surfaceDark w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white flex items-center gap-2"><i className="fa-solid fa-plus text-primary"></i> Add New Fact</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex justify-center items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fact Title</label>
                                    <input type="text" placeholder="e.g. GDP Growth 2024" value={newFactTitle} onChange={e => setNewFactTitle(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-primary/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Tag</label>
                                    <select value={newFactTag} onChange={e => setNewFactTag(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-primary/50 transition-colors">
                                        {tags.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Content & Statistics</label>
                                <textarea placeholder="Write your statistics, bullet points, and references here..." value={newFactContent} onChange={e => setNewFactContent(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-700 dark:text-slate-300 outline-none h-48 resize-none focus:border-primary/50 transition-colors"></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button onClick={handleSave} className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primaryDark transition-colors flex items-center gap-2">
                                    <i className="fa-solid fa-save"></i> Save to Fact Book
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}`;

fs.writeFileSync('scratch/FactBook.js', code);
console.log('FactBook completely redesigned');
