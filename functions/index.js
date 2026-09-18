const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

exports.activateLicense = onCall(async (request) => {
    // Authentication Guard
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to activate a license.");
    }

    const { licenseKey } = request.data;
    if (!licenseKey || typeof licenseKey !== "string") {
        throw new HttpsError("invalid-argument", "License key is required.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;
    const GUMROAD_PRODUCT_ID = "aspirix"; // From target product details

    const licenseRef = db.collection("licenses").doc(licenseKey);

    try {
        const result = await db.runTransaction(async (transaction) => {
            // Check if license already exists
            const licenseDoc = await transaction.get(licenseRef);

            if (licenseDoc.exists) {
                const data = licenseDoc.data();
                if (data.boundUserId !== uid) {
                    throw new HttpsError("already-exists", "This license key is already locked to another account.");
                }
                if (data.boundUserId === uid) {
                    // Already active for this user
                    return { success: true, plan: data.plan, expiresAt: data.expiresAt.toDate().getTime() };
                }
            }

            // Call Gumroad Verification API
            const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    product_permalink: GUMROAD_PRODUCT_ID,
                    license_key: licenseKey,
                    increment_uses_count: "true"
                })
            });

            const gumroadData = await response.json();

            if (!gumroadData.success || gumroadData.purchase.refunded || gumroadData.purchase.chargebacked) {
                throw new HttpsError("not-found", "Invalid, expired, or refunded license key.");
            }

            // Duration Parsing (1 Month vs 1 Year)
            const variants = (gumroadData.purchase.variants || "").toLowerCase();
            let planType = "1_month";
            const now = new Date();
            let expirationDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

            if (variants.includes("year")) {
                planType = "1_year";
                expirationDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 365 days
            }

            // Atomic Database Updates
            const userRef = db.collection("users").doc(uid);

            transaction.set(licenseRef, {
                boundUserId: uid,
                claimedEmail: email,
                plan: planType,
                activatedAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: admin.firestore.Timestamp.fromDate(expirationDate),
                status: "active"
            });

            transaction.set(userRef, {
                isPro: true,
                plan: planType,
                licenseKey: licenseKey,
                proExpiresAt: admin.firestore.Timestamp.fromDate(expirationDate)
            }, { merge: true });

            return {
                success: true,
                plan: planType,
                expiresAt: expirationDate.getTime()
            };
        });

        return result;

    } catch (error) {
        console.error("License activation error:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "An error occurred while activating the license.");
    }
});
