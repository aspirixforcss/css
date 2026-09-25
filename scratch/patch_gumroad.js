const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldAbout = `Welcome to CSS Prep! This platform is driven by dedicated CSS Mentors`;
const newAbout = `Welcome to Aspirix! This platform is driven by dedicated CSS Mentors`;
code = code.replace(oldAbout, newAbout);

const oldAboutHeading = `About CSS Mentors`;
const newAboutHeading = `About Aspirix`;
code = code.replace(oldAboutHeading, newAboutHeading);


const oldPremiumUpgradeView = extractBlock(code, 'const PremiumUpgradeView =');

function extractBlock(code, startStr) {
    const startIdx = code.indexOf(startStr);
    if (startIdx === -1) return '';
    let arrowIdx = code.indexOf('=>', startIdx);
    if (arrowIdx === -1) arrowIdx = startIdx;
    if (startStr.includes('function App')) arrowIdx = startIdx;
    const blockStart = code.indexOf('(', arrowIdx); // It was an arrow function with (
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
            if (char === '(') braces++;
            if (char === ')') braces--;
        }
        endIdx++;
    }
    return code.substring(startIdx, endIdx);
}

const premiumUpgradeViewNew = `const PremiumUpgradeView = ({ onUpgrade }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handlePurchase = (plan) => {
        // Placeholder for the Gumroad Link
        // Replace this URL with your actual Gumroad product link when ready.
        const gumroadLink = "https://gumroad.com/l/YOUR_PRODUCT_LINK";
        window.open(gumroadLink, "_blank");
    };

    const handleVerify = async () => {
        if (!licenseKey.trim()) return;
        setVerifying(true);
        setErrorMsg('');
        
        try {
            // Note: Once you have the Gumroad link, we will connect this to the Gumroad License API
            // using a secure verification flow to check if the key is valid and hasn't been used.
            // For now, we simulate a successful validation.
            
            // Simulated network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Replace 'monthly' or 'yearly' based on the product the key is for
            // e.g. if the API returns that it's a yearly key, call onUpgrade('yearly')
            onUpgrade('monthly'); 
            
        } catch (err) {
            setErrorMsg("Invalid or expired license key.");
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
            
            <div className="flex flex-col md:flex-row gap-6 w-full mb-10">
                <div className="flex-1 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/30">
                    <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">Monthly</div>
                    <div className="text-4xl font-black text-slate-800 dark:text-white mb-4">Rs 99<span className="text-lg font-medium text-slate-400">/mo</span></div>
                    <button onClick={() => handlePurchase('monthly')} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Buy on Gumroad</button>
                </div>
                <div className="flex-1 border-2 border-primary bg-primary/5 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-primary/10 transform md:scale-105">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Best Value</div>
                    <div className="text-primary font-bold uppercase tracking-wider text-sm mb-2">Yearly</div>
                    <div className="text-4xl font-black text-primary mb-4">Rs 1000<span className="text-lg font-medium opacity-60">/yr</span></div>
                    <button onClick={() => handlePurchase('yearly')} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Buy on Gumroad</button>
                </div>
            </div>

            {/* License Key Section */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Already bought a subscription?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter the license key from your Gumroad receipt to activate your Pro account.</p>
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
                        {verifying ? (<span><i className="fa-solid fa-spinner fa-spin mr-2"></i>Verifying...</span>) : 'Activate'}
                    </button>
                </div>
                {errorMsg && <p className="text-red-500 text-sm mt-3 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{errorMsg}</p>}
            </div>
        </div>
    );
}`;

code = code.replace(oldPremiumUpgradeView, premiumUpgradeViewNew);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched');
