const fs = require('fs');

let fbCode = fs.readFileSync('scratch/FactBook.js', 'utf8');

const oldFbDiv = '<div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">';
const newFbDiv = '<div className="flex flex-wrap mb-8 gap-3">';

fbCode = fbCode.replace(oldFbDiv, newFbDiv);
fs.writeFileSync('scratch/FactBook.js', fbCode);

let sbCode = fs.readFileSync('scratch/Sidebar.js', 'utf8');
const oldSbLogo = `<div className="relative flex items-center justify-center w-full mt-6 mb-4 h-16 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-6 -left-3 w-16 h-16 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-52 h-12 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

const newSbLogo = `<div className="relative flex items-center justify-center w-full mt-8 mb-8 h-16 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-7 -left-1 w-20 h-20 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-56 h-14 bg-slate-800 dark:bg-white drop-shadow-sm relative z-0 ml-4" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

sbCode = sbCode.replace(oldSbLogo, newSbLogo);
fs.writeFileSync('scratch/Sidebar.js', sbCode);

console.log('Patched correctly');
