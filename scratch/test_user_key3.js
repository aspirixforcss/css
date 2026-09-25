async function test() {
    const targetUrl = 'https://api.gumroad.com/v2/licenses/verify';
    
    try {
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                product_id: 'atDQnyJo_kNLN4DMI4LwOg==',
                license_key: '29704657-CFD34FFB-A4F4488C-19F78D89',
                increment_uses_count: 'false'
            }).toString()
        });
        
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch (e) {
        console.error(e);
    }
}
test();
