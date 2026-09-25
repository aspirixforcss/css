const Sidebar = ({ currentView, setCurrentView, user, isPro, onOpenSettings }) => {
    const menuItems = [
        { id: 'dashboard', icon: 'fa-solid fa-house', label: 'Dashboard' },
        { id: 'syllabus', icon: 'fa-solid fa-book-open', label: 'Syllabus Tracker' },
        { id: 'timetable', icon: 'fa-solid fa-calendar-days', label: 'Timetable' },
        { id: 'pastpapers', icon: 'fa-solid fa-file-pdf', label: 'Past Papers' },
        { id: 'currentaffairs', icon: 'fa-solid fa-fire', label: 'Current Affairs', pro: true },
        { id: 'mcqs', icon: 'fa-solid fa-list-check', label: 'Subject MCQs', pro: true },
        { id: 'vocab', icon: 'fa-solid fa-spell-check', label: 'Vocab Flashcards' },
        { id: 'factbook', icon: 'fa-solid fa-lightbulb', label: 'Fact Book' },
    ];
    
    return (
        <div className="w-72 h-full bg-white dark:bg-surfaceDark border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors z-20 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-lg transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: `url(${aspirixCap})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixCap})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-40 h-10 bg-slate-800 dark:bg-white drop-shadow-sm" style={{ WebkitMaskImage: `url(${aspirixText})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixText})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${currentView === item.id ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'}`}
                    >
                        {currentView === item.id && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>}
                        <i className={`${item.icon} text-lg ${currentView === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} w-6 text-center`}></i>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.pro && !isPro && <i className="fa-solid fa-lock text-xs opacity-50"></i>}
                        {item.pro && isPro && <i className="fa-solid fa-star text-xs text-yellow-400"></i>}
                    </button>
                ))}
            </div>

            <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-3 p-2">
                    <img src={user?.photoURL || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user?.displayName || 'Aspirant'}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{isPro ? 'Pro Member' : 'Free Plan'}</p>
                    </div>
                    <button onClick={onOpenSettings} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary shadow-sm border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
