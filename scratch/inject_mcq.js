const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const newComponent = `
const SubjectWiseMCQs = ({ selectedSubjects }) => {
    const [activeSubject, setActiveSubject] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    
    // Fetching state
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [liveQuestions, setLiveQuestions] = useState([]); 
    
    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState([]); 
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);

    // IMPORTANT: User must provide the Folder ID of "CSS mix data"
    const CSS_MIX_DATA_FOLDER_ID = 'YOUR_CSS_MIX_DATA_FOLDER_ID_HERE';

    const activeSubs = [...compulsorySubjects, ...optionalSubjects]
        .filter(s => s.id !== 'comp_essay' && (compulsorySubjects.some(c => c.id === s.id) || selectedSubjects.includes(s.id)));

    const fetchSubjectData = async (subject) => {
        setIsFetching(true);
        setFetchError(null);
        setActiveSubject(subject);
        
        try {
            const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
            
            // 1. List contents of CSS mix data folder
            const rootUrl = \`https://www.googleapis.com/drive/v3/files?q='\${CSS_MIX_DATA_FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&key=\${API_KEY}\`;
            const rootRes = await fetch(rootUrl);
            const rootData = await rootRes.json();
            
            if (rootData.error) throw new Error("Could not access CSS mix data folder. Check if the FOLDER_ID is correct and it is shared as 'Anyone with the link can view'.");
            
            const foldersToSearch = rootData.files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
            
            let targetFile = null;
            for (let folder of foldersToSearch) {
                const subUrl = \`https://www.googleapis.com/drive/v3/files?q='\${folder.id}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&key=\${API_KEY}\`;
                const subRes = await fetch(subUrl);
                const subData = await subRes.json();
                
                // Try to match subject name
                const searchKeywords = subject.name.toLowerCase().split(' ').filter(w => w.length > 3);
                if (searchKeywords.length === 0) searchKeywords.push(subject.name.toLowerCase());
                
                targetFile = subData.files?.find(f => {
                    const fn = f.name.toLowerCase();
                    return searchKeywords.some(kw => fn.includes(kw));
                });
                
                if (targetFile) break;
            }
            
            if (!targetFile) {
                throw new Error(\`Could not find an Excel file for "\${subject.name}" in Compulsory or Optional folders.\`);
            }
            
            const fileUrl = targetFile.mimeType === 'application/vnd.google-apps.spreadsheet' 
                ? \`https://www.googleapis.com/drive/v3/files/\${targetFile.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&key=\${API_KEY}\`
                : \`https://www.googleapis.com/drive/v3/files/\${targetFile.id}?alt=media&key=\${API_KEY}\`;
                
            const fileRes = await fetch(fileUrl);
            const arrayBuffer = await fileRes.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            let questions = [];
            data.forEach((row, idx) => {
                if (idx === 0 || !row || row.length < 5) return; 
                if (String(row[0]).toLowerCase().includes('question')) return;
                
                // Assuming Question is column 0 or 1. Let's find first string that ends with ? or is long.
                // We'll safely map standard columns: 0=Q, 1=A, 2=B, 3=C, 4=D, 5=Answer
                let qStr = String(row[0] || "");
                if(!qStr || qStr.trim().length < 5) return;

                questions.push({
                    question: qStr,
                    options: [String(row[1] || "A"), String(row[2] || "B"), String(row[3] || "C"), String(row[4] || "D")],
                    answer: String(row[5] || ""),
                    explanation: row[6] ? String(row[6]) : ""
                });
            });
            
            if (questions.length < 5) {
                throw new Error("Not enough questions parsed. Ensure the file has columns: Question, OptA, OptB, OptC, OptD, CorrectAnswer");
            }
            
            setLiveQuestions(questions);
            startQuizSession(questions);
            
        } catch (err) {
            console.error(err);
            setFetchError(err.message);
            setIsFetching(false);
        }
    };

    const startQuizSession = (allQuestions) => {
        // Pick 20 random
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 20);
        
        const processed = selected.map(q => {
            let correctIdx = 0;
            const ansStr = String(q.answer).trim().toUpperCase();
            if (['A','B','C','D'].includes(ansStr)) {
                correctIdx = ansStr.charCodeAt(0) - 65;
            } else if (ansStr === '1' || ansStr === '2' || ansStr === '3' || ansStr === '4') {
                correctIdx = parseInt(ansStr) - 1;
            } else {
                const foundIdx = q.options.findIndex(opt => String(opt).trim().toLowerCase() === String(q.answer).trim().toLowerCase());
                if (foundIdx !== -1) correctIdx = foundIdx;
            }
            return { ...q, correctIdx };
        });

        setQuizQuestions(processed);
        setQuizStarted(true);
        setCurrentQ(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setShowExplanation(false);
        setUserAnswers([]);
        setIsFetching(false);
    };

    const handleAnswer = (idx) => {
        if (selectedOption !== null) return;
        setSelectedOption(idx);
        
        const isCorrect = idx === quizQuestions[currentQ].correctIdx;
        if (isCorrect) setScore(s => s + 1);
        
        setUserAnswers(prev => [...prev, {
            q: quizQuestions[currentQ],
            selectedIdx: idx,
            isCorrect
        }]);
        
        setShowExplanation(true);
    };

    const handleNextQ = () => {
        if (currentQ + 1 < quizQuestions.length) {
            setCurrentQ(c => c + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setShowResult(true);
        }
    };

    if (!quizStarted) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Subject-wise MCQs</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Test your knowledge with 20 random MCQs per quiz. Only your selected subjects are shown.</p>
                
                {fetchError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold flex gap-3 items-start">
                        <i className="fa-solid fa-circle-exclamation mt-1"></i>
                        <div>
                            <p>{fetchError}</p>
                            <p className="text-sm font-medium mt-1">Make sure you have provided the correct CSS_MIX_DATA_FOLDER_ID in the code!</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSubs.map(sub => (
                        <div key={sub.id} className="bg-white dark:bg-surfaceDark rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center text-2xl mb-4 shadow-inner">
                                <i className={sub.icon || "fa-solid fa-book"}></i>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{sub.name}</h3>
                            <button 
                                onClick={() => fetchSubjectData(sub)}
                                disabled={isFetching}
                                className="mt-auto px-6 py-2.5 rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors w-full disabled:opacity-50"
                            >
                                {isFetching && activeSubject?.id === sub.id ? (
                                    <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Fetching...</>
                                ) : "Start 20 MCQs Quiz"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        let message = "Excellent work!";
        if (percentage < 50) message = "Keep practicing, you'll get there!";
        else if (percentage < 80) message = "Good job, solid effort!";

        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
                <div className="bg-white dark:bg-surfaceDark rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800 text-center mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Quiz Completed</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{message}</p>
                    
                    <div className="w-48 h-48 rounded-full border-8 border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center mx-auto mb-8 shadow-inner relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100 dark:text-slate-800"
                                strokeDasharray="100, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3"
                            />
                            <path
                                className={percentage >= 50 ? "text-green-500" : "text-red-500"}
                                strokeDasharray={\`\${percentage}, 100\`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3"
                            />
                        </svg>
                        <span className="text-5xl font-black text-slate-800 dark:text-white">{score}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">out of {quizQuestions.length}</span>
                    </div>
                    
                    <button onClick={() => setQuizStarted(false)} className="px-8 py-4 rounded-2xl font-black bg-slate-800 dark:bg-slate-700 text-white shadow-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-3 mx-auto">
                        <i className="fa-solid fa-rotate-left"></i> Take Another Quiz
                    </button>
                </div>

                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Review Answers</h3>
                    {userAnswers.map((ua, i) => (
                        <div key={i} className={\`p-6 rounded-2xl border-2 \${ua.isCorrect ? 'border-green-100 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' : 'border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'}\`}>
                            <div className="flex gap-4">
                                <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${ua.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}\`}>
                                    <i className={\`fa-solid \${ua.isCorrect ? 'fa-check' : 'fa-xmark'}\`}></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Q{i+1}. {ua.q.question}</h4>
                                    
                                    <div className="space-y-2">
                                        {ua.q.options.map((opt, optIdx) => {
                                            const isSelected = ua.selectedIdx === optIdx;
                                            const isActualCorrect = ua.q.correctIdx === optIdx;
                                            
                                            let bgClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                                            let textClass = "text-slate-600 dark:text-slate-300";
                                            let icon = null;
                                            
                                            if (isActualCorrect) {
                                                bgClass = "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700";
                                                textClass = "text-green-800 dark:text-green-300 font-bold";
                                                icon = <i className="fa-solid fa-check text-green-600 dark:text-green-400"></i>;
                                            } else if (isSelected && !isActualCorrect) {
                                                bgClass = "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700";
                                                textClass = "text-red-800 dark:text-red-300 font-bold";
                                                icon = <i className="fa-solid fa-xmark text-red-600 dark:text-red-400"></i>;
                                            }
                                            
                                            return (
                                                <div key={optIdx} className={\`p-3 rounded-xl border flex justify-between items-center \${bgClass} \${textClass}\`}>
                                                    <span>{opt}</span>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setQuizStarted(false)} className="px-5 py-2.5 rounded-xl font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Exit Quiz
                </button>
                <div className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl border border-primary/20">
                    Question {currentQ + 1} / {quizQuestions.length}
                </div>
            </div>
            
            <div className="bg-white dark:bg-surfaceDark rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1.5 bg-primary transition-all duration-300" style={{ width: \`\${((currentQ) / quizQuestions.length) * 100}%\` }}></div>
                
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-8 leading-tight">
                    {quizQuestions[currentQ].question}
                </h3>
                
                <div className="space-y-4">
                    {quizQuestions[currentQ].options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = quizQuestions[currentQ].correctIdx === idx;
                        
                        let btnClass = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary hover:shadow-md hover:-translate-y-0.5";
                        
                        if (showExplanation) {
                            if (isCorrect) btnClass = "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300 ring-2 ring-green-400/50";
                            else if (isSelected) btnClass = "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300";
                            else btnClass = "bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
                        }
                        
                        return (
                            <button
                                key={idx}
                                disabled={showExplanation}
                                onClick={() => handleAnswer(idx)}
                                className={\`w-full p-5 rounded-2xl border-2 font-semibold text-left transition-all duration-300 flex justify-between items-center \${btnClass}\`}
                            >
                                <span className="text-lg">{opt}</span>
                                {showExplanation && isCorrect && <i className="fa-solid fa-check-circle text-2xl text-green-500"></i>}
                                {showExplanation && isSelected && !isCorrect && <i className="fa-solid fa-times-circle text-2xl text-red-500"></i>}
                            </button>
                        )
                    })}
                </div>
                
                {showExplanation && (
                    <div className="mt-8 animate-fade-in">
                        {quizQuestions[currentQ].explanation && (
                            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 mb-6">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><i className="fa-solid fa-lightbulb text-blue-500"></i> Explanation</h4>
                                <p className="text-blue-700 dark:text-blue-200 leading-relaxed">{quizQuestions[currentQ].explanation}</p>
                            </div>
                        )}
                        <button 
                            onClick={handleNextQ}
                            className="w-full p-4 rounded-2xl bg-primary text-white font-black text-lg hover:bg-primaryDark transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                        >
                            {currentQ + 1 < quizQuestions.length ? (
                                <>Next Question <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i></>
                            ) : (
                                <>View Results <i className="fa-solid fa-flag-checkered group-hover:scale-110 transition-transform"></i></>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
`;

// Insert the new component right before VocabFlashcards
const insertionPointStr = "const VocabFlashcards = ({ isPro }) => {";

if (code.includes(insertionPointStr)) {
    code = code.replace(insertionPointStr, newComponent + "\n\n" + insertionPointStr);
    fs.writeFileSync('src/app/page.js', code);
    console.log("Injected SubjectWiseMCQs");
} else {
    console.log("Could not find insertion point!");
}
