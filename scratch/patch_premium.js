const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Imports update
code = code.replace(
    "import { auth, db, googleProvider } from '../lib/firebase';",
    "import { auth, db, functions, googleProvider } from '../lib/firebase';\\nimport { httpsCallable } from 'firebase/functions';"
);

// 2. Extract and replace PremiumUpgradeView
function extractBlock(code, startStr) {
    const startIdx = code.indexOf(startStr);
    if (startIdx === -1) return '';
    let arrowIdx = code.indexOf('=>', startIdx);
    if (arrowIdx === -1) arrowIdx = startIdx;
    if (startStr.includes('function App')) arrowIdx = startIdx;
    const blockStart = code.indexOf('{', arrowIdx);
    let braces = 1;
    let endIdx = blockStart + 1;
    let inString = false;
    let stringChar = '';

    while (braces > 0 && endIdx < code.length) {
        const char = code[endIdx];
        if ((char === '"' || char === "'" || char === '\`') && code[endIdx - 1] !== '\\\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (stringChar === char) {
                inString = false;
            }
        }
        if (!inString) {
            if (char === '{') braces++;
            if (char === '}') braces--;
        }
        endIdx++;
    }
    return code.substring(startIdx, endIdx);
}

const oldPremiumUpgradeView = extractBlock(code, 'const PremiumUpgradeView =');

const newPremiumUpgradeView = `const PremiumUpgradeView = ({ onUpgrade }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handlePurchase = () => {
        const gumroadLink = "https://buyit7.gumroad.com/l/aspirix";
        window.open(gumroadLink, "_blank");
    };

    const handleVerify = async () => {
        if (!licenseKey.trim()) return;
        setVerifying(true);
        setErrorMsg('');
        
        try {
            const activateLicense = httpsCallable(functions, 'activateLicense');
            const result = await activateLicense({ licenseKey: licenseKey.trim() });
            
            if (result.data && result.data.success) {
                onUpgrade(result.data.plan, result.data.expiresAt);
            } else {
                setErrorMsg(result.data?.message || "Invalid or expired license key.");
            }
        } catch (err) {
            setErrorMsg(err.message || "Failed to activate license key. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-surfaceDark rounded-3xl border border-primary/20 shadow-xl max-w-2xl mx-auto my-12 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                <i className="fa-solid fa-crown text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Upgrade to Pro</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Unlock all premium features including Past Papers, Subject MCQs, Full Vocabulary (D-Z), and Daily Current Affairs.</p>
            
            <div className="w-full mb-10">
                <button onClick={handlePurchase} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xl hover:shadow-xl hover:-translate-y-1 transition-all flex justify-center items-center gap-3">
                    <i className="fa-solid fa-cart-shopping"></i> Get Aspirix Pro on Gumroad
                </button>
                <p className="text-xs text-slate-400 mt-3">Select a 1-Month or 1-Year plan securely via Gumroad.</p>
            </div>

            {/* License Key Section */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Already bought a subscription?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter your Gumroad License Key from your receipt to activate your Pro account.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        placeholder="e.g. XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" 
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-primary font-mono text-sm" 
                        value={licenseKey} 
                        onChange={e => setLicenseKey(e.target.value)} 
                    />
                    <button 
                        onClick={handleVerify} 
                        disabled={verifying || !licenseKey.trim()} 
                        className="px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {verifying ? (<span><i className="fa-solid fa-spinner fa-spin mr-2"></i>Verifying...</span>) : 'Activate License'}
                    </button>
                </div>
                {errorMsg && <p className="text-red-500 text-sm mt-3 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{errorMsg}</p>}
            </div>
            
            <p className="text-xs text-slate-400 mt-6 italic">For legacy Easypaisa payments, please contact on email myproducts505@gmail.com</p>
        </div>
    );
}`;

code = code.replace(oldPremiumUpgradeView, newPremiumUpgradeView);

const oldHandleUpgradeBlock = `const handleUpgrade = (plan) => {
    const days = plan === 'monthly' ? 30 : 365;
    const endsAt = Date.now() + (days * 24 * 60 * 60 * 1000);
    setIsPro(true);
    setSubscriptionEndsAt(endsAt);
    alert(\`Successfully upgraded to \${plan} plan! Valid for \${days} days.\`);
};`;

const newHandleUpgradeBlock = `const handleUpgrade = (plan, expiresAt) => {
    setIsPro(true);
    setSubscriptionEndsAt(expiresAt);
    alert('Successfully activated Pro license!');
};`;

code = code.replace(oldHandleUpgradeBlock, newHandleUpgradeBlock);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched PremiumUpgradeView');
