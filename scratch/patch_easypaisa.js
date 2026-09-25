const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// --- 1. Fix the Admin Upgrade Logic in the Auth Listener ---
// We need to automatically calculate proExpiresAt if the admin manually sets isPro to true in Firebase
const oldAuthBlock = `                if (userData.isPro && userData.proExpiresAt) {
                    if (Date.now() > userData.proExpiresAt) {
                        // Expired
                        await setDoc(userDocRef, { isPro: false }, { merge: true });
                        setIsPro(false);
                        setPlan("free");
                    } else {
                        setIsPro(true);
                        setPlan(userData.plan || "1_month");
                        setProExpiresAt(userData.proExpiresAt);
                    }
                } else {
                    setIsPro(false);
                    setPlan("free");
                }`;

const newAuthBlock = `                if (userData.isPro) {
                    const now = Date.now();
                    // If admin manually checked isPro but didn't set a future expiration date, calculate it for them!
                    if (!userData.proExpiresAt || userData.proExpiresAt < now) {
                        const planType = userData.plan === '1_year' ? '1_year' : '1_month';
                        const days = planType === '1_year' ? 365 : 30;
                        const newExpiration = now + (days * 24 * 60 * 60 * 1000);
                        
                        await setDoc(userDocRef, { 
                            proExpiresAt: newExpiration,
                            plan: planType,
                            pendingTrx: null // Clear any pending transactions
                        }, { merge: true });
                        
                        setIsPro(true);
                        setPlan(planType);
                        setProExpiresAt(newExpiration);
                    } else {
                        // Normal active subscription
                        setIsPro(true);
                        setPlan(userData.plan || "1_month");
                        setProExpiresAt(userData.proExpiresAt);
                    }
                } else {
                    setIsPro(false);
                    setPlan("free");
                }`;

code = code.replace(oldAuthBlock, newAuthBlock);

// --- 2. Rewrite PremiumUpgradeView for Easypaisa ---
const oldPremiumViewRegex = /const PremiumUpgradeView = \(\{ onUpgrade, user \}\) => \{[\s\S]*?return \([\s\S]*?<\/div>\);\n\};/m;

const newPremiumView = `const PremiumUpgradeView = ({ onUpgrade, user }) => {
    const [trxId, setTrxId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleSubmitTrx = async () => {
        if (!trxId.trim()) return;
        setSubmitting(true);
        setMsg({ type: '', text: '' });
        
        try {
            if (!user) throw new Error("You must be logged in.");
            
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                pendingTrx: trxId.trim(),
                pendingTrxDate: new Date().toISOString()
            }, { merge: true });
            
            setMsg({ type: 'success', text: 'Transaction ID submitted successfully! Please wait up to 24 hours for manual verification.' });
            setTrxId('');
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Failed to submit. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto w-full">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Crown size={32} className="text-[#c1121f]" />
                Upgrade to Aspirix PRO
            </h1>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
                <div className="bg-[#fdf0f1] p-6 rounded-2xl border-2 border-[#c1121f]/20 h-fit relative overflow-hidden group hover:border-[#c1121f]/40 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c1121f]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    
                    <h2 className="text-xl font-bold mb-4 text-[#c1121f] flex items-center gap-2">
                        <CreditCard size={24} />
                        Easypaisa Payment
                    </h2>
                    
                    <div className="space-y-4 text-gray-700 font-medium bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="flex justify-between items-center border-b pb-2">
                            <span>Account Name:</span>
                            <span className="font-bold text-gray-900">Naseem Khan</span>
                        </p>
                        <p className="flex justify-between items-center border-b pb-2">
                            <span>Easypaisa Number:</span>
                            <span className="font-bold text-[#c1121f] text-lg">03365005815</span>
                        </p>
                        <p className="flex justify-between items-center pb-2">
                            <span>1 Month Plan:</span>
                            <span className="font-bold text-gray-900">Rs. 300</span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span>1 Year Plan:</span>
                            <span className="font-bold text-gray-900">Rs. 1000</span>
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <p className="text-sm text-gray-600 font-medium">After sending the payment, enter your Transaction ID (Trx ID) below:</p>
                        <div className="space-y-2">
                            <input 
                                type="text"
                                placeholder="Enter Trx ID (e.g. 123456789)"
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c1121f] focus:ring-2 focus:ring-[#c1121f]/20 outline-none transition-all font-medium"
                            />
                            <button 
                                onClick={handleSubmitTrx}
                                disabled={submitting || !trxId.trim()}
                                className="w-full bg-[#c1121f] hover:bg-[#a00f1a] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Submitting...' : 'Submit Trx ID'}
                            </button>
                        </div>
                        {msg.text && (
                            <div className={\`p-3 rounded-lg text-sm font-medium \${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}\`}>
                                {msg.text}
                            </div>
                        )}
                        <p className="text-xs text-center text-gray-500 mt-4">
                            Manual verification usually takes 1-24 hours. Contact myproducts505@gmail.com for support.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Star className="text-yellow-400" size={20} />
                            Pro Features Include
                        </h3>
                        <ul className="space-y-3">
                            {['Ad-free experience', 'Priority support', 'Unlock all premium tests', 'Detailed performance analytics', 'Mock exams'].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};`;

code = code.replace(oldPremiumViewRegex, newPremiumView);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched Easypaisa');
