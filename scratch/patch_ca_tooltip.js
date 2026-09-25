const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldState = `const CurrentAffairsView = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeArticle, setActiveArticle] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {`;

const newState = `const CurrentAffairsView = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeArticle, setActiveArticle] = useState(null);
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('hideCurrentAffairsTip')) {
            setTimeout(() => setShowTip(true), 1500);
        }
        const fetchNews = async () => {`;

code = code.replace(oldState, newState);

const oldReturn = `    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
            <div className="flex items-center gap-3 mb-2">`;

const newReturn = `    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 relative">
            {showTip && (
                <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 bg-white dark:bg-surfaceDark border-l-4 border-l-orange-500 shadow-2xl rounded-2xl p-6 z-50 max-w-sm animate-fade-in shadow-orange-500/20">
                    <div className="flex gap-4 items-start">
                        <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-500 p-3 rounded-full flex-shrink-0 animate-pulse">
                            <i className="fa-solid fa-lightbulb text-xl"></i>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white mb-2 text-lg">Did you know?</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                                You can <b>select and highlight</b> any text, fact, figure, or stat in these articles to instantly save it to your <b>Fact Book</b>!
                            </p>
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setShowTip(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Dismiss</button>
                                <button onClick={() => {
                                    localStorage.setItem('hideCurrentAffairsTip', 'true');
                                    setShowTip(false);
                                }} className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-md transition-colors">Don't show again</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-3 mb-2">`;

code = code.replace(oldReturn, newReturn);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed CA tooltip');
