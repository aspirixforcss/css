const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldAuthLogic = `                            if (data.isPro) {
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
                                            forceRenew: false, // Clear the trigger
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
                            }
                            setAppState('main');
                        } else {
                            setAppState('onboarding');
                        }
                    } else {
                        setAppState('onboarding');
                    }`;

const newAuthLogic = `                            if (data.isPro) {
                                const now = Date.now();
                                const existingExpiresAt = data.proExpiresAt ? (data.proExpiresAt.toDate ? data.proExpiresAt.toDate().getTime() : data.proExpiresAt) : 0;
                                
                                if (data.forceRenew || !existingExpiresAt) {
                                    const planType = data.plan === '1_year' ? '1_year' : '1_month';
                                    const days = planType === '1_year' ? 365 : 30;
                                    
                                    const baseDate = (existingExpiresAt > now) ? existingExpiresAt : now;
                                    const newExpiration = baseDate + (days * 24 * 60 * 60 * 1000);
                                    
                                    try {
                                        await setDoc(docRef, {
                                            proExpiresAt: newExpiration,
                                            plan: planType,
                                            forceRenew: false,
                                            pendingTrx: null
                                        }, { merge: true });
                                        
                                        setIsPro(true);
                                        setPlan(planType);
                                        setProExpiresAt(newExpiration);
                                    } catch (e) {
                                        setIsPro(true);
                                        setPlan(planType);
                                        setProExpiresAt(newExpiration);
                                    }
                                } else if (existingExpiresAt < now) {
                                    // Subscription or 7-day trial has naturally EXPIRED
                                    try {
                                        await setDoc(docRef, {
                                            isPro: false,
                                            plan: "expired"
                                        }, { merge: true });
                                    } catch (e) { console.error(e); }
                                    
                                    setIsPro(false);
                                    setPlan("expired");
                                    setProExpiresAt(existingExpiresAt);
                                } else {
                                    // Subscription is active
                                    setIsPro(true);
                                    setProExpiresAt(existingExpiresAt);
                                    if (data.plan) setPlan(data.plan);
                                }
                            } else {
                                setIsPro(false);
                                setProExpiresAt(null);
                                setPlan(data.plan || "");
                            }
                            setAppState('main');
                        } else {
                            // Document exists but no subjects (partially onboarded)
                            setAppState('onboarding');
                        }
                    } else {
                        // COMPLETELY NEW USER: Give 7 days free trial immediately
                        const trialEnd = Date.now() + (7 * 24 * 60 * 60 * 1000);
                        setIsPro(true);
                        setPlan("7_days_trial");
                        setProExpiresAt(trialEnd);
                        setAppState('onboarding');
                    }`;

code = code.replace(oldAuthLogic, newAuthLogic);
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed onAuth logic');
