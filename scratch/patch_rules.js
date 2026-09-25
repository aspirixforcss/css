const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldParseLoop = `                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    data.forEach(row => {
                        if (!row || row.length < 2) return;
                        
                        const rowStr = row.join(' ').toLowerCase();`;

const newParseLoop = `                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    let currentRule = "Rule - " + sheetName;

                    data.forEach(row => {
                        if (!row || row.length < 2) {
                            if (row && row.length === 1 && typeof row[0] === 'string' && row[0].toLowerCase().includes('rule')) {
                                currentRule = row[0].trim();
                            }
                            return;
                        }
                        
                        const rowStr = row.join(' ').toLowerCase();`;

code = code.replace(oldParseLoop, newParseLoop);

const oldPush = `                        if (word && meaning) {
                            allVocab.push({
                                word: String(word).trim(),
                                meaning: String(meaning).trim(),
                                synonyms: syn,
                                antonyms: ant,
                                example: String(example || "").trim()
                            });
                        }`;

const newPush = `                        if (word && meaning) {
                            allVocab.push({
                                word: String(word).trim(),
                                meaning: String(meaning).trim(),
                                synonyms: syn,
                                antonyms: ant,
                                example: String(example || "").trim(),
                                rule: currentRule
                            });
                        }`;

code = code.replace(oldPush, newPush);
fs.writeFileSync('src/app/page.js', code);
