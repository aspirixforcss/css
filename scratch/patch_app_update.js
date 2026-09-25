const fs = require('fs');

let appCode = fs.readFileSync('scratch/App.js', 'utf8');

// Fix Tooltip Effect
const oldEffect = `    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setTooltip({
                    visible: true,
                    x: rect.left + (rect.width / 2),
                    y: rect.top,
                    text: text
                });
            } else {
                setTooltip({ visible: false, x: 0, y: 0, text: '' });
            }
        };
        
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, []);`;

const newEffect = `    useEffect(() => {
        if (currentView !== 'currentaffairs' && currentView !== 'pastpapers') {
            setTooltip({ visible: false, x: 0, y: 0, text: '' });
            return;
        }

        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setTooltip({
                    visible: true,
                    x: rect.left + (rect.width / 2),
                    y: rect.top,
                    text: text
                });
            } else {
                setTooltip({ visible: false, x: 0, y: 0, text: '' });
            }
        };
        
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, [currentView]);`;

appCode = appCode.replace(oldEffect, newEffect);

// Fix Mobile Header Logo
const oldMobileLogo = `<div className="relative flex items-center h-10 mt-2 pl-4">
                    <div className="absolute -top-3 -left-1 w-10 h-10 -rotate-45 z-10">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-lg" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-32 h-8 bg-white drop-shadow-sm relative z-0 ml-2" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;
const newMobileLogo = `<div className="relative flex items-center h-12 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="absolute -top-4 -left-2 w-14 h-14 -rotate-45 z-10 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-primaryLight via-primary to-primaryDark drop-shadow-2xl" style={{ WebkitMaskImage: \`url(\${aspirixCap})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixCap})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                    </div>
                    <div className="w-40 h-10 bg-white drop-shadow-sm relative z-0 ml-3" style={{ WebkitMaskImage: \`url(\${aspirixText})\`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: \`url(\${aspirixText})\`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                </div>`;

appCode = appCode.replace(oldMobileLogo, newMobileLogo);
fs.writeFileSync('scratch/App.js', appCode);

console.log('App patched');
