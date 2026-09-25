const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Remove firebase functions imports
code = code.replace("import { auth, db, functions, googleProvider } from '../lib/firebase';\nimport { httpsCallable } from 'firebase/functions';", "import { auth, db, googleProvider } from '../lib/firebase';");

// 2. Add 'user' to PremiumUpgradeView component parameters and rewrite handleVerify
const oldPremiumBlock = `const PremiumUpgradeView = ({ onUpgrade }) => {
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
    };`;

const newPremiumBlock = `const PremiumUpgradeView = ({ onUpgrade, user }) => {
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
            if (!user) throw new Error("You must be logged in to activate a license.");
            const key = licenseKey.trim();
            
            // 1. Check if the license was already claimed in our database
            const licenseRef = doc(db, 'licenses', key);
            const licenseSnap = await getDoc(licenseRef);
            
            let planType = "1_month";
            const now = new Date();
            let expirationDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
            
            if (licenseSnap.exists()) {
                if (licenseSnap.data().boundUserId !== user.uid) {
                    throw new Error("This license key is already locked to another account.");
                }
                // Already theirs, re-activate locally
                planType = licenseSnap.data().plan || '1_month';
                if (planType === '1_year') {
                    expirationDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
                }
            } else {
                // 2. Call Gumroad API via CORS Proxy
                const targetUrl = 'https://api.gumroad.com/v2/licenses/verify';
                const proxyUrl = \`https://corsproxy.io/?url=\${encodeURIComponent(targetUrl)}\`;
                
                const res = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        product_permalink: 'aspirix',
                        license_key: key,
                        increment_uses_count: 'true'
                    })
                });
                
                const gumroadData = await res.json();
                
                if (!gumroadData.success || gumroadData.purchase.refunded || gumroadData.purchase.chargebacked) {
                    throw new Error("Invalid, expired, or refunded license key.");
                }
                
                // Duration Parsing
                const variants = (gumroadData.purchase.variants || "").toLowerCase();
                if (variants.includes("year")) {
                    planType = "1_year";
                    expirationDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
                }
                
                // 3. Claim it in Firestore to prevent reuse by others
                await setDoc(licenseRef, {
                    boundUserId: user.uid,
                    claimedEmail: user.email,
                    plan: planType,
                    activatedAt: new Date(),
                    status: "active"
                });
            }
            
            // 4. Update the user's document
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                isPro: true,
                plan: planType,
                licenseKey: key,
                proExpiresAt: expirationDate.getTime()
            }, { merge: true });
            
            // 5. Update local state
            onUpgrade(planType, expirationDate.getTime());
            
        } catch (err) {
            console.error("Verification error:", err);
            setErrorMsg(err.message || "Failed to activate license key. Please check your key and try again.");
        } finally {
            setVerifying(false);
        }
    };`;

code = code.replace(oldPremiumBlock, newPremiumBlock);

// Update PremiumUpgradeView rendering in the main App
code = code.replace(
    `if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView onUpgrade={handleUpgrade} />;`,
    `if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView onUpgrade={handleUpgrade} user={user} />;`
);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched frontend license checking');
