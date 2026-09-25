const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Update Sidebar props
const sbOld = `const Sidebar = ({ currentView, setCurrentView, user, isPro, onOpenSettings }) => {`;
const sbNew = `const Sidebar = ({ currentView, setCurrentView, user, isPro, subscriptionEndsAt, onOpenSettings }) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!isPro || !subscriptionEndsAt) {
            setTimeLeft('');
            return;
        }
        const updateTimer = () => {
            const diff = subscriptionEndsAt - Date.now();
            if (diff <= 0) {
                setTimeLeft('Expired');
            } else {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                setTimeLeft(\`\${d}d \${h}h left\`);
            }
        };
        updateTimer();
        const int = setInterval(updateTimer, 60000);
        return () => clearInterval(int);
    }, [isPro, subscriptionEndsAt]);
`;
code = code.replace(sbOld, sbNew);

// 2. Add the timer to the Sidebar UI
const proTextOld = `<p className="text-xs font-medium text-slate-500 truncate">{isPro ? 'Pro Member' : 'Free Plan'}</p>`;
const proTextNew = `<p className="text-xs font-medium text-slate-500 truncate">{isPro ? \`Pro Member \${timeLeft ? '('+timeLeft+')' : ''}\` : 'Free Plan'}</p>`;
code = code.replace(proTextOld, proTextNew);

// 3. Update the App component to pass subscriptionEndsAt to Sidebar
const sbCallOld1 = `<Sidebar onOpenSettings={() => setSettingsOpen(true)} currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} isPro={isPro} />`;
const sbCallNew1 = `<Sidebar onOpenSettings={() => setSettingsOpen(true)} currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} isPro={isPro} subscriptionEndsAt={subscriptionEndsAt} />`;
code = code.replace(sbCallOld1, sbCallNew1);

const sbCallOld2 = `<Sidebar onOpenSettings={() => setSettingsOpen(true)} currentView={currentView} setCurrentView={setCurrentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} isPro={isPro} />`;
const sbCallNew2 = `<Sidebar onOpenSettings={() => setSettingsOpen(true)} currentView={currentView} setCurrentView={setCurrentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} isPro={isPro} subscriptionEndsAt={subscriptionEndsAt} />`;
code = code.replace(sbCallOld2, sbCallNew2);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched phase 2');
