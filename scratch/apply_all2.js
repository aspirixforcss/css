const fs = require('fs');

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
        if ((char === '"' || char === "'" || char === '\`') && code[endIdx - 1] !== '\\') {
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

const sbOld = extractBlock(code, 'const Sidebar =');
const appOld = extractBlock(code, 'const App = () => {');
const vocabOld = extractBlock(code, 'const VocabFlashcards =');

const sbNew = fs.readFileSync('scratch/Sidebar.js', 'utf8');
const appNew = fs.readFileSync('scratch/App.js', 'utf8');
const vocabNew = fs.readFileSync('scratch/VocabFlashcards.js', 'utf8');

code = code.replace(sbOld, sbNew);
code = code.replace(appOld, appNew);
code = code.replace(vocabOld, vocabNew);

fs.writeFileSync('src/app/page.js', code);
console.log('Applied Sidebar, App, and VocabFlashcards');
