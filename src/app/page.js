"use client";
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import * as XLSX from 'xlsx';
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
              <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-xl transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: `url(${aspirixCap})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixCap})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                  </div>
                  <div className="w-64 h-14 bg-slate-800 drop-shadow-sm dark:bg-white" style={{ WebkitMaskImage: `url(${aspirixText})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixText})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
              </div>
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

const Sidebar = ({ currentView, setCurrentView, isDarkMode, toggleTheme, user, isPro }) => {
    const navItems = [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', premium: false },
        { id: 'currentaffairs', icon: 'fa-globe', label: 'Current Affairs Hot Topics', premium: true },
        { id: 'syllabus', icon: 'fa-book-open', label: 'Syllabus Tracker', premium: false },
        { id: 'timetable', icon: 'fa-calendar-days', label: 'Study Timetable', premium: false },
        { id: 'pastpapers', icon: 'fa-file-lines', label: 'Past Papers', premium: false }, // Past papers kept free!
        { id: 'factbook', icon: 'fa-book-bookmark', label: 'Fact Book', premium: false },
        { id: 'mcqs', icon: 'fa-list-check', label: 'Subject MCQs', premium: true },
        { id: 'vocab', icon: 'fa-spell-check', label: 'Vocab MCQs', premium: false }, // Only D-Z locked
    ];

    return (
        <div className="w-full bg-surfaceDark text-slate-300 h-full flex flex-col shadow-xl z-20 relative">
            <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-xl transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: `url(${aspirixCap})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixCap})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-40 h-10 bg-white drop-shadow-sm dark:bg-white" style={{ WebkitMaskImage: `url(${aspirixText})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixText})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
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

