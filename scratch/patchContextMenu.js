const fs = require('fs');
let code = fs.readFileSync('scratch/App.js', 'utf8');

// Inject state
code = code.replace(
    'const [dailyStreak, setDailyStreak] = useState(0);',
    'const [dailyStreak, setDailyStreak] = useState(0);\n    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, text: "" });'
);

// Inject useEffect
const effectStr = `
    useEffect(() => {
        const handleContextMenu = (e) => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY, text: selectedText });
            } else {
                setContextMenu({ visible: false, x: 0, y: 0, text: '' });
            }
        };
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, text: '' });
        
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, []);
`;

code = code.replace('useEffect(() => {\n        const savedTopics =', effectStr + '    useEffect(() => {\n        const savedTopics =');

// Inject UI
const menuUI = `
            {contextMenu.visible && (
                <div 
                    className="fixed z-[9999] bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in"
                    style={{ top: Math.min(contextMenu.y, window.innerHeight - 50), left: Math.min(contextMenu.x, window.innerWidth - 180) }}
                >
                    <button 
                        onClick={() => {
                            setFacts([{ id: Date.now().toString(), title: "Snippet - " + new Date().toLocaleTimeString(), content: contextMenu.text, date: new Date().toLocaleDateString() }, ...facts]);
                            setContextMenu({ visible: false, x: 0, y: 0, text: '' });
                            alert("Added to Fact Book!");
                        }}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-primary/10 hover:text-primary font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors w-full text-left"
                    >
                        <i className="fa-solid fa-book-bookmark text-primary"></i>
                        Add to Fact Book
                    </button>
                </div>
            )}
`;

code = code.replace('<CountdownTimerModal', menuUI + '            <CountdownTimerModal');

fs.writeFileSync('scratch/App.js', code);
console.log('Context menu applied');
