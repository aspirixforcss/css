const fs = require('fs');

let sbCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');

// The oversized one I made:
const hugeSbLogo = `<div className="relative flex items-center justify-center w-full mt-8 mb-8 h-16 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-7 -left-1 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-56 h-14 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const scaledSbLogo = `<div className="relative flex items-center justify-center w-full mt-6 mb-4 h-14 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-5 left-2 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-44 h-11 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

sbCode = sbCode.replace(hugeSbLogo, scaledSbLogo);
fs.writeFileSync('scratch/Sidebar.js', sbCode);

// Just to be extremely sure about FactBook, let's read it and confirm it has flex-wrap
let fbCode = fs.readFileSync('scratch/FactBook.js', 'utf8');
if (!fbCode.includes('flex flex-wrap mb-8 gap-3')) {
    fbCode = fbCode.replace('<div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">', '<div className="flex flex-wrap mb-8 gap-3">');
    fs.writeFileSync('scratch/FactBook.js', fbCode);
}

// Now write an applicator script
const appScript = `const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

function extractBlock(code, startStr) {
    const startIdx = code.indexOf(startStr);
    if (startIdx === -1) return '';
    let arrowIdx = code.indexOf('=>', startIdx);
    if (arrowIdx === -1) arrowIdx = startIdx;
    if (startStr.includes('function App')) arrowIdx = startIdx;
    const blockStart = code.indexOf('{', arrowIdx);
    let braces = 1;
    let endIdx = blockStart + 1;
    let inString = false;
    let stringChar = '';

    while (braces > 0 && endIdx < code.length) {
        const char = code[endIdx];
        if ((char === '"' || char === "'" || char === '\`') && code[endIdx - 1] !== '\\\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (stringChar === char) {
                inString = false;
            }
        }
        if (!inString) {
            if (char === '{') braces++;
            if (char === '}') braces--;
        }
        endIdx++;
    }
    return code.substring(startIdx, endIdx);
}

const fbOld = extractBlock(code, 'const FactBook =');
const sbOld = extractBlock(code, 'const Sidebar =');

const fbNew = fs.readFileSync('scratch/FactBook.js', 'utf8');
const sbNew = fs.readFileSync('scratch/Sidebar.js', 'utf8');

code = code.replace(fbOld, fbNew);
code = code.replace(sbOld, sbNew);

fs.writeFileSync('src/app/page.js', code);
console.log('Applied FactBook and Sidebar');
`;
fs.writeFileSync('scratch/apply_fixes.js', appScript);

console.log('Setup script ready');
