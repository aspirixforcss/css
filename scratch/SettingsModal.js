const SettingsModal = ({ isOpen, onClose, onChangeSubjects, onSignOut }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-surfaceDark w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Settings</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex justify-center items-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    <button onClick={() => { onClose(); onChangeSubjects(); }} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors font-bold text-left group">
                        <span className="flex items-center"><i className="fa-solid fa-book-open w-6 text-slate-400 group-hover:text-primary transition-colors"></i> Change Subjects</span>
                        <i className="fa-solid fa-chevron-right text-sm opacity-50 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                    <button onClick={() => { onClose(); onSignOut(); }} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-bold text-left group">
                        <span className="flex items-center"><i className="fa-solid fa-right-from-bracket w-6 text-red-400 group-hover:text-red-500 transition-colors"></i> Sign Out</span>
                        <i className="fa-solid fa-chevron-right text-sm opacity-50 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
