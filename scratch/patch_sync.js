const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldEffect = `    useEffect(() => {
        if (!user || loadingAuth) return;
        const syncData = async () => {`;

const newEffect = `    useEffect(() => {
        if (!user || loadingAuth || appState !== 'main') return;
        const syncData = async () => {`;

code = code.replace(oldEffect, newEffect);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched syncData effect');
