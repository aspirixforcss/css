const fs = require('fs');
let code = fs.readFileSync('scratch/App.js', 'utf8');

// Pre-seeded facts
const factStarter = `
            setFacts([
                { id: "1", title: "Pakistan GDP Growth", content: "World Bank projects Pakistan's economic growth to remain modest at 1.8% in FY24.", date: new Date().toLocaleDateString(), tag: "Economy" },
                { id: "2", title: "Education Budget", content: "Federal budget allocation for higher education often falls below the 4% of GDP recommended by UNESCO.", date: new Date().toLocaleDateString(), tag: "Education" },
                { id: "3", title: "Climate Vulnerability", content: "Pakistan ranks among the top 10 most vulnerable countries to climate change despite contributing less than 1% to global emissions.", date: new Date().toLocaleDateString(), tag: "Climate" },
                { id: "4", title: "Women in Parliament", content: "Women hold approximately 20% of the seats in the National Assembly of Pakistan.", date: new Date().toLocaleDateString(), tag: "Gender" },
                { id: "5", title: "Cybersecurity Policy", content: "Pakistan introduced a comprehensive National Cyber Security Policy to secure its digital infrastructure in 2021.", date: new Date().toLocaleDateString(), tag: "Security" },
                { id: "6", title: "Infant Mortality", content: "Pakistan has one of the highest infant mortality rates in South Asia, posing major public health challenges.", date: new Date().toLocaleDateString(), tag: "Health" },
                { id: "7", title: "Agriculture Contribution", content: "Agriculture contributes around 22.7% to Pakistan's GDP and employs roughly 37.4% of the national labor force.", date: new Date().toLocaleDateString(), tag: "Agriculture" }
            ]);
`;

code = code.replace(
    'if (savedFacts) setFacts(JSON.parse(savedFacts));',
    `if (savedFacts && JSON.parse(savedFacts).length > 0) { setFacts(JSON.parse(savedFacts)); } else { ${factStarter} }`
);


const factModalState = `
    const [factModalOpen, setFactModalOpen] = useState(false);
    const [factModalText, setFactModalText] = useState('');
    const [factModalTitle, setFactModalTitle] = useState('');
    const [factModalTag, setFactModalTag] = useState('Economy');
    const factTags = ["Economy", "Budget", "Education", "Security", "Health", "Gender", "Crime", "Governance", "Climate", "Tech", "International Relations", "Society", "History", "Law", "Energy", "Infrastructure", "Agriculture", "Other"];
`;

code = code.replace(
    'const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: \'\' });',
    `const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });\n${factModalState}`
);

// Replace the tooltip button action to open the modal
const newTooltip = `
            {tooltip.visible && !factModalOpen && (
                <div 
                    className="fixed z-[9999] bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl font-bold flex items-center gap-2 cursor-pointer hover:bg-primary transition-colors transform -translate-x-1/2 -translate-y-full"
                    style={{ top: tooltip.y - 10, left: tooltip.x }}
                    onMouseDown={(e) => {
                        e.preventDefault(); 
                        setFactModalText(tooltip.text);
                        setFactModalTitle('Snippet - ' + new Date().toLocaleTimeString());
                        setFactModalOpen(true);
                        setTooltip({ visible: false, x: 0, y: 0, text: '' });
                    }}
                >
                    <i className="fa-solid fa-bookmark text-yellow-400"></i> Add to Fact Book
                    <div className="absolute w-3 h-3 bg-slate-900 rotate-45 left-1/2 -bottom-1 transform -translate-x-1/2"></div>
                </div>
            )}
`;

code = code.replace(/\{tooltip\.visible && \([\s\S]*?\)\}/, newTooltip.trim());


const factSaveModalUI = `
            {factModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-surfaceDark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center gap-2"><i className="fa-solid fa-book-bookmark text-primary"></i> Save to Fact Book</h3>
                            <button onClick={() => setFactModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex justify-center items-center rounded-full bg-slate-200 dark:bg-slate-700">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fact Title</label>
                                <input type="text" value={factModalTitle} onChange={e => setFactModalTitle(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Tag</label>
                                <select value={factModalTag} onChange={e => setFactModalTag(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 outline-none">
                                    {factTags.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Highlighted Content</label>
                                <textarea value={factModalText} onChange={e => setFactModalText(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 outline-none h-32 resize-none"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setFactModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button onClick={() => {
                                    if(!factModalTitle || !factModalText) return;
                                    setFacts([{ id: Date.now().toString(), title: factModalTitle, content: factModalText, tag: factModalTag, date: new Date().toLocaleDateString() }, ...facts]);
                                    setFactModalOpen(false);
                                    alert("Successfully Saved to Fact Book!");
                                }} className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primaryDark transition-colors flex items-center gap-2">
                                    <i className="fa-solid fa-save"></i> Save Fact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
`;

code = code.replace('<CountdownTimerModal', factSaveModalUI + '\n            <CountdownTimerModal');

fs.writeFileSync('scratch/App.js', code);
console.log('App patched');
