const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Update PremiumUpgradeView prices
code = code.replace(/1 Month Plan:.*?Rs\. 300/s, '1 Month Plan:</span>\n                        <span className="font-bold text-slate-800 dark:text-white text-sm">Rs. 199');
code = code.replace(/1 Year Plan:.*?Rs\. 1000/s, '1 Year Plan:</span>\n                        <span className="font-bold text-slate-800 dark:text-white text-sm">Rs. 1500');

// 2. Update Admin logic in onAuthStateChanged to set forceRenew to false instead of null
code = code.replace(/forceRenew: null,/g, 'forceRenew: false,');

// 3. Update SettingsModal Definition
const oldSettingsModalStart = 'const SettingsModal = ({ isOpen, onClose, onChangeSubjects, onSignOut }) => {';
const oldSettingsModalEnd = 'const App = () => {';
const startIndex = code.indexOf(oldSettingsModalStart);
const endIndex = code.indexOf(oldSettingsModalEnd);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find SettingsModal bounds");
    process.exit(1);
}

const newSettingsModal = `const SettingsModal = ({ isOpen, onClose, onChangeSubjects, onSignOut, isPro, plan, proExpiresAt, onRenew }) => {
    if (!isOpen) return null;
    
    const getRemainingText = () => {
        if (!isPro) return "Free Plan";
        if (!proExpiresAt) return "Lifetime Pro";
        const diff = proExpiresAt - Date.now();
        if (diff <= 0) return "Expired";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Expires today";
        return \`\${days} days remaining\`;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-surfaceDark w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Settings</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex justify-center items-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    
                    {/* Subscription Status Block */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Subscription</h4>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {isPro ? <><i className="fa-solid fa-crown text-amber-500"></i> Aspirix PRO</> : 'Free Plan'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {getRemainingText()}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => { onClose(); onRenew(); }} className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                            <i className="fa-solid fa-arrow-up-right-dots"></i> {isPro ? 'Renew Subscription' : 'Upgrade to Pro'}
                        </button>
                    </div>

                    <div className="space-y-2">
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
        </div>
    );
};

`;

code = code.substring(0, startIndex) + newSettingsModal + code.substring(endIndex);

// 4. Update SettingsModal Call in App
const oldSettingsModalCall = `<SettingsModal 
                isOpen={settingsOpen} 
                onClose={() => setSettingsOpen(false)} 
                onChangeSubjects={() => setAppState('onboarding')} 
                onSignOut={() => signOut(auth)} 
            />`;
const newSettingsModalCall = `<SettingsModal 
                isOpen={settingsOpen} 
                onClose={() => setSettingsOpen(false)} 
                onChangeSubjects={() => setAppState('onboarding')} 
                onSignOut={() => signOut(auth)}
                isPro={isPro}
                plan={plan}
                proExpiresAt={proExpiresAt}
                onRenew={() => setCurrentView('upgrade')}
            />`;
code = code.replace(oldSettingsModalCall, newSettingsModalCall);

// 5. Allow Pro users to see PremiumUpgradeView if currentView === 'upgrade'
const oldViewSwitch = `if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView onUpgrade={handleUpgrade} user={user} />;`;
const newViewSwitch = `if (currentView === 'upgrade') return <PremiumUpgradeView onUpgrade={handleUpgrade} user={user} />;
                        if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView onUpgrade={handleUpgrade} user={user} />;`;
code = code.replace(oldViewSwitch, newViewSwitch);

fs.writeFileSync('src/app/page.js', code);
console.log("Success");
