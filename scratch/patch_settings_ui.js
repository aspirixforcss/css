const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldSettingsLogic = `    const getRemainingText = () => {
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
                        </button>`;

const newSettingsLogic = `    const getRemainingText = () => {
        if (!isPro) return "Free Plan";
        if (!proExpiresAt) return "Lifetime Pro";
        const diff = proExpiresAt - Date.now();
        if (diff <= 0) return "Expired";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Expires today";
        return \`\${days} days remaining\${plan === '7_days_trial' ? ' in trial' : ''}\`;
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
                                    {isPro ? (plan === '7_days_trial' ? <><i className="fa-solid fa-gift text-primary"></i> 7-Day Trial</> : <><i className="fa-solid fa-crown text-amber-500"></i> Aspirix PRO</>) : 'Free Plan'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {getRemainingText()}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => { onClose(); onRenew(); }} className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                            <i className="fa-solid fa-arrow-up-right-dots"></i> {isPro && plan !== '7_days_trial' ? 'Renew Subscription' : 'Upgrade to Pro'}
                        </button>`;

code = code.replace(oldSettingsLogic, newSettingsLogic);
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed settings UI logic');
