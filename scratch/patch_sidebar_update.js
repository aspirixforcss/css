const fs = require('fs');
let sidebarCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');

const oldSidebarLogo = `<div className="relative flex items-center justify-center w-full mt-4 mb-2 h-14 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-4 -left-2 w-14 h-14 -rotate-45 z-10">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-lg" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-48 h-10 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const newSidebarLogo = `<div className="relative flex items-center justify-center w-full mt-6 mb-4 h-16 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-6 -left-3 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-52 h-12 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

sidebarCode = sidebarCode.replace(oldSidebarLogo, newSidebarLogo);
fs.writeFileSync('scratch/Sidebar.js', sidebarCode);
console.log('Sidebar patched');
