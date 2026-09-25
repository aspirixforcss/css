const Dashboard = ({ targetYear, selectedSubjects, completedTopics, openTimer, dailyStreak, user }) => {
    const [news, setNews] = useState([]);
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const dawnRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.dawn.com/feeds/home/');
                const dawnData = await dawnRes.json();
                if (dawnData.items) {
                    setNews(dawnData.items.slice(0, 10).map(i => i.title));
                }
            } catch (error) {
                console.error("Dawn news fetch error", error);
            }
        };
        fetchNews();
    }, []);

    const calculateProgress = (subjectList) => {
        let total = 0; let done = 0;
        subjectList.forEach(sub => {
            if(!syllabusData[sub.id]) return;
            syllabusData[sub.id].forEach((section, secIdx) => {
                if(!section.topics) return;
                section.topics.forEach((topic, topicIdx) => {
                    total += topic.subtopics.length;
                    done += topic.subtopics.filter(t => completedTopics[`${sub.id}_${secIdx}_${topicIdx}_${t}`]).length;
                });
            });
        });
        return { total, done };
    };
    const compStats = calculateProgress(compulsorySubjects);
    const optStats = calculateProgress(optionalSubjects.filter(sub => selectedSubjects.includes(sub.id)));
    const compPercent = compStats.total > 0 ? Math.round((compStats.done / compStats.total) * 100) : 0;
    const optPercent = optStats.total > 0 ? Math.round((optStats.done / optStats.total) * 100) : 0;
    
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Aspirant';
    
    // Calculate CSS Written Exam Date
    const targetDate = new Date(`January 27, ${targetYear || 2027}`);
    const daysLeft = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full font-sans">
            <div className="mb-8">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full mb-3 uppercase tracking-wider">Welcome Note</div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-2 leading-tight">Welcome back, <span className="text-primary">{firstName}</span></h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <i className="fa-regular fa-calendar text-primary/70"></i> {daysLeft > 0 ? `${daysLeft} Days Remaining until CSS ${targetYear}` : `CSS ${targetYear} Exam has started!`}
                </p>
            </div>
            
            {/* Metric Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white dark:bg-surfaceDark p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-book"></i></div>
                        <div><h3 className="font-bold text-slate-700 dark:text-slate-300">Compulsory</h3><p className="text-xs font-bold text-slate-400">Syllabus Progress</p></div>
                    </div>
                    <div className="flex items-end justify-between"><div className="text-4xl font-black text-slate-800 dark:text-white">{compPercent}%</div><div className="text-sm font-bold text-slate-500">{compStats.done}/{compStats.total} topics</div></div>
                </div>
                <div className="bg-white dark:bg-surfaceDark p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-list-check"></i></div>
                        <div><h3 className="font-bold text-slate-700 dark:text-slate-300">Optional</h3><p className="text-xs font-bold text-slate-400">Syllabus Progress</p></div>
                    </div>
                    <div className="flex items-end justify-between"><div className="text-4xl font-black text-slate-800 dark:text-white">{optPercent}%</div><div className="text-sm font-bold text-slate-500">{optStats.done}/{optStats.total} topics</div></div>
                </div>
                <div className="bg-white dark:bg-surfaceDark p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-fire"></i></div>
                        <div><h3 className="font-bold text-slate-700 dark:text-slate-300">Daily Streak</h3><p className="text-xs font-bold text-slate-400">Keep it up!</p></div>
                    </div>
                    <div className="flex items-end justify-between"><div className="text-4xl font-black text-slate-800 dark:text-white">{dailyStreak}</div><div className="text-sm font-bold text-slate-500">Days</div></div>
                </div>
            </div>

            {/* News Headlines Marquee */}
            <div className="bg-white dark:bg-surfaceDark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center mb-10 shadow-sm">
                <div className="bg-primary text-white font-bold px-4 py-3 whitespace-nowrap flex-shrink-0 z-10 flex items-center gap-2">
                    <i className="fa-solid fa-bolt animate-pulse"></i> News Headlines
                </div>
                <div className="overflow-hidden flex-1 relative flex items-center h-full">
                    <marquee className="font-medium text-slate-700 dark:text-slate-300 py-3" scrollamount="6">
                        🚨 <span className="font-bold text-red-500">MPT CSS {targetYear} Exam is on October 10, {targetYear - 1}</span> 🚨 &nbsp;&nbsp;|&nbsp;&nbsp; {news.length > 0 ? news.join('  •  ') : 'Loading Dawn News...'}
                    </marquee>
                </div>
            </div>

            {/* Big AI Analysis Box */}
            <div className="bg-white dark:bg-surfaceDark border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white p-8 rounded-[2rem] shadow-xl text-white mb-16 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <i className="fa-solid fa-robot text-3xl text-primary animate-pulse"></i>
                        <h3 className="text-2xl font-black">AI Analysis & Suggestions</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">
                        Based on your profile, you are preparing for <strong>CSS {targetYear}</strong>. 
                        Currently, your study pace indicates a <strong>strong area</strong> in Compulsory subjects ({compPercent}% completed).
                        However, your <strong>weak area</strong> seems to be Optional subjects ({optPercent}% completed).
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl">
                        <h4 className="font-bold text-primary mb-2 uppercase tracking-wider text-xs">AI Suggestion</h4>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            To ensure you are fully prepared for the written exams in Jan {targetYear}, we recommend allocating 60% of your daily study time to optional subjects over the next 4 weeks. Keep practicing vocabulary and MCQs to secure your MPT on Oct 10, {targetYear - 1}.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12 text-center text-sm font-medium text-slate-400">
                <div className="flex justify-center gap-6 mb-4">
                    <a href="#" className="hover:text-primary transition-colors">About Us</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Disclaimers</a>
                </div>
                <p>&copy; {new Date().getFullYear()} ASPIRIX FOR CSS. All rights reserved.</p>
            </div>
        </div>
    );
}