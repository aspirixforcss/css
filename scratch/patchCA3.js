const fs = require('fs');
let code = fs.readFileSync('scratch/CurrentAffairsView.js', 'utf8');

const oldFetch = `if (dawnItems.length > 0) {
                    const top = dawnItems[0];
                    const temp = document.createElement('div');
                    temp.innerHTML = top.content || top.description || "";
                    const text = temp.textContent || temp.innerText || "";
                    const sentences = text.split('. ').filter(s => s.trim().length > 30).slice(0, 4);
                    top.summaryPoints = sentences.map(s => s.trim() + (s.trim().endsWith('.') ? '' : '.'));
                }`;

const newFetch = `const parseSummary = (items) => {
                    items.forEach(item => {
                        const temp = document.createElement('div');
                        temp.innerHTML = item.content || item.description || "";
                        const text = temp.textContent || temp.innerText || "";
                        const sentences = text.split('. ').filter(s => s.trim().length > 30).slice(0, 4);
                        item.summaryPoints = sentences.map(s => s.trim() + (s.trim().endsWith('.') ? '' : '.'));
                    });
                };
                parseSummary(dawnItems);
                parseSummary(intlItems);`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('scratch/CurrentAffairsView.js', code);
console.log('Fixed CA Fetch');
