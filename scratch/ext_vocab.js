const fs = require('fs');

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

const code = fs.readFileSync('src/app/page.js', 'utf8');
fs.writeFileSync('scratch/VocabFlashcards.js', extractBlock(code, 'const VocabFlashcards ='));
console.log('Extracted VocabFlashcards');
