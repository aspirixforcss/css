const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldFetch = `                const targetUrl = 'https://api.gumroad.com/v2/licenses/verify';
                const proxyUrl = \`https://corsproxy.io/?url=\${encodeURIComponent(targetUrl)}\`;
                
                const res = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: new URLSearchParams({
                        product_id: 'atDQnyJo_kNLN4DMI4LwOg==',
                        license_key: key,
                        increment_uses_count: 'true'
                    }).toString()
                });`;

const newFetch = `                // Put everything in the URL so public proxies don't strip them
                const targetUrl = \`https://api.gumroad.com/v2/licenses/verify?product_id=atDQnyJo_kNLN4DMI4LwOg%3D%3D&license_key=\${encodeURIComponent(key)}&increment_uses_count=true\`;
                const proxyUrl = \`https://corsproxy.io/?url=\${encodeURIComponent(targetUrl)}\`;
                
                const res = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: new URLSearchParams({
                        product_id: 'atDQnyJo_kNLN4DMI4LwOg==',
                        license_key: key,
                        increment_uses_count: 'true'
                    }).toString()
                });`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/app/page.js', code);
console.log('Patched to include product_id in URL');
