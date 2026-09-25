const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

code = code.replace(/subscriptionEndsAt/g, 'proExpiresAt');
code = code.replace(/setSubscriptionEndsAt/g, 'setProExpiresAt');
code = code.replace('const [isPro, setIsPro] = useState(false);', 'const [isPro, setIsPro] = useState(false);\n    const [plan, setPlan] = useState("");');

const authOld = `                                    if (Date.now() < endsAt) {
                                        setIsPro(true);
                                        setProExpiresAt(endsAt);
                                    } else {
                                        setIsPro(false);
                                        setProExpiresAt(null);
                                    }`;

const authNew = `                                    if (Date.now() < endsAt) {
                                        setIsPro(true);
                                        setProExpiresAt(endsAt);
                                        if (data.plan) setPlan(data.plan);
                                    } else {
                                        setIsPro(false);
                                        setProExpiresAt(null);
                                        setPlan("");
                                    }`;
code = code.replace(authOld, authNew);

const legacyOld = `} else {
                                    setIsPro(true);
                                }`;
const legacyNew = `} else {
                                    setIsPro(true);
                                    if (data.plan) setPlan(data.plan);
                                }`;
code = code.replace(legacyOld, legacyNew);

const syncOld = `targetYear,
                    isPro,
                    proExpiresAt,
                    lastUpdate: new Date()`;
const syncNew = `targetYear,
                    isPro,
                    plan,
                    proExpiresAt,
                    lastUpdate: new Date()`;
code = code.replace(syncOld, syncNew);

code = code.replace('isPro, proExpiresAt]);', 'isPro, proExpiresAt, plan]);');

fs.writeFileSync('src/app/page.js', code);
console.log('Migrated fields 2');
