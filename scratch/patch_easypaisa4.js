const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const startIndex = code.indexOf('const PremiumUpgradeView = ({ onUpgrade, user }) => {');
const endIndexStr = 'const CurrentAffairsView = () => {';
const endIndex = code.indexOf(endIndexStr);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find component bounds");
    process.exit(1);
}

const newPremiumView = `const PremiumUpgradeView = ({ onUpgrade, user }) => {
    const [trxId, setTrxId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [existingTrx, setExistingTrx] = useState(null);
    const [loadingTrx, setLoadingTrx] = useState(true);

    useEffect(() => {
        const fetchTrx = async () => {
            if (!user) return;
            try {
                const docSnap = await getDoc(doc(db, 'users', user.uid));
                if (docSnap.exists() && docSnap.data().pendingTrx) {
                    setExistingTrx(docSnap.data().pendingTrx);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingTrx(false);
            }
        };
        fetchTrx();
    }, [user]);

    const handleSubmitTrx = async () => {
        if (!trxId.trim()) return;
        setSubmitting(true);
        setMsg({ type: '', text: '' });
        
        try {
            if (!user) throw new Error("You must be logged in to submit a transaction ID.");
            
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                pendingTrx: trxId.trim(),
                pendingTrxDate: new Date().toISOString()
            }, { merge: true });
            
            setExistingTrx(trxId.trim());
            setMsg({ type: 'success', text: 'Transaction ID submitted successfully! Please wait up to 24 hours for manual verification.' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Failed to submit. Please try again or contact support.' });
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white dark:bg-surfaceDark rounded-3xl border border-primary/20 shadow-xl w-full max-w-xl mx-auto my-8 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                <i className="fa-solid fa-crown text-white text-3xl sm:text-4xl"></i>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-3">Upgrade to Pro</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm sm:text-base">Unlock all premium features including Past Papers, Subject MCQs, Full Vocabulary (D-Z), and Daily Current Affairs.</p>
            
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg border-b pb-2"><i className="fa-solid fa-money-bill-transfer mr-2 text-green-600"></i>Easypaisa Payment</h3>
                
                <div className="space-y-2 sm:space-y-3 mb-5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="flex flex-col sm:flex-row justify-between border-b dark:border-slate-800 pb-2">
                        <span className="text-slate-500 text-sm">Easypaisa Number:</span>
                        <span className="font-bold text-primary text-base sm:text-lg">03365005815</span>
                    </p>
                    <p className="flex justify-between pb-2">
                        <span className="text-slate-500 text-sm">1 Month Plan:</span>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">Rs. 300</span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-slate-500 text-sm">1 Year Plan:</span>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">Rs. 1000</span>
                    </p>
                </div>
                
                {loadingTrx ? (
                    <div className="text-center py-4 text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>
                ) : existingTrx ? (
                    <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 p-4 rounded-xl text-center">
                        <i className="fa-solid fa-clock-rotate-left text-amber-600 dark:text-amber-400 text-2xl mb-2"></i>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">Verification Pending</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm mb-3">You have already submitted a transaction ID.</p>
                        <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg font-mono text-sm border border-amber-200 dark:border-amber-800">{existingTrx}</div>
                    </div>
                ) : (
                    <>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm sm:text-base">Step 2: Verify Payment</h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">After sending the payment, enter your Transaction ID (Trx ID) below:</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text" 
                                placeholder="Enter Trx ID (e.g. 123456789)" 
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-primary font-mono text-sm" 
                                value={trxId} 
                                onChange={e => setTrxId(e.target.value)} 
                            />
                            <button 
                                onClick={handleSubmitTrx} 
                                disabled={submitting || !trxId.trim()} 
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
                            >
                                {submitting ? (<span><i className="fa-solid fa-spinner fa-spin mr-2"></i>Submitting...</span>) : 'Submit Trx ID'}
                            </button>
                        </div>
                    </>
                )}
                {msg.text && (
                    <div className={\`mt-4 p-3 rounded-xl text-sm font-medium \${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}\`}>
                        <i className={\`fa-solid \${msg.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} mr-2\`}></i>
                        {msg.text}
                    </div>
                )}
            </div>
            
            <p className="text-xs text-slate-400">Manual verification takes up to 24 hours. Contact myproducts505@gmail.com for support.</p>
        </div>
    );
};
`;

code = code.substring(0, startIndex) + newPremiumView + code.substring(endIndex);
fs.writeFileSync('src/app/page.js', code);
console.log("Success");
