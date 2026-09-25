const fs = require('fs');

const code = `const CurrentAffairsView = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeArticle, setActiveArticle] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const dawnRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.dawn.com/feeds/home/');
                const dawnData = await dawnRes.json();
                const intlRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.com/xml/rss/all.xml');
                const intlData = await intlRes.json();
                
                const dawnItems = dawnData.items || [];
                const intlItems = intlData.items || [];

                const parseSummary = (items) => {
                    items.forEach(item => {
                        const temp = document.createElement('div');
                        temp.innerHTML = item.content || item.description || "";
                        const text = temp.textContent || temp.innerText || "";
                        const sentences = text.split('. ').filter(s => s.trim().length > 30);
                        item.summaryPoints = sentences.map(s => s.trim() + (s.trim().endsWith('.') ? '' : '.'));
                        item.fullText = text;
                    });
                };
                parseSummary(dawnItems);
                parseSummary(intlItems);
                
                setNews({ dawn: dawnItems, intl: intlItems });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-full pt-32 flex-col gap-4 text-slate-500">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i>
            <p className="font-bold animate-pulse">Fetching latest news and editorials...</p>
        </div>
    );

    const topArticle = activeArticle || news.dawn?.[0];
    const nationalArticles = news.dawn?.slice(0, 10) || [];
    const internationalArticles = news.intl?.slice(0, 10) || [];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
            <div className="flex items-center gap-3 mb-2">
                <i className="fa-solid fa-fire text-3xl text-orange-500 animate-pulse"></i>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Current Affairs Hot Topics</h2>
            </div>
            <p className="text-slate-500 mb-8 font-medium">Automatically updated from Dawn News & International Sources.</p>
            
            {/* Top Featured Editorial */}
            {topArticle && (
                <div className="bg-white dark:bg-surfaceDark rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 mb-10 flex flex-col group">
                    {topArticle.enclosure?.link && (
                        <div className="w-full h-48 md:h-72 bg-slate-100 overflow-hidden relative border-b border-slate-200 dark:border-slate-700">
                            <img src={topArticle.enclosure.link} alt={topArticle.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    )}
                    <div className="p-6 md:p-10">
                        <div className="flex flex-col items-center text-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                            <div className="bg-primary/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-4 border border-primary/20">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                                <span className="font-bold text-primary uppercase tracking-widest text-xs">{activeArticle ? "Selected Article" : "Latest Dawn Editorial"}</span>
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight font-serif">{topArticle.title}</h3>
                            <p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">{new Date(topArticle.pubDate).toDateString()}</p>
                        </div>
                        
                        <div className="columns-1 md:columns-2 gap-10 text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-justify">
                            {topArticle.summaryPoints?.length > 0 ? topArticle.summaryPoints.map((point, idx) => (
                                <p key={idx} className="mb-4">
                                    {idx === 0 ? <span className="float-left text-5xl font-black text-slate-900 dark:text-white pr-3 font-serif mt-2">{point.charAt(0)}</span> : null}
                                    {idx === 0 ? point.substring(1) : point}
                                </p>
                            )) : (
                                <p>{topArticle.fullText || "No content available for this article."}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* National Articles */}
                <div className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800"><i className="fa-solid fa-flag text-green-600"></i> National Important Articles</h3>
                    <div className="space-y-4">
                        {nationalArticles.map((article, idx) => (
                            <button key={idx} onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left group flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <span className="font-black text-2xl text-slate-200 dark:text-slate-700 group-hover:text-primary transition-colors">{idx + 1}</span>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors text-sm leading-snug line-clamp-2">{article.title}</h4>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(article.pubDate).toLocaleDateString()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* International Articles */}
                <div className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800"><i className="fa-solid fa-globe text-blue-500"></i> International Articles</h3>
                    <div className="space-y-4">
                        {internationalArticles.map((article, idx) => (
                            <button key={idx} onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left group flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <span className="font-black text-2xl text-slate-200 dark:text-slate-700 group-hover:text-primary transition-colors">{idx + 1}</span>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors text-sm leading-snug line-clamp-2">{article.title}</h4>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(article.pubDate).toLocaleDateString()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}`;

fs.writeFileSync('scratch/CurrentAffairsView.js', code);
console.log('Written CA cleanly');
