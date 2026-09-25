const fs = require('fs');

// 1. Sidebar Logo Patch
let sbCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');
const oldSb = `<div className="relative flex items-center justify-center w-full mt-8 mb-4 h-12 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-6 left-0 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-16" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const newSb = `<div className="relative flex items-center justify-center w-full mt-8 mb-4 h-12 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-6 left-2 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-28" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
sbCode = sbCode.replace(oldSb, newSb);
fs.writeFileSync('scratch/Sidebar.js', sbCode);

// 2. App Logo Patch
let appCode = fs.readFileSync('scratch/App.js', 'utf8');
const oldApp = `<div className="relative flex items-center h-10 mt-2 pl-2 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-3 -left-1 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-28 h-7 bg-white drop-shadow-sm relative z-0 ml-12" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const newApp = `<div className="relative flex items-center h-10 mt-2 pl-2 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-3 left-0 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-28 h-7 bg-white drop-shadow-sm relative z-0 ml-20" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
appCode = appCode.replace(oldApp, newApp);
fs.writeFileSync('scratch/App.js', appCode);

console.log('Fixed margins');
