const fs = require('fs');

let code = fs.readFileSync('src/app/MPTMockTest.js', 'utf8');

const oldLogic = `                const quotas = {
                    'Islamic Studies / Civics & Ethics': 20,
                    'Urdu': 20,
                    'English': 50,
                    'General Abilities': 60,
                    'General Knowledge': 50
                };

                let finalBlocks = [];
                Object.keys(quotas).forEach(sub => {
                    let shuffledBlocks = shuffle([...subjectBlocks[sub]]);
                    let selectedCount = 0;
                    for (let b of shuffledBlocks) {
                        if (selectedCount + b.length <= quotas[sub]) {
                            finalBlocks.push(b);
                            selectedCount += b.length;
                        } else if (selectedCount < quotas[sub] && b.length === 1) {
                            finalBlocks.push(b);
                            selectedCount += 1;
                        }
                        if (selectedCount === quotas[sub]) break;
                    }
                });

                // Shuffle the blocks so subjects are mixed, but passages remain contiguous
                finalBlocks = shuffle(finalBlocks);
                let finalQuestions = [];
                finalBlocks.forEach(b => finalQuestions = finalQuestions.concat(b));

                setQuestions(finalQuestions);`;

const newLogic = `                // Strictly ordered syllabus for the Mock Test
                const subjectOrder = [
                    'General Abilities',
                    'English',
                    'General Knowledge',
                    'Islamic Studies / Civics & Ethics',
                    'Urdu'
                ];

                const quotas = {
                    'General Abilities': 60,
                    'English': 50,
                    'General Knowledge': 50,
                    'Islamic Studies / Civics & Ethics': 20,
                    'Urdu': 20
                };

                let finalQuestions = [];
                
                // Iterate subjects exactly in the requested order
                subjectOrder.forEach(sub => {
                    if (!subjectBlocks[sub]) return;
                    let shuffledBlocks = shuffle([...subjectBlocks[sub]]);
                    let selectedCount = 0;
                    let subjectFinalBlocks = [];
                    
                    for (let b of shuffledBlocks) {
                        // Include whole passage blocks if they fit
                        if (selectedCount + b.length <= quotas[sub]) {
                            subjectFinalBlocks.push(b);
                            selectedCount += b.length;
                        } 
                        // Pad with standalone questions to hit the exact quota
                        else if (selectedCount < quotas[sub] && b.length === 1) {
                            subjectFinalBlocks.push(b);
                            selectedCount += 1;
                        }
                        if (selectedCount === quotas[sub]) break;
                    }
                    
                    // Add the selected blocks to the final exam array sequentially
                    subjectFinalBlocks.forEach(b => {
                        finalQuestions = finalQuestions.concat(b);
                    });
                });

                setQuestions(finalQuestions);`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/MPTMockTest.js', code);
console.log('Fixed subject order');
