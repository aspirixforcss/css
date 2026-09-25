const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Update App State
code = code.replace(
    "const [isPro, setIsPro] = useState(true);",
    "const [isPro, setIsPro] = useState(false);\n    const [subscriptionEndsAt, setSubscriptionEndsAt] = useState(null);"
);

// 2. Update onAuthStateChanged
const authOld = `if (data.targetYear) setTargetYear(data.targetYear);
                            setAppState('main');`;
const authNew = `if (data.targetYear) setTargetYear(data.targetYear);
                            if (data.isPro) {
                                if (data.subscriptionEndsAt) {
                                    const endsAt = data.subscriptionEndsAt.toDate ? data.subscriptionEndsAt.toDate().getTime() : data.subscriptionEndsAt;
                                    if (Date.now() < endsAt) {
                                        setIsPro(true);
                                        setSubscriptionEndsAt(endsAt);
                                    } else {
                                        setIsPro(false);
                                        setSubscriptionEndsAt(null);
                                    }
                                } else {
                                    setIsPro(true);
                                }
                            } else {
                                setIsPro(false);
                            }
                            setAppState('main');`;
code = code.replace(authOld, authNew);

// 3. Update syncData
const syncOld = `dailyStreak,
                    targetYear,
                    lastUpdate: new Date()`;
const syncNew = `dailyStreak,
                    targetYear,
                    isPro,
                    subscriptionEndsAt,
                    lastUpdate: new Date()`;
code = code.replace(syncOld, syncNew);
const depsOld = `user, loadingAuth, appState]);`;
const depsNew = `user, loadingAuth, appState, isPro, subscriptionEndsAt]);`;
code = code.replace(depsOld, depsNew);

// 4. Create About, Privacy, Disclaimer components and add them to the switch
const newComponents = `
const AboutView = () => (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white dark:bg-surfaceDark rounded-3xl shadow-xl mt-10">
        <h2 className="text-3xl font-black mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">About CSS Mentors</h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Welcome to CSS Prep! This platform is driven by dedicated CSS Mentors who work tirelessly to improve this app and provide the best resources for aspirants. 
        </p>
        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Our mentors are constantly analyzing past papers, syllabus trends, and exam patterns to bring you cutting-edge features. In the future, we will add even more tools, comprehensive mock exams, and personalized AI feedback to ensure your success.
        </p>
        <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-4">
            <i className="fa-solid fa-rocket text-primary text-2xl"></i>
            <span className="font-bold text-slate-800 dark:text-white">Stay tuned! Exciting new features are on the horizon.</span>
        </div>
    </div>
);

const PrivacyView = () => (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white dark:bg-surfaceDark rounded-3xl shadow-xl mt-10">
        <h2 className="text-3xl font-black mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">Privacy Policy</h2>
        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
            <p><strong>1. Data Collection:</strong> We collect your optional subject selections and study progress to personalize your experience.</p>
            <p><strong>2. Compliance with PECA 2016:</strong> In accordance with the Prevention of Electronic Crimes Act (PECA) 2016 of Pakistan, we ensure that your personal data is protected against unauthorized access, alteration, or disclosure. We do not sell your personal data to third parties.</p>
            <p><strong>3. Data Localization:</strong> We strive to maintain essential user data securely, adhering to best practices required for Pakistani citizens.</p>
            <p><strong>4. Deletion:</strong> You may request the deletion of your account and associated data at any time.</p>
        </div>
    </div>
);

const DisclaimerView = () => (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white dark:bg-surfaceDark rounded-3xl shadow-xl mt-10">
        <h2 className="text-3xl font-black mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">Disclaimers & Terms</h2>
        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
            <p><strong>No Guarantee of Success:</strong> This application is a preparation tool. We do not guarantee passing the CSS examination or securing an allocation.</p>
            <p className="font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                Non-Refundable Policy: All Pro subscriptions (Monthly/Yearly) are strictly non-refundable once activated.
            </p>
            <p className="font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                Not Applicable in Court of Law: The content, MCQs, and guidance provided within this app are for educational purposes only. They do not constitute legal or official advice and cannot be challenged or used as evidence in any court of law in Pakistan or elsewhere.
            </p>
        </div>
    </div>
);
`;

const premiumOld = `const PremiumUpgradeView = () => (`;
const premiumNew = `const PremiumUpgradeView = ({ onUpgrade }) => (`;
code = code.replace(premiumOld, newComponents + '\n' + premiumNew);

const btnMonthlyOld = `<div className="text-4xl font-black text-slate-800 dark:text-white mb-4">Rs 99<span className="text-lg font-medium text-slate-400">/mo</span></div>`;
const btnMonthlyNew = btnMonthlyOld + `\n                  <button onClick={() => onUpgrade('monthly')} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Select Monthly</button>`;
code = code.replace(btnMonthlyOld, btnMonthlyNew);

const btnYearlyOld = `<div className="text-4xl font-black text-white mb-4">Rs 1000<span className="text-lg font-medium text-amber-200">/yr</span></div>`;
const btnYearlyNew = btnYearlyOld + `\n                  <button onClick={() => onUpgrade('yearly')} className="w-full py-3 bg-white text-orange-500 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">Select Yearly</button>`;
code = code.replace(btnYearlyOld, btnYearlyNew);

// Add the upgrade handler in App
const switchBlockOld = `if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView />;`;
const switchBlockNew = `
const handleUpgrade = (plan) => {
    const days = plan === 'monthly' ? 30 : 365;
    const endsAt = Date.now() + (days * 24 * 60 * 60 * 1000);
    setIsPro(true);
    setSubscriptionEndsAt(endsAt);
    alert(\`Successfully upgraded to \${plan} plan! Valid for \${days} days.\`);
};
if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView onUpgrade={handleUpgrade} />;
`;
code = code.replace(switchBlockOld, switchBlockNew);

// Add switch cases
const switchS = `case 'vocab': return <VocabFlashcards isPro={isPro} />;`;
const switchN = `case 'vocab': return <VocabFlashcards isPro={isPro} />;
                              case 'about': return <AboutView />;
                              case 'privacy': return <PrivacyView />;
                              case 'disclaimer': return <DisclaimerView />;`;
code = code.replace(switchS, switchN);

// Pass setCurrentView to Dashboard
const dashOld = `<Dashboard targetYear={targetYear} selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />`;
const dashNew = `<Dashboard setCurrentView={setCurrentView} targetYear={targetYear} selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />`;
code = code.replace(dashOld, dashNew);
const dashOld2 = `<Dashboard selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />`;
const dashNew2 = `<Dashboard setCurrentView={setCurrentView} selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />`;
code = code.replace(dashOld2, dashNew2);

// Add setCurrentView to Dashboard props
const dashCompOld = `const Dashboard = ({ targetYear, selectedSubjects, completedTopics, openTimer, dailyStreak, user }) => {`;
const dashCompNew = `const Dashboard = ({ setCurrentView, targetYear, selectedSubjects, completedTopics, openTimer, dailyStreak, user }) => {`;
code = code.replace(dashCompOld, dashCompNew);

// Wire footer links in Dashboard
const footerOld = `<a href="#" className="hover:text-primary transition-colors">About Us</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Disclaimers</a>`;
const footerNew = `<button onClick={() => setCurrentView('about')} className="hover:text-primary transition-colors">About Us</button>
                    <button onClick={() => setCurrentView('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
                    <button onClick={() => setCurrentView('disclaimer')} className="hover:text-primary transition-colors">Disclaimers</button>`;
code = code.replace(footerOld, footerNew);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched phase 1');
