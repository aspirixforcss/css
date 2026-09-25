const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldSidebarFunc = 'const Sidebar = ({ currentView, setCurrentView, user, isPro, proExpiresAt, onOpenSettings }) => {';
const newSidebarFunc = 'const Sidebar = ({ currentView, setCurrentView, user, isPro, proExpiresAt, plan, onOpenSettings }) => {';
code = code.replace(oldSidebarFunc, newSidebarFunc);

const oldSidebarTimer = `                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                setTimeLeft(\`\${d}d \${h}h left\`);`;
const newSidebarTimer = `                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                setTimeLeft(\`\${d} days, \${h} hours remaining\`);`;
code = code.replace(oldSidebarTimer, newSidebarTimer);

const oldProText = `<p className="text-xs font-medium text-slate-500 truncate">{isPro ? \`Pro Member \${timeLeft ? '('+timeLeft+')' : ''}\` : 'Free Plan'}</p>`;
const newProText = `<p className="text-xs font-medium text-slate-500 truncate">{isPro ? \`Pro (\${plan === '1_year' ? '1 Year' : '1 Month'}) \${timeLeft ? '- '+timeLeft : ''}\` : 'Free Plan'}</p>`;
code = code.replace(oldProText, newProText);

const oldSidebarCall = `isPro={isPro} proExpiresAt={proExpiresAt} />`;
const newSidebarCall = `isPro={isPro} proExpiresAt={proExpiresAt} plan={plan} />`;
code = code.replace(oldSidebarCall, newSidebarCall);

fs.writeFileSync('src/app/page.js', code);
console.log('Updated Sidebar');
