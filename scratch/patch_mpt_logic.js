const fs = require('fs');
let code = fs.readFileSync('src/app/MPTMockTest.js', 'utf8');

const oldLogic = `                // Group by subjects
                const grouped = {
                    'Islamic Studies / Civics & Ethics': [],
                    'Urdu': [],
                    'English': [],
                    'General Abilities': [],
                    'General Knowledge': []
                };

                rawData.forEach(q => {
                    const sub = q['Subject'];
                    if (grouped[sub]) {
                        grouped[sub].push(q);
                    }
                });

                // Shuffle helper
                const shuffle = (array) => {
                    let currentIndex = array.length, randomIndex;
                    while (currentIndex > 0) {
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex--;
                        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
                    }
                    return array;
                };

                // Select quotas
                const quotas = {
                    'Islamic Studies / Civics & Ethics': 20,
                    'Urdu': 20,
                    'English': 50,
                    'General Abilities': 60,
                    'General Knowledge': 50
                };

                let selectedQs = [];
                Object.keys(quotas).forEach(sub => {
                    const shuffledSub = shuffle([...grouped[sub]]);
                    selectedQs = selectedQs.concat(shuffledSub.slice(0, quotas[sub]));
                });

                // Shuffle the final 200 questions
                setQuestions(shuffle(selectedQs));`;

const newLogic = `                // Shuffle helper
                const shuffle = (array) => {
                    let currentIndex = array.length, randomIndex;
                    while (currentIndex > 0) {
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex--;
                        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
                    }
                    return array;
                };

                // Group by blocks to keep reading comprehension passages together
                let blocks = [];
                let currentBlockKey = null;
                let currentBlock = [];

                rawData.forEach((q, idx) => {
                    let blockKey = 'standalone_' + idx;
                    if (q.Subject === 'English') {
                        const match = q.Question.match(/\\[Passage \\d\\]/);
                        if (match) {
                            blockKey = q['Question Bank Source'] + '_' + match[0];
                        }
                    }
                    
                    if (blockKey === currentBlockKey) {
                        currentBlock.push(q);
                    } else {
                        if (currentBlock.length > 0) blocks.push(currentBlock);
                        currentBlockKey = blockKey;
                        currentBlock = [q];
                    }
                });
                if (currentBlock.length > 0) blocks.push(currentBlock);

                // Group blocks by subject
                const subjectBlocks = {
                    'Islamic Studies / Civics & Ethics': [],
                    'Urdu': [],
                    'English': [],
                    'General Abilities': [],
                    'General Knowledge': []
                };

                blocks.forEach(block => {
                    const sub = block[0].Subject;
                    if (subjectBlocks[sub]) {
                        subjectBlocks[sub].push(block);
                    }
                });

                const quotas = {
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

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/MPTMockTest.js', code);
console.log('Fixed MPT logic');
