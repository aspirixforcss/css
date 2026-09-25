const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldFetch = `                const targetUrl = 'https://api.gumroad.com/v2/licenses/verify';
                const proxyUrl = \`https://corsproxy.io/?url=\${encodeURIComponent(targetUrl)}\`;
                
                const res = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        product_permalink: 'aspirix',
                        license_key: key,
                        increment_uses_count: 'true'
                    })
                });`;

const newFetch = `                // Send parameters in both URL and Body to ensure public proxies don't strip them
                const targetUrl = \`https://api.gumroad.com/v2/licenses/verify?product_permalink=aspirix&license_key=\${encodeURIComponent(key)}&increment_uses_count=true\`;
                const proxyUrl = \`https://corsproxy.io/?url=\${encodeURIComponent(targetUrl)}\`;
                
                const res = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: new URLSearchParams({
                        product_permalink: 'aspirix',
                        license_key: key,
                        increment_uses_count: 'true'
                    }).toString()
                });`;

code = code.replace(oldFetch, newFetch);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched proxy request');
