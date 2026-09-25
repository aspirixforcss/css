export default function App() {
    const [appState, setAppState] = useState('login');
    const [user, setUser] = useState(null);
    const [isPro, setIsPro] = useState(false);
    const [targetYear, setTargetYear] = useState(2027);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [timerOpen, setTimerOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    useEffect(() => {
        const saved = localStorage.getItem('selectedSubjects');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) setSelectedSubjects(parsed);
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
                        setIsPro(!!data.isPro);
                        if (data.targetYear) setTargetYear(data.targetYear);
                        
                        let hasSubjects = false;
                        if (data.selectedSubjects && data.selectedSubjects.length > 0) {
                            setSelectedSubjects(data.selectedSubjects);
                            hasSubjects = true;
                        } else {
                            const localSubj = localStorage.getItem('selectedSubjects');
                            if (localSubj && JSON.parse(localSubj).length > 0) {
                                setSelectedSubjects(JSON.parse(localSubj));
                                hasSubjects = true;
                            }
                        }
                        
                        setAppState(hasSubjects ? 'main' : 'onboarding');

                        if (data.completedTopics) setCompletedTopics(data.completedTopics);
                        if (data.facts) setFacts(data.facts);
                        if (data.dailyStreak) setDailyStreak(data.dailyStreak);
                    } else {
                        const localSubj = localStorage.getItem('selectedSubjects');
                        if (localSubj && JSON.parse(localSubj).length > 0) {
                            setSelectedSubjects(JSON.parse(localSubj));
                            setAppState('main');
                        }
                        else setAppState('onboarding');
                    }
                } catch (err) {
                    console.error("Firestore Load Error:", err);
                    const localSubj = localStorage.getItem('selectedSubjects');
                    if (localSubj && JSON.parse(localSubj).length > 0) {
                        setSelectedSubjects(JSON.parse(localSubj));
                        setAppState('main');
                    }
                    else setAppState('onboarding');
                }
                setLoadingAuth(false);
            } else {
                setUser(null);
                setAppState('login');
                setLoadingAuth(false);
            }
        });
        return () => unsubscribe();
    }, []);



    useEffect(() => {
        if (selectedSubjects.length > 0) {
            localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
        }
    }, [selectedSubjects]);
    const [completedTopics, setCompletedTopics] = useState({});
    const [facts, setFacts] = useState([]);
    const [timerSettings, setTimerSettings] = useState({ active: false, time: 25 * 60, task: '' });
    const [dailyStreak, setDailyStreak] = useState(0);

    useEffect(() => {
        const savedTopics = localStorage.getItem('completedTopics');
        if (savedTopics) setCompletedTopics(JSON.parse(savedTopics));
        const savedFacts = localStorage.getItem('facts');
        if (savedFacts) setFacts(JSON.parse(savedFacts));
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
        if (!user || loadingAuth) return;
        const syncData = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, {
                    selectedSubjects,
                    completedTopics,
                    facts,
                    dailyStreak,
                    lastUpdate: new Date()
                }, { merge: true });
            } catch (err) {
                console.error("Firestore Save Error:", err);
            }
        };
        const timeout = setTimeout(syncData, 1000);
        return () => clearTimeout(timeout);
    }, [selectedSubjects, completedTopics, facts, dailyStreak, user, loadingAuth]);
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
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-xl transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: `url(${aspirixCap})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixCap})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-white drop-shadow-sm dark:bg-white" style={{ WebkitMaskImage: `url(${aspirixText})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixText})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
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
            <CountdownTimerModal isOpen={timerOpen} onClose={() => setTimerOpen(false)} settings={timerSettings} />
        </div>
    );
}