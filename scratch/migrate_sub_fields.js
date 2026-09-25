const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// Replace subscriptionEndsAt with proExpiresAt across the file
code = code.replace(/subscriptionEndsAt/g, 'proExpiresAt');
code = code.replace(/setSubscriptionEndsAt/g, 'setProExpiresAt');

// Add the banner to Dashboard or Sidebar. In the prompt: "in the user profile/dashboard"
// Actually, earlier I added it to the sidebar. Let's see what it looks like now.

// Wait, the prompt says:
// - Current Tier: Free vs Pro (1 Month / 1 Year)
// Let's also add planType/plan in page.js state.
code = code.replace(/const \[isPro, setIsPro\] = useState\(false\);/, 'const [isPro, setIsPro] = useState(false);\\n    const [plan, setPlan] = useState("");');

// Add to onAuthStateChanged:
const authOld = \`                                    if (Date.now() < endsAt) {
                                        setIsPro(true);
                                        setProExpiresAt(endsAt);
                                    } else {
                                        setIsPro(false);
                                        setProExpiresAt(null);
                                    }\`;

const authNew = \`                                    if (Date.now() < endsAt) {
                                        setIsPro(true);
                                        setProExpiresAt(endsAt);
                                        if (data.plan) setPlan(data.plan);
                                    } else {
                                        setIsPro(false);
                                        setProExpiresAt(null);
                                        setPlan("");
                                    }\`;
code = code.replace(authOld, authNew);

// Wait, if legacy pro doesn't have endsAt:
const legacyOld = \`} else {
                                    setIsPro(true);
                                }\`;
const legacyNew = \`} else {
                                    setIsPro(true);
                                    if (data.plan) setPlan(data.plan);
                                }\`;
code = code.replace(legacyOld, legacyNew);


// Update syncData
const syncOld = \`targetYear,
                    isPro,
                    proExpiresAt,
                    lastUpdate: new Date()\`;
const syncNew = \`targetYear,
                    isPro,
                    plan,
                    proExpiresAt,
                    lastUpdate: new Date()\`;
code = code.replace(syncOld, syncNew);

code = code.replace(/isPro, proExpiresAt\]\);/, 'isPro, proExpiresAt, plan]);');

fs.writeFileSync('src/app/page.js', code);
console.log('Migrated fields');
