import React, { useState, useEffect } from 'react';

const MPTMockTest = ({ isPro }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const questionsPerPage = 10;

    useEffect(() => {
        if (!isPro) return;

        const loadQuestions = async () => {
            try {
                const res = await fetch('/mpt_mock.json');
                const rawData = await res.json();
                
                // Group by subjects
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
                setQuestions(shuffle(selectedQs));
                setLoading(false);
            } catch (err) {
                console.error("Failed to load MPT mock test", err);
                setLoading(false);
            }
        };

        loadQuestions();
    }, [isPro]);

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <i className="fa-solid fa-lock text-6xl text-slate-300 mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pro Feature Locked</h2>
                <p className="text-slate-500 mb-6">You must be a Pro user to access the MPT Mock Test.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary mb-4"></i>
                <p className="font-bold text-slate-500">Loading Mock Test (200 Questions)...</p>
            </div>
        );
    }

    if (showResults) {
        let score = 0;
        const wrongQs = [];
        
        questions.forEach((q, idx) => {
            const userAns = answers[idx];
            // Format check: excel has "Option B". We just compare exactly.
            if (userAns === q['Correct Option']) {
                score++;
            } else {
                wrongQs.push({ q, idx, userAns });
            }
        });

        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
                <div className="bg-white dark:bg-surfaceDark p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center mb-8">
                    <h2 className="text-3xl font-black mb-2">Mock Test Results</h2>
                    <div className="text-6xl font-black text-primary my-6">{score} <span className="text-2xl text-slate-400">/ 200</span></div>
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                        {score >= 100 ? '🎉 Great job! You passed the mock test.' : 'Keep practicing! You need 33% to pass the real MPT, but aim higher!'}
                    </p>
                </div>

                {wrongQs.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white border-b pb-2">Questions to Review</h3>
                        {wrongQs.map((item, i) => (
                            <div key={i} className="bg-white dark:bg-surfaceDark p-6 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30">
                                <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg mb-3">Q{item.idx + 1} - {item.q.Subject}</span>
                                <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{item.q.Question}</h4>
                                
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                                        <p className="text-xs font-bold text-red-500 mb-1">Your Answer:</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                                            {item.userAns ? item.q[item.userAns] : <i className="text-slate-400">Unanswered</i>}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl">
                                        <p className="text-xs font-bold text-green-600 mb-1">Correct Answer:</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{item.q[item.q['Correct Option']]}</p>
                                    </div>
                                </div>
                                
                                {item.q.Explanation && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl mt-4">
                                        <p className="text-xs font-bold text-blue-600 mb-1"><i className="fa-solid fa-lightbulb"></i> Explanation:</p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item.q.Explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const startIndex = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);
    const totalPages = Math.ceil(questions.length / questionsPerPage);

    const handleOptionSelect = (qIdx, optionKey) => {
        setAnswers(prev => ({
            ...prev,
            [qIdx]: optionKey
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
            <div className="flex items-center justify-between mb-8 bg-white dark:bg-surfaceDark p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">MPT Mock Test</h2>
                    <p className="text-sm font-medium text-slate-500">200 MCQs • Real Exam Format</p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-primary">Page {currentPage + 1} / {totalPages}</div>
                    <div className="text-xs font-bold text-slate-400">{Object.keys(answers).length} Attempted</div>
                </div>
            </div>

            <div className="space-y-6">
                {currentQuestions.map((q, localIdx) => {
                    const globalIdx = startIndex + localIdx;
                    return (
                        <div key={globalIdx} className="bg-white dark:bg-surfaceDark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-black text-slate-300 dark:text-slate-600 text-xl w-10">{globalIdx + 1}.</span>
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex-1 leading-relaxed">{q.Question}</h3>
                            </div>
                            <div className="pl-10 space-y-3">
                                {['Option A', 'Option B', 'Option C', 'Option D'].map(optKey => {
                                    if (!q[optKey]) return null;
                                    const isSelected = answers[globalIdx] === optKey;
                                    return (
                                        <button 
                                            key={optKey}
                                            onClick={() => handleOptionSelect(globalIdx, optKey)}
                                            className={\`w-full text-left p-4 rounded-xl border-2 transition-all font-medium \${
                                                isSelected 
                                                    ? 'border-primary bg-primary/5 text-primary' 
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                            }\`}
                                        >
                                            <span className={\`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-3 \${isSelected ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700'}\`}>
                                                {optKey.replace('Option ', '')}
                                            </span>
                                            {q[optKey]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-10">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl disabled:opacity-50 hover:bg-slate-300 transition-colors"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                </button>

                {currentPage === totalPages - 1 ? (
                    <button 
                        onClick={() => setShowResults(true)}
                        className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:bg-red-700 shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
                    >
                        Submit Test <i className="fa-solid fa-check ml-2"></i>
                    </button>
                ) : (
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        className="px-8 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-800/20"
                    >
                        Next <i className="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default MPTMockTest;
