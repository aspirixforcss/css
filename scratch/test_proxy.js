const fetch = require('node-fetch');

async function test() {
    const targetUrl = 'https://api.gumroad.com/v2/licenses/verify';
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    
    try {
        const res = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                product_permalink: 'aspirix',
                license_key: 'FAKE-KEY',
                increment_uses_count: 'true'
            })
        });
        
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch (e) {
        console.error(e);
    }
}
test();
