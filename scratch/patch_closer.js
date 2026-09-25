const fs = require('fs');

// Sidebar Patch
let sbCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');

const oldSb = `<div className="flex justify-center w-full mt-8 mb-6 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-24">
                        <div className="absolute -top-6 left-0 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                            <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                        </div>
                        <div className="w-32 h-8 bg-slate-800 dark:bg-white drop-shadow-sm z-0 ml-2 mt-2" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                </div>`;

// Use pl-16 (64px) for inner wrapper, no ml. This pulls text left by 40px!
const newSb = `<div className="flex justify-center w-full mt-8 mb-6 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-16">
                        <div className="absolute -top-6 left-0 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                            <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                        </div>
                        <div className="w-32 h-8 bg-slate-800 dark:bg-white drop-shadow-sm z-0 mt-2" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                </div>`;

sbCode = sbCode.replace(oldSb, newSb);
fs.writeFileSync('scratch/Sidebar.js', sbCode);


// App Patch
let appCode = fs.readFileSync('scratch/App.js', 'utf8');

const oldApp = `<div className="flex items-center h-10 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-20">
                        <div className="absolute -top-3 left-0 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                            <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                        </div>
                        <div className="w-28 h-7 bg-white drop-shadow-sm z-0 mt-1 ml-1" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                </div>`;

// Use pl-12 (48px) for inner wrapper, no ml. This pulls text left by 36px!
const newApp = `<div className="flex items-center h-10 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-12">
                        <div className="absolute -top-3 left-0 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                            <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                        </div>
                        <div className="w-28 h-7 bg-white drop-shadow-sm z-0 mt-1" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                </div>`;

appCode = appCode.replace(oldApp, newApp);
fs.writeFileSync('scratch/App.js', appCode);

console.log('Patched very snug spacing');
