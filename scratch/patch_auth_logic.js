const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldAuthBlock = `                            if (data.isPro) {
                                if (data.proExpiresAt) {
                                    const endsAt = data.proExpiresAt.toDate ? data.proExpiresAt.toDate().getTime() : data.proExpiresAt;
                                    if (Date.now() < endsAt) {
                                        setIsPro(true);
                                        setProExpiresAt(endsAt);
                                        if (data.plan) setPlan(data.plan);
                                    } else {
                                        setIsPro(false);
                                        setProExpiresAt(null);
                                        setPlan("");
                                    }
                                } else {
                                    setIsPro(true);
                                    if (data.plan) setPlan(data.plan);
                                }
                            } else {
                                setIsPro(false);
                            }`;

const newAuthBlock = `                            if (data.isPro) {
                                const now = Date.now();
                                
                                // Auto-calculate logic for Admin Manual Renewal
                                // Triggers if: forceRenew is true, or proExpiresAt is missing, or proExpiresAt is in the past
                                const existingExpiresAt = data.proExpiresAt ? (data.proExpiresAt.toDate ? data.proExpiresAt.toDate().getTime() : data.proExpiresAt) : 0;
                                
                                if (data.forceRenew || !existingExpiresAt || existingExpiresAt < now) {
                                    const planType = data.plan === '1_year' ? '1_year' : '1_month';
                                    const days = planType === '1_year' ? 365 : 30;
                                    
                                    // If renewing an active subscription early, add to existing time. Otherwise start from today.
                                    const baseDate = (existingExpiresAt > now) ? existingExpiresAt : now;
                                    const newExpiration = baseDate + (days * 24 * 60 * 60 * 1000);
                                    
                                    try {
                                        // Update Firestore instantly so the user doesn't renew every time they refresh
                                        await setDoc(docRef, {
                                            proExpiresAt: newExpiration,
                                            plan: planType,
                                            forceRenew: null, // Clear the trigger
                                            pendingTrx: null // Clear pending transaction
                                        }, { merge: true });
                                        
                                        setIsPro(true);
                                        setPlan(planType);
                                        setProExpiresAt(newExpiration);
                                    } catch (e) {
                                        console.error("Auto-renew update failed:", e);
                                        // Fallback if update fails
                                        setIsPro(true);
                                        setPlan(planType);
                                        setProExpiresAt(newExpiration);
                                    }
                                } else {
                                    // Subscription is active and not forcefully renewed
                                    setIsPro(true);
                                    setProExpiresAt(existingExpiresAt);
                                    if (data.plan) setPlan(data.plan);
                                }
                            } else {
                                setIsPro(false);
                                setProExpiresAt(null);
                                setPlan("");
                            }`;

code = code.replace(oldAuthBlock, newAuthBlock);

fs.writeFileSync('src/app/page.js', code);
console.log("Patched logic");
