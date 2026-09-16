"use client";
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import { compulsorySubjects, optionalSubjects, syllabusData, sampleMcqs, sampleVocab } from './data';

const LoginScreen = ({ onLogin }) => {
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            onLogin(result.user);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed: " + error.message);
        }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-bgDark p-4 relative overflow-hidden transition-colors">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
          
          <div className="max-w-md w-full glass dark:bg-surfaceDark/80 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 relative z-10 animate-fade-in text-center">
              <div className="w-20 h-20 bg-primary mx-auto rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 transform -rotate-6">
                  <i className="fa-solid fa-graduation-cap text-4xl text-white transform rotate-6"></i>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">CSS<span className="text-primary">.</span>PREP</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your Ultimate FPSC Journey Starts Here.</p>
              
              <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 py-3.5 px-4 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-0.5"
              >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
              </button>
              <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">By continuing, you agree to our Terms & FPSC Data Policy.</p>
          </div>
      </div>
    );
};

const OnboardingWizard = ({ onComplete }) => {
    const [selected, setSelected] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    
    const totalMarks = selected.reduce((sum, id) => {
        const sub = optionalSubjects.find(s => s.id === id);
        return sum + (sub ? sub.marks : 0);
    }, 0);

    const toggleSubject = (id) => {
        setErrorMessage("");
        const subToToggle = optionalSubjects.find(s => s.id === id);
        
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            if (totalMarks + subToToggle.marks > 600) {
                setErrorMessage("Total optional marks cannot exceed 600.");
                return;
            }

            const groupNum = subToToggle.group;
            const groupSubjects = optionalSubjects.filter(s => s.group === groupNum);
            
            const currentGroupMarks = selected.reduce((sum, sId) => {
                const s = groupSubjects.find(item => item.id === sId);
                return sum + (s ? s.marks : 0);
            }, 0);
            
            const currentGroupCount = selected.filter(sId => groupSubjects.find(item => item.id === sId)).length;

            if (groupNum === 1) {
                if (currentGroupCount >= 1) {
                    setErrorMessage("Group I: You can only select one subject (200 marks).");
                    return;
                }
            } else if (groupNum === 2) {
                if (currentGroupMarks + subToToggle.marks > 200) {
                    setErrorMessage("Group II: You can only select up to 200 marks.");
                    return;
                }
            } else {
                if (currentGroupCount >= 1) {
                    setErrorMessage(`Group ${groupNum}: You can only select one subject (100 marks).`);
                    return;
                }
            }

            setSelected([...selected, id]);
        }
    };

    const isComplete = totalMarks === 600;
    const progressPercentage = (totalMarks / 600) * 100;

    return (
        <div className="fixed inset-0 bg-bgLight dark:bg-bgDark overflow-y-auto p-4 md:p-8 transition-colors z-50">
            <div className="max-w-5xl mx-auto animate-fade-in pb-32">
                <div className="text-center mb-10 mt-6">
                    <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-3">FPSC Optional Subject Selection</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Select exactly 600 marks adhering to group limits to unlock your dashboard.</p>
                    {errorMessage && (
                        <div className="mt-4 inline-block bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
                            {errorMessage}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-6 w-full">
                        <div className="bg-white dark:bg-surfaceDark p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                    <i className="fa-solid fa-lock text-slate-400"></i> Compulsory Subjects
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">600 Marks</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                                {compulsorySubjects.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <i className="fa-solid fa-check-circle text-primary"></i>
                                        <span className="font-medium">{sub.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surfaceDark p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Optional Groups I - VII</h3>
                            </div>
                            
                            <div className="space-y-8">
                                {[1,2,3,4,5,6,7].map(groupNum => {
                                    const groupSubjects = optionalSubjects.filter(s => s.group === groupNum);
                                    if (groupSubjects.length === 0) return null;
                                    
                                    let groupRule = "Select one subject (100 marks)";
                                    if (groupNum === 1) groupRule = "Select one subject (200 marks)";
                                    if (groupNum === 2) groupRule = "Select up to 200 marks";

                                    return (
                                        <div key={groupNum} className="relative pl-5 border-l-2 border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Group {groupNum}</h4>
                                                <span className="text-xs font-semibold text-primary">{groupRule}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {groupSubjects.map(subject => {
                                                    const isSelected = selected.includes(subject.id);
                                                    return (
                                                        <div 
                                                            key={subject.id} 
                                                            onClick={() => toggleSubject(subject.id)}
                                                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all 
                                                            ${isSelected ? 'bg-primary/5 border-primary shadow-sm dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${isSelected ? 'bg-primary text-white border-primary' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
                                                                {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                                                            </div>
                                                            <div className="flex-1 font-semibold text-sm text-slate-700 dark:text-slate-300">{subject.name}</div>
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{subject.marks}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-80 lg:sticky lg:top-6">
                        <div className="bg-white dark:bg-surfaceDark p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-center text-lg">Your Selection</h3>
                            
                            <div className="relative w-48 h-48 mx-auto mb-8">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="84" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="12" />
                                    <circle 
                                        cx="96" cy="96" r="84" fill="none" 
                                        stroke={isComplete ? '#16a34a' : '#fbbf24'} 
                                        strokeWidth="12" 
                                        strokeDasharray="527.7" 
                                        strokeDashoffset={527.7 - (527.7 * progressPercentage) / 100} 
                                        className="transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className={`text-4xl font-black ${isComplete ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>{totalMarks}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">/ 600 Marks</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8 max-h-48 overflow-y-auto pr-2">
                                {selected.map(id => {
                                    const sub = optionalSubjects.find(s => s.id === id);
                                    return (
                                        <div key={id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{sub.name}</span>
                                            <span className="font-bold text-primary">{sub.marks}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <button 
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
                                ${isComplete ? 'bg-primary hover:bg-primaryDark shadow-primary/30' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'}`}
                                disabled={!isComplete}
                                onClick={() => onComplete(selected)}
                            >
                                {isComplete ? <><i className="fa-solid fa-rocket"></i> Launch Dashboard</> : `Select ${600 - totalMarks} More Marks`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ currentView, setCurrentView, isDarkMode, toggleTheme, user }) => {
    const navItems = [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
        { id: 'syllabus', icon: 'fa-book-open', label: 'Syllabus Tracker' },
        { id: 'timetable', icon: 'fa-calendar-days', label: 'Study Timetable' },
        { id: 'pastpapers', icon: 'fa-file-lines', label: 'Past Papers' },
        { id: 'factbook', icon: 'fa-book-bookmark', label: 'Fact Book' },
        { id: 'currentaffairs', icon: 'fa-globe', label: 'Current Affairs Hot Topics' },
        { id: 'mcqs', icon: 'fa-list-check', label: 'Subject MCQs' },
        { id: 'vocab', icon: 'fa-spell-check', label: 'Vocab MCQs' },
        { id: 'flashcards', icon: 'fa-clone', label: 'Flash Cards' },
    ];

    return (
        <div className="w-full bg-surfaceDark text-slate-300 h-full flex flex-col shadow-xl z-20 relative">
            <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
                    </div>
                    <h1 className="text-xl font-extrabold text-white">CSS<span className="text-primaryLight">.</span>PREP</h1>
                </div>
                <button onClick={toggleTheme} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                    <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
            </div>
            
            <nav className="flex-1 px-4 mt-6 space-y-1.5 overflow-y-auto">
                {navItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            currentView === item.id 
                            ? 'bg-primary/10 text-primaryLight border border-primary/20' 
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'
                        }`}
                    >
                        <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                        <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 m-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-3">
                    <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=16a34a&color=fff&rounded=true`} alt="Avatar" className="w-10 h-10 rounded-full" />
                    <div className="overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{user?.displayName || 'Aspirant'}</div>
                        <div className="text-[10px] text-green-400 flex items-center gap-1 truncate">
                            <i className="fa-solid fa-circle text-[8px]"></i> {user?.email || 'Logged In'}
                        </div>
                    </div>
                </div>
                <button onClick={() => signOut(auth)} className="w-full mt-4 py-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold rounded-lg transition-colors border border-slate-600">
                    <i className="fa-solid fa-right-from-bracket mr-1"></i> Sign Out
                </button>
            </div>
        </div>
    );
};

const CountdownTimerModal = ({ isOpen, onClose, settings }) => {
    const [minutes, setMinutes] = useState(25);
    const [taskName, setTaskName] = useState("");
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (isOpen && !isActive) setTimeLeft(minutes * 60);
    }, [isOpen, minutes, isActive]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-bgDark flex flex-col items-center justify-center z-[100] text-white p-4">
            <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-3xl"></i>
            </button>
            
            <div className="mb-8 flex gap-3">
                {[15, 25, 45, 60].map(m => (
                    <button key={m} onClick={() => { setMinutes(m); setTimeLeft(m * 60); setIsActive(false); }} className={`px-4 py-2 rounded-xl border text-sm font-bold ${minutes === m ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400'}`}>
                        {m} min
                    </button>
                ))}
            </div>

            <div className="text-[10rem] font-light tracking-tighter mb-12 tabular-nums">
                {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4">
                <button onClick={() => setIsActive(!isActive)} className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 ${isActive ? 'bg-amber-500 text-white' : 'bg-primary text-white'}`}>
                    <i className={`fa-solid ${isActive ? 'fa-pause' : 'fa-play'}`}></i> {isActive ? 'Pause' : 'Start Focus'}
                </button>
                <button onClick={() => { setIsActive(false); setTimeLeft(minutes * 60); }} className="px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold border border-slate-700">
                    <i className="fa-solid fa-rotate-left"></i>
                </button>
            </div>
        </div>
    );
};

const Dashboard = ({ selectedSubjects, completedTopics, openTimer, dailyStreak }) => {
    const calculateProgress = (subjectList) => {
        let total = 0; let done = 0;
        subjectList.forEach(sub => {
            if(!syllabusData[sub.id]) return;
            syllabusData[sub.id].forEach((section, secIdx) => {
                if(!section.topics) return;
                section.topics.forEach((topic, topicIdx) => {
                    total += topic.subtopics.length;
                    done += topic.subtopics.filter(t => completedTopics[`${sub.id}_${secIdx}_${topicIdx}_${t}`]).length;
                });
            });
        });
        return { total, done };
    };
    const compStats = calculateProgress(compulsorySubjects);
    const optStats = calculateProgress(optionalSubjects.filter(sub => selectedSubjects.includes(sub.id)));
    const compPercent = compStats.total > 0 ? Math.round((compStats.done / compStats.total) * 100) : 0;
    const optPercent = optStats.total > 0 ? Math.round((optStats.done / optStats.total) * 100) : 0;
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Dashboard & Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400">CE-2025 countdown: <span className="font-bold text-primary">142 Days Remaining</span></p>
                </div>
                <button onClick={openTimer} className="bg-white dark:bg-surfaceDark text-slate-800 dark:text-white px-6 py-4 rounded-2xl font-bold shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:-translate-y-1 transition-all">
                    <i className="fa-solid fa-stopwatch text-primary text-xl"></i> Launch Stopwatch
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-surfaceDark p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Compulsory Progress</h3>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-4xl font-black text-blue-500">{compPercent}%</div>
                        <div className="text-sm font-semibold text-slate-400">{compStats.done} / {compStats.total} Topics</div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${compPercent}%`}}></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-surfaceDark p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Optional Progress</h3>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-4xl font-black text-primary">{optPercent}%</div>
                        <div className="text-sm font-semibold text-slate-400">{optStats.done} / {optStats.total} Topics</div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: `${optPercent}%`}}></div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-6 rounded-3xl text-white flex flex-col justify-center">
                    <h3 className="font-bold mb-1 text-green-100">Daily Streak</h3>
                    <div className="text-4xl font-black flex items-center gap-2">{dailyStreak} Days <i className="fa-solid fa-fire text-yellow-300"></i></div>
                </div>
            </div>
        </div>
    );
};


const PastPapersView = ({ rootFolderId, selectedSubjects }) => {    const [currentFolderId, setCurrentFolderId] = useState(rootFolderId);
    const [folderHistory, setFolderHistory] = useState([{ id: rootFolderId, name: 'Root' }]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';

    const stripStr = (str) => str.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, '').trim();

    const unselectedSubjects = [...compulsorySubjects, ...optionalSubjects]
        .filter(s => !selectedSubjects.includes(s.id) && !compulsorySubjects.some(c => c.id === s.id))
        .map(s => stripStr(s.name));

    const activeSubjects = [...compulsorySubjects, ...optionalSubjects]
        .filter(s => selectedSubjects.includes(s.id) || compulsorySubjects.some(c => c.id === s.id))
        .map(s => stripStr(s.name));

    const selectedGroups = optionalSubjects.filter(s => selectedSubjects.includes(s.id)).map(s => s.group);

    const fetchFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${currentFolderId}'+in+parents+and+trashed=false&orderBy=folder,name&fields=files(id,name,mimeType)&key=${API_KEY}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            setFiles(data.files || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchFiles(); }, [currentFolderId]);
    const handleFolderClick = (folder) => {
        setFolderHistory(prev => [...prev, { id: folder.id, name: folder.name }]);
        setCurrentFolderId(folder.id);
        setSelectedFile(null);
    };
    const handleBreadcrumbClick = (index) => {
        const newHistory = folderHistory.slice(0, index + 1);
        setFolderHistory(newHistory);
        setCurrentFolderId(newHistory[newHistory.length - 1].id);
        setSelectedFile(null);
    };
    return (
        <div className="max-w-7xl mx-auto p-2 md:p-4 animate-fade-in pb-20 w-full h-[92vh] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Past Papers Repository</h2>
                    <p className="text-slate-500 dark:text-slate-400">Read PDF past papers natively within the app.</p>
                </div>
                <button onClick={fetchFiles} className="bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors font-bold flex items-center gap-2">
                    <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i> Sync Drive
                </button>
            </div>
            
            {selectedFile ? (
                <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col backdrop-blur-sm">
                    <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-700 shadow-lg">
                        <div className="flex items-center gap-4 text-white">
                            <i className="fa-solid fa-file-pdf text-red-500 text-2xl"></i>
                            <h3 className="font-bold text-lg">{selectedFile.name}</h3>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-600 flex items-center gap-2">
                            <i className="fa-solid fa-xmark"></i> Close PDF
                        </button>
                    </div>
                    
                    <div className="flex-1 relative w-full h-full bg-slate-100 overflow-hidden">
                        {/* We use ?rm=minimal to remove Drive's top bar if possible, and scale the iframe to fully fit */}
                        <iframe 
                            src={`https://drive.google.com/file/d/${selectedFile.id}/preview?rm=minimal`} 
                            className="absolute inset-0 w-full h-full border-0" 
                            allow="autoplay"
                            style={{ width: '100vw', height: 'calc(100vh - 70px)' }}
                        ></iframe>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                        {folderHistory.map((fh, idx) => (
                            <div key={fh.id + '_' + idx} className="flex items-center">
                                <button onClick={() => handleBreadcrumbClick(idx)} className={`text-sm hover:underline ${idx === folderHistory.length - 1 ? 'font-bold text-slate-800 dark:text-white' : 'text-primary'}`}>{fh.name}</button>
                                {idx < folderHistory.length - 1 && <i className="fa-solid fa-chevron-right text-xs mx-2 text-slate-400"></i>}
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                        {loading ? (
                            <div className="col-span-full flex justify-center items-center h-48"><i className="fa-solid fa-circle-notch fa-spin text-primary text-3xl"></i></div>
                        ) : error ? (
                            <div className="col-span-full p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30"><i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-3"></i><p className="text-red-600 font-semibold">{error}</p></div>
                        ) : files.length === 0 ? (
                            <div className="col-span-full p-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"><i className="fa-solid fa-folder-open text-4xl mb-3 text-slate-300 dark:text-slate-600"></i><p>This folder is empty.</p></div>
                        ) : (
                            files.map(f => {
                                const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
                                const isPdf = f.mimeType === 'application/pdf';
                                let allowed = true;
                                
                                if (isFolder) {
                                    const fClean = stripStr(f.name);
                                    const groupMatch = fClean.match(/group\s*(\d+)/);
                                    
                                    if (groupMatch) {
                                        const groupNum = parseInt(groupMatch[1], 10);
                                        allowed = selectedGroups.includes(groupNum);
                                    } else {
                                        const matchesUnselected = unselectedSubjects.some(unsel => unsel.includes(fClean) || fClean.includes(unsel));
                                        const matchesSelected = activeSubjects.some(sel => sel.includes(fClean) || fClean.includes(sel));
                                        
                                        if (matchesUnselected && !matchesSelected) {
                                            allowed = false;
                                        }
                                    }
                                }

                                if (!allowed) {
                                    return (
                                        <div key={f.id} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-300 dark:text-red-800 cursor-not-allowed opacity-50 border border-red-100 dark:border-red-900/20 text-center">
                                            <i className="fa-solid fa-folder text-red-300 text-3xl mb-2"></i>
                                            <span className="font-semibold text-sm line-through">{f.name}</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={f.id} onClick={() => { if (isFolder) handleFolderClick(f); else if (isPdf) setSelectedFile(f); }} className={`flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all border ${selectedFile?.id === f.id ? 'bg-primary/5 border-primary shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md text-slate-700 dark:text-slate-200'} text-center`}>
                                        <i className={`fa-solid ${isFolder ? 'fa-folder text-yellow-400' : isPdf ? 'fa-file-pdf text-red-500' : 'fa-file text-slate-400'} text-4xl mb-3 transition-transform group-hover:scale-110`}></i>
                                        <span className="font-bold text-sm leading-tight line-clamp-2">{f.name}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};



const SyllabusTracker = ({ selectedSubjects, completedTopics, setCompletedTopics }) => {
    const [activeSubject, setActiveSubject] = useState(null);
    const [expandedTopics, setExpandedTopics] = useState({});

    const allSubjects = [
        ...compulsorySubjects,
        ...optionalSubjects.filter(sub => selectedSubjects.includes(sub.id))
    ];

    const handleToggle = (key) => setCompletedTopics(prev => ({...prev, [key]: !prev[key]}));

    if (activeSubject) {
        const sub = allSubjects.find(s => s.id === activeSubject);
        
        let sections = syllabusData[sub.id] || [];
        
        return (
            <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full">
                <button 
                    onClick={() => setActiveSubject(null)} 
                    className="mb-6 text-slate-500 hover:text-primary font-bold flex items-center gap-2 transition-colors"
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Subjects
                </button>
                <div className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                    <h2 className="text-3xl font-extrabold text-primary mb-2">{sub.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Expand topics and mark subtopics as complete.</p>
                    
                    <div className="space-y-10">
                        {sections.map((section, secIdx) => (
                            <div key={secIdx} className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-2">
                                    {section.sectionTitle}
                                </h3>
                                
                                {section.topics && section.topics.map((topic, topicIdx) => {
                                    const isExpanded = expandedTopics[`${sub.id}_${secIdx}_${topicIdx}`];
                                    const toggleExpand = () => setExpandedTopics(prev => ({...prev, [`${sub.id}_${secIdx}_${topicIdx}`]: !isExpanded}));
                                    
                                    const completedInTopic = topic.subtopics.filter(t => completedTopics[`${sub.id}_${secIdx}_${topicIdx}_${t}`]).length;
                                    const topicProgress = Math.round((completedInTopic / topic.subtopics.length) * 100) || 0;

                                    return (
                                        <div key={topicIdx} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                            <div 
                                                className="bg-slate-50 dark:bg-slate-800/80 p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                onClick={toggleExpand}
                                            >
                                                <div className="flex-1 pr-4">
                                                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">{topic.title}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 hidden sm:block">
                                                            <div className="bg-primary h-1.5 rounded-full transition-all" style={{width: `${topicProgress}%`}}></div>
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-500">{completedInTopic} / {topic.subtopics.length} ({topicProgress}%)</div>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0 shadow-sm border border-slate-200 dark:border-slate-600">
                                                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                                </div>
                                            </div>
                                            
                                            {isExpanded && (
                                                <div className="p-4 space-y-2 bg-white dark:bg-surfaceDark border-t border-slate-200 dark:border-slate-700">
                                                    {topic.subtopics.map((subtopic, i) => {
                                                        const key = `${sub.id}_${secIdx}_${topicIdx}_${subtopic}`;
                                                        const isChecked = !!completedTopics[key];
                                                        return (
                                                            <label key={i} className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all border ${isChecked ? 'bg-primary/5 border-primary/30' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                                                <div className="pt-0.5">
                                                                    <input type="checkbox" checked={isChecked} onChange={() => handleToggle(key)} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                                                                </div>
                                                                <span className={`text-sm font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{subtopic}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Syllabus Tracker</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Select a subject to view its detailed topic breakdown.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSubjects.map(sub => {
                    let sections = syllabusData[sub.id] || [];
                    
                    let totalSubtopics = 0;
                    let completedCount = 0;

                    sections.forEach((section, secIdx) => {
                        if(section.topics) {
                            section.topics.forEach((topic, topicIdx) => {
                                totalSubtopics += topic.subtopics.length;
                                completedCount += topic.subtopics.filter(t => completedTopics[`${sub.id}_${secIdx}_${topicIdx}_${t}`]).length;
                            });
                        }
                    });

                    const progress = totalSubtopics > 0 ? Math.round((completedCount / totalSubtopics) * 100) : 0;

                    return (
                        <div 
                            key={sub.id} 
                            onClick={() => setActiveSubject(sub.id)}
                            className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                        >
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 group-hover:text-primary transition-colors">{sub.name}</h3>
                            
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{completedCount} / {totalSubtopics} Topics</span>
                                <span className="text-sm font-bold text-primary">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{width: `${progress}%`}}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const Timetable = ({ startTaskTimer }) => {
    const [schedule, setSchedule] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('schedule') : null;
        return saved ? JSON.parse(saved) : [
            { id: 1, day: 'Monday', startTime: '09:00', endTime: '12:00', task: 'English Essay Practice', notified: true },
            { id: 2, day: 'Monday', startTime: '14:00', endTime: '17:00', task: 'Current Affairs Notes', notified: false },
            { id: 3, day: 'Tuesday', startTime: '09:00', endTime: '12:00', task: 'General Science & Ability', notified: true }
        ];
    });
    const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    const [activeDay, setActiveDay] = useState('Monday');
    const [editForm, setEditForm] = useState({ startTime: '09:00', endTime: '12:00', task: '' });
    const [newDayName, setNewDayName] = useState('');
    useEffect(() => {
        if(schedule.length > 0) localStorage.setItem('schedule', JSON.stringify(schedule));
    }, [schedule]);
    const handleAddTask = () => {
        if(!editForm.task) return;
        setSchedule([...schedule, { id: Date.now(), day: activeDay, ...editForm, notified: false }]);
        setEditForm({ startTime: '09:00', endTime: '12:00', task: '' });
    };
    const handleAddDay = () => {
        if(!newDayName || days.includes(newDayName)) return;
        setDays([...days, newDayName]);
        setActiveDay(newDayName);
        setNewDayName('');
    };
    const handleRemoveDay = (dayToRemove) => {
        setDays(days.filter(d => d !== dayToRemove));
        setSchedule(schedule.filter(s => s.day !== dayToRemove));
        if (activeDay === dayToRemove) {
            setActiveDay(days.length > 1 ? days.find(d => d !== dayToRemove) : '');
        }
    };
    const calculateMinutes = (start, end) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let mins = (eh * 60 + em) - (sh * 60 + sm);
        return mins > 0 ? mins : 60;
    };
    const daySchedule = schedule.filter(s => s.day === activeDay).sort((a,b) => a.startTime.localeCompare(b.startTime));
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Study Timetable</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Organize your study sessions day by day.</p>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
                    <div className="bg-white dark:bg-surfaceDark p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 px-2">Days</h3>
                        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                            {days.map(day => (
                                <div key={day} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeDay === day ? 'bg-primary text-white font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300'}`} onClick={() => setActiveDay(day)}>
                                    <span className="truncate pr-2">{day}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveDay(day); }} className={`p-1 rounded-md ${activeDay === day ? 'hover:bg-white/20' : 'hover:bg-red-100 hover:text-red-500'} transition-colors`}>
                                        <i className="fa-solid fa-xmark text-sm"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                            <input type="text" placeholder="Add custom day..." value={newDayName} onChange={e => setNewDayName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDay()} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-primary outline-none" />
                            <button onClick={handleAddDay} className="bg-slate-800 dark:bg-slate-700 text-white w-10 h-10 rounded-xl shrink-0 flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"><i className="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full bg-white dark:bg-surfaceDark p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 min-h-[500px] shadow-sm">
                    {activeDay ? (
                        <>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{activeDay}'s Schedule</h3>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">{daySchedule.length} Tasks</span>
                            </div>
                            <div className="space-y-4 mb-8">
                                {daySchedule.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <i className="fa-regular fa-calendar-check text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
                                        <p>No tasks scheduled for {activeDay}.</p>
                                    </div>
                                ) : (
                                    daySchedule.map(item => (
                                        <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/30 rounded-2xl transition-all shadow-sm hover:shadow-md">
                                            <div className="flex items-start sm:items-center gap-4">
                                                <div className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg text-sm shrink-0 whitespace-nowrap">
                                                    {item.startTime} - {item.endTime}
                                                </div>
                                                <div className="font-semibold text-slate-700 dark:text-slate-200 mt-1 sm:mt-0">{item.task}</div>
                                            </div>
                                            <div className="flex gap-2 mt-3 sm:mt-0 sm:opacity-0 group-hover:opacity-100 self-end sm:self-auto">
                                                <button onClick={() => startTaskTimer(item.task, calculateMinutes(item.startTime, item.endTime))} className="text-green-500 hover:text-green-600 transition-all p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600">
                                                    <i className="fa-solid fa-play"></i>
                                                </button>
                                                <button onClick={() => setSchedule(schedule.filter(s => s.id !== item.id))} className="text-slate-400 hover:text-red-500 transition-all p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-sm flex items-center gap-2"><i className="fa-solid fa-clock text-primary"></i> Add New Task to {activeDay}</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex gap-2">
                                        <input title="Start Time" type="time" value={editForm.startTime} onChange={e => setEditForm({...editForm, startTime: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 w-32 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                        <input title="End Time" type="time" value={editForm.endTime} onChange={e => setEditForm({...editForm, endTime: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 w-32 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <input type="text" placeholder="What will you study?" value={editForm.task} onChange={e => setEditForm({...editForm, task: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddTask()} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                        <button onClick={handleAddTask} className="bg-primary hover:bg-primaryDark text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap">Add Task</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <i className="fa-solid fa-calendar-day text-5xl mb-4 text-slate-300 dark:text-slate-600"></i>
                            <p>Select or create a day from the sidebar to view its schedule.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const FactBook = ({ facts, setFacts }) => {
    const [newFactTitle, setNewFactTitle] = useState('');
    const [newFactContent, setNewFactContent] = useState('');
    const handleSave = () => {
        if (!newFactTitle || !newFactContent) return;
        setFacts([{ id: Date.now(), title: newFactTitle, content: newFactContent, date: new Date().toLocaleDateString() }, ...facts]);
        setNewFactTitle('');
        setNewFactContent('');
    };
    const removeFact = (id) => {
        setFacts(facts.filter(f => f.id !== id));
    };
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full h-full flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 flex flex-col">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Fact Book</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Create MS-Word style rich facts and figures notes.</p>
                <div className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col flex-1">
                    <input type="text" placeholder="Fact Title (e.g. GDP Growth 2024)" value={newFactTitle} onChange={e => setNewFactTitle(e.target.value)} className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 bg-transparent py-3 mb-4 outline-none text-slate-800 dark:text-white placeholder:text-slate-400" />
                    <textarea placeholder="Write your detailed facts, statistics, and references here..." value={newFactContent} onChange={e => setNewFactContent(e.target.value)} className="flex-1 w-full resize-none bg-transparent outline-none text-slate-600 dark:text-slate-300 leading-relaxed min-h-[300px]"></textarea>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                            <i className="fa-solid fa-save mr-2"></i> Save Fact
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/2">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6">Saved Facts & Figures</h3>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {facts.length === 0 ? (
                        <div className="text-center p-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-500">
                            No facts added yet. Start typing on the left!
                        </div>
                    ) : (
                        facts.map(fact => (
                            <div key={fact.id} className="bg-white dark:bg-surfaceDark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">{fact.title}</h4>
                                    <button onClick={() => removeFact(fact.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{fact.content}</p>
                                <div className="mt-3 text-xs font-semibold text-slate-400 text-right">{fact.date}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};



const TemplateView = ({ title, description, icon }) => (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{description}</p>
            </div>
        </div>
        <div className="bg-white dark:bg-surfaceDark rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <i className={`fa-solid ${icon} text-6xl text-slate-300 dark:text-slate-700 mb-4`}></i>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{title} Module Active Template</h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm">Interactive repository items, searchable archives, and practice records will render here seamlessly.</p>
        </div>
    </div>
);



const VocabFlashcards = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [deck, setDeck] = useState([]);

    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleStart = (category) => {
        let filtered = [];
        if (category === 'Random') {
            filtered = [...sampleVocab].sort(() => 0.5 - Math.random());
        } else {
            filtered = sampleVocab.filter(v => v.word.toUpperCase().startsWith(category));
        }
        if (filtered.length > 0) {
            setDeck(filtered);
            setSelectedCategory(category);
            setCurrentIndex(0);
            setFlipped(false);
        }
    };

    const getAvailableLetters = () => {
        const available = new Set(sampleVocab.map(v => v.word.charAt(0).toUpperCase()));
        return available;
    };
    const availableLetters = getAvailableLetters();

    if (!selectedCategory) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Vocabulary Flashcards</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Select a letter to master specific vocabulary, or choose Random for a mix.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <button 
                        onClick={() => handleStart('Random')}
                        disabled={sampleVocab.length === 0}
                        className="col-span-2 md:col-span-4 lg:col-span-6 p-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <i className="fa-solid fa-shuffle"></i> Start Random Mix
                    </button>
                    
                    {letters.map(letter => {
                        const hasWords = availableLetters.has(letter);
                        return (
                            <button
                                key={letter}
                                onClick={() => hasWords && handleStart(letter)}
                                disabled={!hasWords}
                                className={`p-4 rounded-2xl border-2 font-bold transition-all text-center ${hasWords ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:border-primary hover:text-primary shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 text-slate-400/50 opacity-50 cursor-not-allowed'}`}
                            >
                                {letter} Series
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const handleNext = () => {
        setFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % deck.length);
    };

    const handlePrev = () => {
        setFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    };

    const card = deck[currentIndex];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setSelectedCategory(null)} className="text-slate-500 hover:text-primary font-bold flex items-center gap-2 transition-colors">
                    <i className="fa-solid fa-arrow-left"></i> Exit Series
                </button>
                <div className="font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-lg border border-primary/20">
                    {selectedCategory === 'Random' ? 'Random Mix' : `${selectedCategory} Series`}
                </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center mb-10 w-full">
                <div 
                    onClick={() => setFlipped(!flipped)}
                    className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01] min-h-[400px] relative overflow-hidden"
                >
                    <div className={`w-full h-full flex flex-col items-center justify-center transition-opacity duration-300 ${flipped ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        <h3 className="text-5xl md:text-6xl font-black text-primary mb-4">{card.word}</h3>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mt-8 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full"><i className="fa-solid fa-hand-pointer text-primary"></i> Tap to reveal</p>
                    </div>
                    
                    <div className={`w-full h-full flex flex-col items-start justify-center transition-opacity duration-300 ${!flipped ? 'opacity-0 hidden' : 'opacity-100'} text-left`}>
                        <h4 className="text-3xl font-black text-slate-800 dark:text-white mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4 w-full text-center md:text-left">{card.word}</h4>
                        
                        <div className="mb-6 w-full bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider block mb-1">Meaning</span>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{card.meaning}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                                <span className="font-bold text-green-600 dark:text-green-400 text-xs uppercase tracking-wider block mb-1">Synonyms</span>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.synonyms?.join(', ') || 'N/A'}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                <span className="font-bold text-red-600 dark:text-red-400 text-xs uppercase tracking-wider block mb-1">Antonyms</span>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.antonyms?.join(', ') || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl italic text-slate-600 dark:text-slate-300 border-l-4 border-primary">
                            "{card.example}"
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 mt-10">
                    <button onClick={handlePrev} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-md text-xl transform hover:scale-110 active:scale-95">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <span className="font-bold text-slate-500 text-lg bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-full shadow-inner">{currentIndex + 1} / {deck.length}</span>
                    <button onClick={handleNext} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-md text-xl transform hover:scale-110 active:scale-95">
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};



const SubjectWiseMCQs = ({ selectedSubjects }) => {
    const [activeSubject, setActiveSubject] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const activeSubs = [...compulsorySubjects, ...optionalSubjects]
        .filter(s => s.id !== 'comp_essay' && (compulsorySubjects.some(c => c.id === s.id) || selectedSubjects.includes(s.id)));

    const questions = activeSubject && sampleMcqs[activeSubject] ? sampleMcqs[activeSubject] : [];

    const handleStart = (subId) => {
        setActiveSubject(subId);
        setQuizStarted(true);
        setCurrentQ(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setShowExplanation(false);
    };

    const handleAnswer = (idx) => {
        if (selectedOption !== null) return;
        setSelectedOption(idx);
        if (idx === questions[currentQ].answer) setScore(s => s + 1);
        setShowExplanation(true);
    };

    const handleNextQ = () => {
        if (currentQ + 1 < questions.length) {
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
                <p className="text-slate-500 dark:text-slate-400 mb-8">Test your knowledge with up to 20 MCQs per quiz. Essay paper is excluded.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSubs.map(sub => {
                        const hasData = !!sampleMcqs[sub.id];
                        return (
                            <div key={sub.id} onClick={() => hasData && handleStart(sub.id)} className={`p-6 rounded-3xl border transition-all ${hasData ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md cursor-pointer' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${hasData ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                    <i className="fa-solid fa-list-check text-xl"></i>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{sub.name}</h3>
                                <p className="text-sm font-semibold text-slate-400 mb-4">{hasData ? `${sampleMcqs[sub.id].length} MCQs Available` : 'No MCQs Added Yet'}</p>
                                {hasData ? (
                                    <div className="text-primary font-bold text-sm flex items-center gap-2">Start Quiz <i className="fa-solid fa-arrow-right"></i></div>
                                ) : (
                                    <div className="text-slate-400 text-xs italic">Add to data.js to enable</div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
                    <i className="fa-solid fa-lightbulb mr-2"></i> To add MCQs for more subjects, open <strong>src/app/data.js</strong> and add questions into the <strong>sampleMcqs</strong> object using the subject's ID.
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in w-full text-center mt-10">
                <div className="w-32 h-32 mx-auto bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center text-6xl mb-6">
                    <i className="fa-solid fa-trophy"></i>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">Quiz Completed!</h2>
                <p className="text-slate-500 text-lg mb-8">You scored {score} out of {questions.length} ({percentage}%)</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setQuizStarted(false)} className="px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Back to Subjects
                    </button>
                    <button onClick={() => handleStart(activeSubject)} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in w-full">
            <button onClick={() => setQuizStarted(false)} className="mb-6 text-slate-500 hover:text-primary font-bold flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> Exit Quiz
            </button>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="font-bold text-slate-500">Question {currentQ + 1} of {questions.length}</div>
                    <div className="font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-lg">Score: {score}</div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">{q.q}</h3>
                
                <div className="space-y-4 mb-8">
                    {q.options.map((opt, idx) => {
                        let btnClass = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary hover:bg-primary/5";
                        
                        if (selectedOption !== null) {
                            if (idx === q.answer) btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
                            else if (idx === selectedOption) btnClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                            else btnClass = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
                        }
                        
                        return (
                            <button 
                                key={idx} 
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedOption !== null}
                                className={`w-full text-left p-4 rounded-2xl border-2 font-semibold transition-all ${btnClass}`}
                            >
                                <span className="inline-block w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-center leading-8 mr-4 text-slate-500">{String.fromCharCode(65 + idx)}</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>
                
                {showExplanation && (
                    <div className="flex justify-end animate-fade-in">
                        <button onClick={handleNextQ} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                            {currentQ + 1 < questions.length ? 'Next Question' : 'View Results'} <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function App() {
    const [appState, setAppState] = useState('login');
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [timerOpen, setTimerOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    useEffect(() => {
        const saved = localStorage.getItem('selectedSubjects');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) setSelectedSubjects(parsed);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        
                        let hasSubjects = false;
                        if (data.selectedSubjects && data.selectedSubjects.length > 0) {
                            setSelectedSubjects(data.selectedSubjects);
                            hasSubjects = true;
                        } else {
                            const localSubj = localStorage.getItem('selectedSubjects');
                            if (localSubj && JSON.parse(localSubj).length > 0) {
                                setSelectedSubjects(JSON.parse(localSubj));
                                hasSubjects = true;
                            }
                        }
                        
                        setAppState(hasSubjects ? 'main' : 'onboarding');

                        if (data.completedTopics) setCompletedTopics(data.completedTopics);
                        if (data.facts) setFacts(data.facts);
                        if (data.dailyStreak) setDailyStreak(data.dailyStreak);
                    } else {
                        const localSubj = localStorage.getItem('selectedSubjects');
                        if (localSubj && JSON.parse(localSubj).length > 0) {
                            setSelectedSubjects(JSON.parse(localSubj));
                            setAppState('main');
                        }
                        else setAppState('onboarding');
                    }
                } catch (err) {
                    console.error("Firestore Load Error:", err);
                    const localSubj = localStorage.getItem('selectedSubjects');
                    if (localSubj && JSON.parse(localSubj).length > 0) {
                        setSelectedSubjects(JSON.parse(localSubj));
                        setAppState('main');
                    }
                    else setAppState('onboarding');
                }
                setLoadingAuth(false);
            } else {
                setUser(null);
                setAppState('login');
                setLoadingAuth(false);
            }
        });
        return () => unsubscribe();
    }, []);



    useEffect(() => {
        if (selectedSubjects.length > 0) {
            localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
        }
    }, [selectedSubjects]);
    const [completedTopics, setCompletedTopics] = useState({});
    const [facts, setFacts] = useState([]);
    const [timerSettings, setTimerSettings] = useState({ active: false, time: 25 * 60, task: '' });
    const [dailyStreak, setDailyStreak] = useState(0);

    useEffect(() => {
        const savedTopics = localStorage.getItem('completedTopics');
        if (savedTopics) setCompletedTopics(JSON.parse(savedTopics));
        const savedFacts = localStorage.getItem('facts');
        if (savedFacts) setFacts(JSON.parse(savedFacts));
    }, []);

    useEffect(() => {
        if (Object.keys(completedTopics).length > 0) {
            localStorage.setItem('completedTopics', JSON.stringify(completedTopics));
        }
    }, [completedTopics]);

    useEffect(() => {
        if (facts.length > 0) {
            localStorage.setItem('facts', JSON.stringify(facts));
        }
    }, [facts]);

    useEffect(() => {
        const lastVisitDate = localStorage.getItem('lastVisitDate');
        const today = new Date().toDateString();
        let currentStreak = parseInt(localStorage.getItem('dailyStreak') || '0', 10);

        if (lastVisitDate !== today) {
            if (lastVisitDate) {
                const lastDate = new Date(lastVisitDate);
                const todayDate = new Date();
                todayDate.setHours(0,0,0,0);
                lastDate.setHours(0,0,0,0);
                const diffTime = Math.abs(todayDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }

            localStorage.setItem('lastVisitDate', today);
            localStorage.setItem('dailyStreak', currentStreak.toString());
            setDailyStreak(currentStreak);
        } else {
            setDailyStreak(currentStreak || 1);
        }
    }, []);

    useEffect(() => {
        if (!user || loadingAuth) return;
        const syncData = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, {
                    selectedSubjects,
                    completedTopics,
                    facts,
                    dailyStreak,
                    lastUpdate: new Date()
                }, { merge: true });
            } catch (err) {
                console.error("Firestore Save Error:", err);
            }
        };
        const timeout = setTimeout(syncData, 1000);
        return () => clearTimeout(timeout);
    }, [selectedSubjects, completedTopics, facts, dailyStreak, user, loadingAuth]);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark');
        }
    };

    if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-bgDark"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i></div>;
    if (appState === 'login') return <LoginScreen onLogin={(u) => setUser(u)} />;
    if (appState === 'onboarding') return <OnboardingWizard onComplete={async (s) => { 
        setSelectedSubjects(s); 
        setAppState('main');
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, { selectedSubjects: s, lastUpdate: new Date() }, { merge: true });
                console.log("Subjects force saved!");
            } catch (err) {
                console.error(err);
            }
        }
    }} />;

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-bgLight dark:bg-bgDark font-sans overflow-hidden transition-colors">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-surfaceDark text-white shadow-md z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <i className="fa-solid fa-graduation-cap text-white text-sm"></i>
                    </div>
                    <h1 className="text-lg font-extrabold text-white">CSS<span className="text-primaryLight">.</span>PREP</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
                    <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                </button>
            </div>
            
            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar (Responsive) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} />
            </div>

            <main className="flex-1 h-full flex flex-col relative w-full overflow-y-auto">
                {currentView === 'dashboard' && <Dashboard selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} />}
                {currentView === 'syllabus' && <SyllabusTracker selectedSubjects={selectedSubjects} completedTopics={completedTopics} setCompletedTopics={setCompletedTopics} />}
                {currentView === 'timetable' && <Timetable startTaskTimer={(task, mins) => { setTimerSettings({ active: true, time: mins * 60, task }); setTimerOpen(true); }} />}
                {currentView === 'pastpapers' && <PastPapersView rootFolderId='1loejZdweyTir2QqtUKiHAAFOs5bRxfmz' selectedSubjects={selectedSubjects} />}
                {currentView === 'factbook' && <FactBook facts={facts} setFacts={setFacts} />}
                {currentView === 'currentaffairs' && <TemplateView title="Current Affairs Hot Topics" description="Deep-dive analysis on national security, regional dynamics, and global treaties." icon="fa-globe" />}
                {currentView === 'mcqs' && <SubjectWiseMCQs selectedSubjects={selectedSubjects} />}
                {currentView === 'vocab' && <VocabFlashcards />}
                {currentView === 'flashcards' && <TemplateView title="Active Recall Flash Cards" description="Flip-card revision system for rapid memory retention." icon="fa-clone" />}
            </main>
            <CountdownTimerModal isOpen={timerOpen} onClose={() => setTimerOpen(false)} settings={timerSettings} />
        </div>
    );
}