const Dashboard = ({ selectedSubjects, completedTopics, openTimer, dailyStreak, user }) => {
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
    
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Aspirant';
    
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 w-full font-sans">
            {/* Mobile-optimized Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-6">
                <div className="w-full">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full mb-3 uppercase tracking-wider">CE-2025 Goal</div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-2 leading-tight">Welcome back, <span className="text-primary">{firstName}</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                        <i className="fa-regular fa-calendar text-primary/70"></i> 142 Days Remaining
                    </p>
                </div>
                <button onClick={openTimer} className="w-full md:w-auto bg-gradient-to-r from-primary to-green-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 hover:scale-105 transition-all">
                    <i className="fa-solid fa-stopwatch text-xl"></i> Launch Stopwatch
                </button>
            </div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                {/* Compulsory Card */}
                <div className="bg-white dark:bg-surfaceDark p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-0"></div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 text-xl">
                            <i className="fa-solid fa-book"></i>
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Compulsory</h3>
                    </div>
                    <div className="flex justify-between items-end mb-3 relative z-10">
                        <div className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{compPercent}<span className="text-2xl text-slate-400 font-bold">%</span></div>
                        <div className="text-sm font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg">{compStats.done} / {compStats.total}</div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 relative z-10 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${compPercent}%`}}></div>
                    </div>
                </div>

                {/* Optional Card */}
                <div className="bg-white dark:bg-surfaceDark p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0"></div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                            <i className="fa-solid fa-layer-group"></i>
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Optional</h3>
                    </div>
                    <div className="flex justify-between items-end mb-3 relative z-10">
                        <div className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{optPercent}<span className="text-2xl text-slate-400 font-bold">%</span></div>
                        <div className="text-sm font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg">{optStats.done} / {optStats.total}</div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 relative z-10 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${optPercent}%`}}></div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 md:p-8 rounded-[2rem] text-white flex flex-col justify-between shadow-lg shadow-orange-500/20 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-9xl opacity-20"><i className="fa-solid fa-fire"></i></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 opacity-90 font-semibold tracking-wide uppercase text-sm">
                            <i className="fa-solid fa-bolt"></i> Daily Streak
                        </div>
                        <div className="text-6xl font-black tracking-tighter mt-4 flex items-baseline gap-2">
                            {dailyStreak} <span className="text-2xl font-bold opacity-80">Days</span>
                        </div>
                    </div>
                    <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-3 text-sm font-medium relative z-10">
                        Keep it up! Consistency is the key to CSS.
                    </div>
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
                        {/* Mobile-friendly iframe wrap to hide pop-up */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ top: '60px' }}>
                            <iframe 
                                src={`https://drive.google.com/file/d/${selectedFile.id}/preview?rm=minimal`} 
                                className="absolute w-full border-0" 
                                allow="autoplay"
                                style={{ top: '-60px', left: 0, height: 'calc(100vh + 10px)' }}
                            ></iframe>
                        </div>
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
            <p className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Organize your study sessions day by day.</p>
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
                    <div className="bg-white dark:bg-surfaceDark p-4 md:p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-3 md:mb-4 px-2 hidden md:block">Days</h3>
                        {/* Mobile horizontal scroll for days, vertical on desktop */}
                        <div className="flex md:flex-col gap-2 md:gap-1 max-h-none md:max-h-[400px] overflow-x-auto md:overflow-y-auto pr-1 pb-2 md:pb-0" style={{ scrollbarWidth: 'none' }}>
                            {days.map(day => (
                                <div key={day} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap shrink-0 md:w-full ${activeDay === day ? 'bg-primary text-white font-bold shadow-md md:shadow-none' : 'bg-slate-100 md:bg-transparent hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300'}`} onClick={() => setActiveDay(day)}>
                                    <span className="truncate pr-2">{day}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveDay(day); }} className={`p-1 rounded-md ml-2 md:ml-0 ${activeDay === day ? 'hover:bg-white/20' : 'hover:bg-red-100 hover:text-red-500'} transition-colors`}>
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
                <div className="flex-1 w-full bg-white dark:bg-surfaceDark p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 min-h-[400px] shadow-sm">
                    {activeDay ? (
                        <>
                            <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{activeDay}'s Schedule</h3>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">{daySchedule.length} Tasks</span>
                            </div>
                            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                {daySchedule.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <i className="fa-regular fa-calendar-check text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
                                        <p>No tasks scheduled for {activeDay}.</p>
                                    </div>
                                ) : (
                                    daySchedule.map(item => (
                                        <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/30 rounded-2xl transition-all shadow-sm hover:shadow-md gap-3">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
                                                <div className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg text-sm shrink-0 whitespace-nowrap self-start md:self-auto flex items-center gap-2">
                                                    <i className="fa-regular fa-clock"></i> {item.startTime} - {item.endTime}
                                                </div>
                                                <div className="font-semibold text-slate-700 dark:text-slate-200 w-full text-lg md:text-base">
                                                    {item.task}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 border-t md:border-t-0 border-slate-200 dark:border-slate-700 pt-3 md:pt-0">
                                                <button onClick={() => startTaskTimer(item.task, calculateMinutes(item.startTime, item.endTime))} className="text-green-500 hover:text-green-600 transition-all px-4 md:px-2 py-2 bg-green-50 dark:bg-slate-700 hover:bg-green-100 rounded-xl border border-green-200 dark:border-slate-600 flex-1 md:flex-none flex items-center justify-center gap-2">
                                                    <i className="fa-solid fa-play"></i> <span className="md:hidden font-bold">Start</span>
                                                </button>
                                                <button onClick={() => setSchedule(schedule.filter(s => s.id !== item.id))} className="text-slate-400 hover:text-red-500 transition-all px-4 md:px-2 py-2 bg-white dark:bg-slate-700 hover:bg-red-50 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-sm flex items-center gap-2"><i className="fa-solid fa-clock text-primary"></i> Add New Task to {activeDay}</h4>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 md:hidden">Start Time</label>
                                            <input title="Start Time" type="time" value={editForm.startTime} onChange={e => setEditForm({...editForm, startTime: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 md:px-4 py-3 md:py-2.5 text-sm md:w-32 text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 md:hidden">End Time</label>
                                            <input title="End Time" type="time" value={editForm.endTime} onChange={e => setEditForm({...editForm, endTime: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 md:px-4 py-3 md:py-2.5 text-sm md:w-32 text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 md:hidden">Task Details</label>
                                        <input type="text" placeholder="Task Name..." value={editForm.task} onChange={e => setEditForm({...editForm, task: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddTask()} className="w-full flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 md:py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <button onClick={handleAddTask} className="bg-primary hover:bg-green-600 text-white font-bold px-6 py-4 md:py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-2 mt-2 md:mt-0">
                                        <i className="fa-solid fa-plus"></i> <span className="md:hidden">Add Task</span><span className="hidden md:inline">Add</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-center flex-col py-20">
                            <i className="fa-regular fa-calendar text-6xl mb-4 opacity-50"></i>
                            <p>Select a day from the sidebar to view its schedule.</p>
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




const VocabFlashcards = ({ isPro }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [deck, setDeck] = useState([]);
    
    const [liveVocab, setLiveVocab] = useState([]);
    const [isFetchingExcel, setIsFetchingExcel] = useState(true);
    const [excelError, setExcelError] = useState(null);

    useEffect(() => {
        const fetchExcel = async () => {
            try {
                const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
                const FOLDER_ID = '1fiaZu0HaW-hcclXv5jx7gJG-z2bKwOgw';
                
                const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&key=${API_KEY}`);
                const searchData = await searchRes.json();
                
                if (searchData.error) throw new Error(searchData.error.message);
                
                const file = searchData.files.find(f => f.name.toLowerCase().includes('gre') || f.name.toLowerCase().includes('vocab') || f.mimeType === 'application/vnd.google-apps.spreadsheet' || f.name.includes('.xlsx'));
                if (!file) throw new Error("Could not find 'GRE frequent words' Excel file in your Drive folder.");

                let fileUrl;
                if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
                    fileUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&key=${API_KEY}`;
                } else {
                    fileUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
                }
                const fileRes = await fetch(fileUrl);
                if (!fileRes.ok) throw new Error("Failed to download file. Make sure the folder is shared as 'Anyone with the link'.");
                
                const arrayBuffer = await fileRes.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                
                let allVocab = [];
                
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet);
                    
                    data.forEach(row => {
                        const word = row.Word || row.word || row.WORD || "";
                        if (word.trim()) {
                            const syn = row.Synonyms || row.synonyms || row.SYNONYMS || "";
                            const ant = row.Antonyms || row.antonyms || row.ANTONYMS || "";
                            allVocab.push({
                                word: word.trim(),
                                meaning: row.Meaning || row.meaning || row.MEANING || "No meaning provided",
                                synonyms: syn ? syn.toString().split(',').map(s=>s.trim()).filter(Boolean) : [],
                                antonyms: ant ? ant.toString().split(',').map(s=>s.trim()).filter(Boolean) : [],
                                example: row.Example || row.example || row.EXAMPLE || "No example provided"
                            });
                        }
                    });
                });
                
                if (allVocab.length > 0) {
                    setLiveVocab(allVocab);
                } else {
                    throw new Error("No valid words found in the Excel sheet columns (Ensure column is named 'Word').");
                }
            } catch (err) {
                console.error("Excel fetch failed, using fallback:", err);
                setExcelError(err.message);
            } finally {
                setIsFetchingExcel(false);
            }
        };
        fetchExcel();
    }, []);

    const activeData = liveVocab.length > 0 ? liveVocab : sampleVocab;

    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleStart = (category) => {
        if (!isPro && !['A','B','C'].includes(category)) {
            alert('Unlock Pro to access vocabulary for letters D to Z. Click on Past Papers or Current Affairs to see how to upgrade.');
            return;
        }
        let filtered = [];
        if (category === 'Random') {
            filtered = [...activeData].sort(() => 0.5 - Math.random());
        } else {
            filtered = activeData.filter(v => v.word.toUpperCase().startsWith(category));
        }
        if (filtered.length > 0) {
            setDeck(filtered);
            setSelectedCategory(category);
            setCurrentIndex(0);
            setFlipped(false);
        }
    };

    const getAvailableLetters = () => {
        const available = new Set(activeData.map(v => v.word.charAt(0).toUpperCase()));
        return available;
    };
    const availableLetters = getAvailableLetters();

    if (isFetchingExcel) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center">
                <i className="fa-solid fa-cloud-arrow-down text-primary animate-bounce text-6xl mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Syncing Live Excel Data...</h2>
                <p className="text-slate-500 mt-2">Connecting to your Google Drive folder...</p>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full pb-32">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Vocabulary Flashcards</h2>
                <div className="mb-8 p-4 rounded-xl border flex items-start gap-3 text-sm font-medium bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {liveVocab.length > 0 
                        ? <><i className="fa-solid fa-circle-check text-green-500 text-lg mt-0.5"></i> <div>Live Synced from Excel: <strong className="text-green-600 dark:text-green-400">{liveVocab.length} words</strong> loaded!</div></>
                        : <><i className="fa-solid fa-circle-exclamation text-amber-500 text-lg mt-0.5"></i> <div><strong>Excel Sync Failed:</strong> {excelError} <br/><span className="text-slate-400 font-normal">Using {sampleVocab.length} default words. (Did you change your Google Drive folder access to "Anyone with the link"?)</span></div></>}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <button 
                        onClick={() => handleStart('Random')}
                        disabled={activeData.length === 0}
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



const PremiumUpgradeView = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-surfaceDark rounded-3xl border border-primary/20 shadow-xl max-w-2xl mx-auto my-12 text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
            <i className="fa-solid fa-crown text-white text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Upgrade to Pro</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Unlock all premium features including Past Papers, Subject MCQs, Full Vocabulary (D-Z), and Daily Current Affairs.</p>
        
        <div className="flex flex-col md:flex-row gap-6 w-full mb-10">
            <div className="flex-1 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/30">
                <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">Monthly</div>
                <div className="text-4xl font-black text-slate-800 dark:text-white mb-4">Rs 99<span className="text-lg font-medium text-slate-400">/mo</span></div>
            </div>
            <div className="flex-1 border-2 border-primary bg-primary/5 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-primary/10 transform md:scale-105">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Best Value</div>
                <div className="text-primary font-bold uppercase tracking-wider text-sm mb-2">Yearly</div>
                <div className="text-4xl font-black text-primary mb-4">Rs 1000<span className="text-lg font-medium opacity-60">/yr</span></div>
            </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/80 w-full rounded-2xl p-6 text-left border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-money-bill-transfer text-green-500 text-xl"></i> How to Upgrade via Easypaisa
            </h3>
            <ol className="list-decimal pl-5 space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-300">
                <li>Open your Easypaisa app and send the payment to:<br/>
                    <strong className="text-xl font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg mt-2 inline-block shadow-sm">03365005815</strong> <span className="font-semibold ml-2">(Naseem Khan)</span>
                </li>
                <li>Take a screenshot of the successful transaction.</li>
                <li>WhatsApp the screenshot and your registered email address to <strong>03365005815</strong>.</li>
                <li>Your account will be manually upgraded to Pro within a few hours!</li>
            </ol>
        </div>
    </div>
);

const CurrentAffairsView = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch Dawn News RSS via rss2json
                const dawnRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.dawn.com/feeds/home/');
                const dawnData = await dawnRes.json();
                
                // Fetch International News (Al Jazeera)
                const intlRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.com/xml/rss/all.xml');
                const intlData = await intlRes.json();
                
                let combined = [...(dawnData.items || []), ...(intlData.items || [])];
                
                // Keep only items that have actual content/description
                combined = combined.filter(i => (i.content || i.description) && i.title);
                
                // Randomize slightly but keep top Dawn items near top
                combined.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));
                
                // Top editorial summary points
                if (combined.length > 0) {
                    const top = combined[0];
                    const temp = document.createElement('div');
                    temp.innerHTML = top.content || top.description || "";
                    const text = temp.textContent || temp.innerText || "";
                    const sentences = text.split('. ').filter(s => s.trim().length > 30).slice(0, 4);
                    top.summaryPoints = sentences.map(s => s.trim() + (s.trim().endsWith('.') ? '' : '.'));
                }
                
                setNews(combined);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-full pt-32 flex-col gap-4 text-slate-500">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i>
            <p className="font-bold animate-pulse">Fetching latest news and editorials...</p>
        </div>
    );

    const topArticle = news[0];
    const otherArticles = news.slice(1, 15);

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
            <div className="flex items-center gap-3 mb-2">
                <i className="fa-solid fa-fire text-3xl text-orange-500 animate-pulse"></i>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Current Affairs Hot Topics</h2>
            </div>
            <p className="text-slate-500 mb-8 font-medium">Automatically updated from Dawn News & International Sources.</p>
            
            {topArticle && (
                <div className="bg-white dark:bg-surfaceDark rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 mb-10 group">
                    <div className="bg-primary/10 px-6 py-3 border-b border-primary/10 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                        <span className="font-bold text-primary uppercase tracking-widest text-xs">Top Editorial / Trending</span>
                    </div>
                    {topArticle.enclosure?.link && (
                        <div className="h-48 md:h-72 w-full bg-slate-100 overflow-hidden relative">
                            <img src={topArticle.enclosure.link} alt={topArticle.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            <h3 className="absolute bottom-6 left-6 right-6 text-white text-2xl md:text-4xl font-bold leading-tight">{topArticle.title}</h3>
                        </div>
                    )}
                    <div className="p-6 md:p-8">
                        {!topArticle.enclosure?.link && (
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4 leading-tight">{topArticle.title}</h3>
                        )}
                        <div className="text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-3">
                            <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full font-bold shadow-sm"><i className="fa-regular fa-clock text-primary mr-1"></i> {new Date(topArticle.pubDate).toLocaleString()}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full font-bold shadow-sm"><i className="fa-solid fa-globe text-primary mr-1"></i> {topArticle.link.includes('dawn.com') ? 'Dawn News' : 'International'}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-6">
                            <h4 className="font-black text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider text-xs text-primary flex items-center gap-2"><i className="fa-solid fa-bolt"></i> Quick Summary</h4>
                            <ul className="space-y-4">
                                {topArticle.summaryPoints?.length > 0 ? topArticle.summaryPoints.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                        <i className="fa-solid fa-circle-check text-green-500 mt-1 shadow-sm rounded-full"></i>
                                        <span>{point}</span>
                                    </li>
                                )) : (
                                    <li className="text-slate-500">No summary available.</li>
                                )}
                            </ul>
                        </div>
                        <a href={topArticle.link} target="_blank" rel="noreferrer" className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-xl font-bold hover:bg-primary dark:hover:bg-primary transition-colors shadow-md">
                            Read Full Article <i className="fa-solid fa-arrow-up-right-from-square ml-2 text-sm opacity-80"></i>
                        </a>
                    </div>
                </div>
            )}

            <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-2"><i className="fa-solid fa-newspaper text-primary"></i> More Headlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherArticles.map((article, idx) => (
                    <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="group flex flex-col justify-between bg-white dark:bg-surfaceDark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] text-white bg-primary px-2 py-0.5 rounded font-black uppercase tracking-wider">{article.link.includes('dawn.com') ? 'Dawn' : 'Global'}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-3">{article.title}</h4>
                        </div>
                        <div className="text-xs font-bold text-slate-400 mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                            <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-2 py-1 rounded">Read <i className="fa-solid fa-arrow-right ml-1"></i></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

const aspirixLogo = "data:image/png;base64,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";

const aspirixText = "data:image/png;base64,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+iBAgAABAgQIENgVEADsCmpPgAABAo8X0AMBAgQIECBAgMC2gABgm1ABAgQIEHi0gPoECBAgQIAAAQL7AgKAfUMVCBAgQOCxAqoTIECAAAECBAgMCAgABhCVIECAAIFHCqhNgAABAgQIECAwISAAmFBUgwABAgQeJ6AyAQIECBAgQIDAiIAAYIRREQIECBB4lIC6BAgQIECAAAECMwICgBlHVQgQIEDgMQKqEiBAgAABAgQIDAkIAIYglSFAgACBRwioSYAAAQIECBAgMCUgAJiSVIcAAQIE5gHC49YAAADSSURBVAVUJECAAAECBAgQGBMQAIxRKkSAAAEC0wLqESBAgAABAgQIzAkIAOYsVSJAgACBWQHVCBAgQIAAAQIEBgUEAIOYShEgQIDApIBaBAgQIECAAAECkwICgElNtQgQIEBgTkAlAgQIECBAgACBUQEBwCinYgQIECAwJaAOAQIECBAgQIDArIAAYNZTNQIECBCYEVCFAAECBAgQIEBgWEAAMAyqHAECBAhMCKhBgAABAgQIECAwLSAAmBZVjwABAgT2BVQgQIAAAQIECBAYF/gHAAD//3JNFL4AAAAGSURBVAMAx5wp1RsORfUAAAAASUVORK5CYII=";

const aspirixCap = "data:image/png;base64,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75yYIglIQAISkIAEJCABCUhAAmUnYPoLSEADQAFPikmSgAQkIAEJSEACEpCABCRQbgKmvogENAAU8ayYJglIQAISkIAEJCABCUhAAmUmYNoLSUADQCFPi4mSgAQkIAEJSEACEpCABCRQXgKmvJgENAAU87yYKglIQAISkIAEJCABCUhAAmUlYLoLSkADQEFPjMmSgAQkIAEJSEACEpCABCRQTgKmuqgENAAU9cyYLglIQAISkIAEJCABCUhAAmUkYJoLS0ADQGFPjQmTgAQkIAEJSEACEpCABCRQPgKmuLgENAAU99yYMglIQAISkIAEJCABCUhAAmUjYHoLTEADQIFPjkmTgAQkIAEJSEACEpCABCRQLgKmtsgENAAU+eyYNglIQAISkIAEJCABCUhAAmUiYFoLTUADQKFPj4mTgAQkIAEJSEACEpCABCRQHgKmtNgENAAU+/yYOglIQAISkIAEJCABCUhAAmUhYDoLTkADQMFPkMmTgAQkIAEJSEACEpCABCRQDgKmsugENAAU/QyZPglIQAISkIAEJCABCUhAAmUgYBoLT0ADQOFPkQmUgAQkIAEJSEACEpCABCRQfAKmsPgENAAU/xyZQglIQAISkIAEJCABCUhAAkUnYPpKQEADQAlOkkmUgAQkIAEJSEACEpCABCRQbAKmrgwENACU4SyZRglIQAISkIAEJCABCUhAAkUmYNpKQUADQClOk4mUgAQkIAEJSEACEpCABCRQXAKmrBwENACU4zyZSglIQAISkIAEJCABCUhAAkUlYLpKQkADQElOlMmUgAQkIAEJSEACEpCABCRQTAKmqiwENACU5UyZTglIQAISkIAEJCABCUhAAkUkYJpKQ0ADQGlOlQmVgAQkIAEJSEACEpCABCRQPAKmqDwENACU51yZUglIQAISkIAEJCABCUhAAkUjYHpKREADQIlOlkmVgAQkIAEJSEACEpCABCRQLAKmpkwENACU6WyZVglIQAISkIAEJCABCUhAAkUiYFpKRUADQKlOl4mVgAQkIAEJSEACEpCABCRQHAKmpFwENACU63yZWglIQAISkIAEJCABCUhAAkUhYDpKRkADQMlOmMmVgAQkIAEJSEACEpCABCRQDAKmomwENACU7YyZXglIQAISkIAEJCABCUhAAkUgYBpKR0ADQOlOmQmWgAQkIAEJSEACEpCABCTQfQKmoHwENACU75yZYglIQAISkIAEJCABCUhAAt0m4PFLSEADQAlPmkmWgAQkIAEJSEACEpCABCTQXQIevYwENACU8ayZZglIQAISkIAEJCABCUhAAt0k4LFLSUADQClPm4mWgAQkIAEJSEACEpCABCTQPQIeuZwENACU87yZaglIQAISkIAEJCABCUhAAt0i4HFLSkADQElPnMmWgAQkIAEJSEACEpCABCTQHQIetawENACU9cyZbglIQAISkIAEJCABCUhAAt0g4DFLS0ADQGlPnQmXgAQkIAEJSEACEpCABCTQeQIesbwENACU99yZcglIQAISkIAEJCABCUhAAp0m4PFKTEADQIlPnkmXgAQkIAEJSEACEpCABCTQWQIercwENACU+eyZdglIQAISkIAEJCABCUhAAp0k4LFKTUADQKlPn4mXgAQkIAEJSEACEpCABCTQOQIeqdwENACU+/yZeglIQAISkIAEJCABCUhAAp0i4HFKTkADQMlPoMmXgAQkIAEJSEACEpCABCTQGQIepewE/h8AAAD//2ZseWwAAAAGSURBVAMAU4wqGPvyfbgAAAAASUVORK5CYII=";

export default function App() {
    const [appState, setAppState] = useState('login');
    const [user, setUser] = useState(null);
    const [isPro, setIsPro] = useState(false);
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
                        setIsPro(!!data.isPro);
                        
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
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-xl transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: `url(${aspirixCap})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixCap})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-white drop-shadow-sm dark:bg-white" style={{ WebkitMaskImage: `url(${aspirixText})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${aspirixText})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
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
                <Sidebar currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} isPro={isPro} />
            </div>

            <main className="flex-1 h-full flex flex-col relative w-full overflow-y-auto">
                {
                    (() => {
                        const premiumViews = ['mcqs', 'currentaffairs'];
                        if (premiumViews.includes(currentView) && !isPro) return <PremiumUpgradeView />;
                        
                        switch (currentView) {
                            case 'dashboard': return <Dashboard selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />;
                            case 'syllabus': return <SyllabusTracker selectedSubjects={selectedSubjects} completedTopics={completedTopics} setCompletedTopics={setCompletedTopics} />;
                            case 'timetable': return <Timetable startTaskTimer={(task, mins) => { setTimerSettings({ active: true, time: mins * 60, task }); setTimerOpen(true); }} />;
                            case 'pastpapers': return <PastPapersView rootFolderId='1loejZdweyTir2QqtUKiHAAFOs5bRxfmz' selectedSubjects={selectedSubjects} />;
                            case 'factbook': return <FactBook facts={facts} setFacts={setFacts} />;
                            case 'currentaffairs': return <CurrentAffairsView />;
                            case 'mcqs': return <SubjectWiseMCQs selectedSubjects={selectedSubjects} />;
                            case 'vocab': return <VocabFlashcards isPro={isPro} />;
                            default: return <Dashboard selectedSubjects={selectedSubjects} completedTopics={completedTopics} openTimer={() => setTimerOpen(true)} dailyStreak={dailyStreak} user={user} />;
                        }
                    })()
                }
            </main>
            <CountdownTimerModal isOpen={timerOpen} onClose={() => setTimerOpen(false)} settings={timerSettings} />
        </div>
    );
}
