const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldCheck = `                if (!gumroadData.success || gumroadData.purchase.refunded || gumroadData.purchase.chargebacked) {
                    throw new Error("Invalid, expired, or refunded license key.");
                }`;

const newCheck = `                if (!gumroadData.success) {
                    throw new Error(gumroadData.message || "Gumroad rejected this key (Invalid or does not exist).");
                }
                if (gumroadData.purchase.refunded || gumroadData.purchase.chargebacked) {
                    throw new Error("This license key was refunded or charged back.");
                }`;

code = code.replace(oldCheck, newCheck);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched error message');
