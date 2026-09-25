const App = () => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [appState, setAppState] = useState('login');
    const [targetYear, setTargetYear] = useState(2027);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [completedTopics, setCompletedTopics] = useState({});
    const [currentView, setCurrentView] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isPro, setIsPro] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    const [timerOpen, setTimerOpen] = useState(false);
    const [timerSettings, setTimerSettings] = useState({ active: false, time: 25 * 60, task: '' });
    
    const [facts, setFacts] = useState([]);
    const [dailyStreak, setDailyStreak] = useState(0);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

    const [factModalOpen, setFactModalOpen] = useState(false);
    const [factModalText, setFactModalText] = useState('');
    const [factModalTitle, setFactModalTitle] = useState('');
    const [factModalTag, setFactModalTag] = useState('Economy');
    const factTags = ["Economy", "Budget", "Education", "Security", "Health", "Gender", "Crime", "Governance", "Climate", "Tech", "International Relations", "Society", "History", "Law", "Energy", "Infrastructure", "Agriculture", "Other"];


    useEffect(() => {
        if (currentView !== 'currentaffairs' && currentView !== 'pastpapers') {
            setTooltip({ visible: false, x: 0, y: 0, text: '' });
            return;
        }

        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setTooltip({
                    visible: true,
                    x: rect.left + (rect.width / 2),
                    y: rect.top,
                    text: text
                });
            } else {
                setTooltip({ visible: false, x: 0, y: 0, text: '' });
            }
        };
        
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, [currentView]);

    useEffect(() => {
        const savedTopics = localStorage.getItem('completedTopics');
        if (savedTopics) setCompletedTopics(JSON.parse(savedTopics));
        
        const savedFacts = localStorage.getItem('facts');
        if (savedFacts && JSON.parse(savedFacts).length > 0) { setFacts(JSON.parse(savedFacts)); } else { 
            setFacts([
                { id: "1", title: "Pakistan GDP Growth", content: "World Bank projects Pakistan's economic growth to remain modest at 1.8% in FY24.", date: new Date().toLocaleDateString(), tag: "Economy" },
                { id: "2", title: "Education Budget", content: "Federal budget allocation for higher education often falls below the 4% of GDP recommended by UNESCO.", date: new Date().toLocaleDateString(), tag: "Education" },
                { id: "3", title: "Climate Vulnerability", content: "Pakistan ranks among the top 10 most vulnerable countries to climate change despite contributing less than 1% to global emissions.", date: new Date().toLocaleDateString(), tag: "Climate" },
                { id: "4", title: "Women in Parliament", content: "Women hold approximately 20% of the seats in the National Assembly of Pakistan.", date: new Date().toLocaleDateString(), tag: "Gender" },
                { id: "5", title: "Cybersecurity Policy", content: "Pakistan introduced a comprehensive National Cyber Security Policy to secure its digital infrastructure in 2021.", date: new Date().toLocaleDateString(), tag: "Security" },
                { id: "6", title: "Infant Mortality", content: "Pakistan has one of the highest infant mortality rates in South Asia, posing major public health challenges.", date: new Date().toLocaleDateString(), tag: "Health" },
                { id: "7", title: "Agriculture Contribution", content: "Agriculture contributes around 22.7% to Pakistan's GDP and employs roughly 37.4% of the national labor force.", date: new Date().toLocaleDateString(), tag: "Agriculture" }
            ]);
 }
    }, []);

    useEffect(() => {
        if (Object.keys(completedTopics).length > 0) {
            localStorage.setItem('completedTopics', JSON.stringify(completedTopics));
        }
    }, [completedTopics]);

    useEffect(() => {
        if (facts.length > 0) {
            localStorage.setItem('facts', JSON.stringify(facts));
        }
    }, [facts]);

    useEffect(() => {
        const lastVisitDate = localStorage.getItem('lastVisitDate');
        const today = new Date().toDateString();
        let currentStreak = parseInt(localStorage.getItem('dailyStreak') || '0', 10);

        if (lastVisitDate !== today) {
            if (lastVisitDate) {
                const lastDate = new Date(lastVisitDate);
                const todayDate = new Date();
                todayDate.setHours(0,0,0,0);
                lastDate.setHours(0,0,0,0);
                const diffTime = Math.abs(todayDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }

            localStorage.setItem('lastVisitDate', today);
            localStorage.setItem('dailyStreak', currentStreak.toString());
            setDailyStreak(currentStreak);
        } else {
            setDailyStreak(currentStreak || 1);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.selectedSubjects && data.selectedSubjects.length > 0) {
                            setSelectedSubjects(data.selectedSubjects);
                            if (data.completedTopics) setCompletedTopics(data.completedTopics);
                            if (data.facts) setFacts(data.facts);
                            if (data.dailyStreak) setDailyStreak(data.dailyStreak);
                            if (data.targetYear) setTargetYear(data.targetYear);
                            setAppState('main');
                        } else {
                            setAppState('onboarding');
                        }
                    } else {
                        setAppState('onboarding');
                    }
                } catch (err) {
                    console.error("Firestore Load Error:", err);
                    setAppState('onboarding');
                }
            } else {
                setUser(null);
                setAppState('login');
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user || loadingAuth) return;
        const syncData = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, {
                    selectedSubjects,
                    completedTopics,
                    facts,
                    dailyStreak,
                    targetYear,
                    lastUpdate: new Date()
                }, { merge: true });
            } catch (err) {
                console.error("Firestore Save Error:", err);
            }
        };
        const timeout = setTimeout(syncData, 1000);
        return () => clearTimeout(timeout);
    }, [selectedSubjects, completedTopics, facts, dailyStreak, targetYear, user, loadingAuth]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark');
        }
    };

    if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-bgDark"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i></div>;
    if (appState === 'login') return <LoginScreen onLogin={(u) => setUser(u)} />;
    if (appState === 'onboarding') return <OnboardingWizard onComplete={async (s, tY) => { 
        setSelectedSubjects(s); 
        setTargetYear(tY);
        setAppState('main');
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, { selectedSubjects: s, targetYear: tY, lastUpdate: new Date() }, { merge: true });
                console.log("Subjects force saved!");
            } catch (err) {
                console.error(err);
            }
        }
    }} />;

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-bgLight dark:bg-bgDark font-sans overflow-hidden transition-colors">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-surfaceDark text-white shadow-md z-30">
                <div className="flex items-center h-10 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-12">
                        <div className="absolute -top-3 left-0 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                            <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: `url(${aspirixCap})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixCap})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                        </div>
                        <div className="w-28 h-7 bg-white drop-shadow-sm z-0 mt-1" style={{ WebkitMaskImage: `url(${aspirixText})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixText})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
                    <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                </button>
            </div>
            
            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar (Responsive) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onOpenSettings={() => setSettingsOpen(true)} currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} isPro={isPro} />
            </div>

            <main className="flex-1 h-full flex flex-col relative w-full overflow-y-auto">
                <button onClick={toggleTheme} className="fixed top-4 right-16 md:top-6 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-yellow-400 hover:scale-110 transition-all z-40">
                    <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg md:text-xl`}></i>
                </button>
                {
                    (() => {
                        const premiumViews = ['mcqs', 'currentaffairs'];
                        if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView />;
                        
                        switch (currentView) {
                            case 'dashboard': return <Dashboard targetYear={targetYear} selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />;
                            case 'syllabus': return <SyllabusTracker selectedSubjects={selectedSubjects} completedTopics={completedTopics} setCompletedTopics={setCompletedTopics} />;
                            case 'timetable': return <Timetable startTaskTimer={(task, mins) => { setTimerSettings({ active: true, time: mins * 60, task }); setTimerOpen(true); }} />;
                            case 'pastpapers': return <PastPapersView rootFolderId='1loejZdweyTir2QqtUKiHAAFOs5bRxfmz' selectedSubjects={selectedSubjects} />;
                            case 'factbook': return <FactBook facts={facts} setFacts={setFacts} />;
                            case 'currentaffairs': return <CurrentAffairsView />;
                            case 'mcqs': return <SubjectWiseMCQs selectedSubjects={selectedSubjects} />;
                            case 'vocab': return <VocabFlashcards isPro={isPro} />;
                            default: return <Dashboard selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />;
                        }
                    })()
                }
            </main>
            <SettingsModal 
                isOpen={settingsOpen} 
                onClose={() => setSettingsOpen(false)} 
                onChangeSubjects={() => setAppState('onboarding')} 
                onSignOut={() => signOut(auth)} 
            />
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

            <CountdownTimerModal isOpen={timerOpen} onClose={() => setTimerOpen(false)} settings={timerSettings} />
        </div>
    );
}