const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldTrxState = `const PremiumUpgradeView = ({ onUpgrade, user }) => {
    const [trxId, setTrxId] = useState('');
    const [submitting, setSubmitting] = useState(false);`;

const newTrxState = `const PremiumUpgradeView = ({ onUpgrade, user }) => {
    const [trxId, setTrxId] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);`;

code = code.replace(oldTrxState, newTrxState);

const oldTrxSubmit = `    const handleSubmitTrx = async () => {
        if (!trxId.trim()) return;
        setSubmitting(true);
        setMsg({ type: '', text: '' });
        
        try {
            if (!user) throw new Error("You must be logged in to submit a transaction ID.");
            
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                pendingTrx: trxId.trim(),
                pendingTrxDate: new Date().toISOString()
            }, { merge: true });`;

const newTrxSubmit = `    const handleSubmitTrx = async () => {
        if (!trxId.trim() || !regEmail.trim()) return;
        setSubmitting(true);
        setMsg({ type: '', text: '' });
        
        try {
            if (!user) throw new Error("You must be logged in to submit a transaction ID.");
            
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                pendingTrx: trxId.trim(),
                pendingEmail: regEmail.trim(),
                pendingTrxDate: new Date().toISOString()
            }, { merge: true });`;

code = code.replace(oldTrxSubmit, newTrxSubmit);

const oldTrxUI = `<div className="flex flex-col sm:flex-row gap-3">
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
                        </div>`;

const newTrxUI = `<div className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                placeholder="Registered Email Address" 
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-primary font-mono text-sm" 
                                value={regEmail} 
                                onChange={e => setRegEmail(e.target.value)} 
                            />
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
                                    disabled={submitting || !trxId.trim() || !regEmail.trim()} 
                                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
                                >
                                    {submitting ? (<span><i className="fa-solid fa-spinner fa-spin mr-2"></i>Submitting...</span>) : 'Submit Info'}
                                </button>
                            </div>
                        </div>`;

code = code.replace(oldTrxUI, newTrxUI);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed Upgrade Email Input');
