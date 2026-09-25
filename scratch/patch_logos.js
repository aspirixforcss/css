const fs = require('fs');

let sidebarCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');
const sidebarOldLogo = `<div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-lg transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-40 h-10 bg-slate-800 dark:bg-white drop-shadow-sm" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
const sidebarNewLogo = `<div className="relative flex items-center justify-center w-full mt-4 mb-2 h-14 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-4 -left-2 w-14 h-14 -rotate-45 z-10">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-lg" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-48 h-10 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
sidebarCode = sidebarCode.replace(sidebarOldLogo, sidebarNewLogo);
fs.writeFileSync('scratch/Sidebar.js', sidebarCode);


let appCode = fs.readFileSync('scratch/App.js', 'utf8');
const appOldLogo = `<div className="flex items-center gap-2">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-xl transform transition-transform hover:scale-105 " style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-slate-800 drop-shadow-sm dark:bg-white" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
const appNewLogo = `<div className="relative flex items-center h-10 mt-2 pl-4">
                    <div className="absolute -top-3 -left-1 w-10 h-10 -rotate-45 z-10">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-lg" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-white drop-shadow-sm relative z-0 ml-2" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
appCode = appCode.replace(appOldLogo, appNewLogo);
fs.writeFileSync('scratch/App.js', appCode);

console.log('Logos patched!');
