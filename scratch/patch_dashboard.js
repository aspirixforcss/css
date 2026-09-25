const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldHeader = `{/* News Headlines Marquee */}`;
const newHeader = `{/* MPT Mock Test Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 mb-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10 mb-6 md:mb-0">
                    <div className="inline-block px-3 py-1 bg-white/20 text-white font-bold text-xs rounded-full mb-3 backdrop-blur-md">PRO EXCLUSIVE</div>
                    <h2 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                        <i className="fa-solid fa-graduation-cap text-primary"></i> MPT Mock Test Simulator
                    </h2>
                    <p className="text-slate-300 font-medium max-w-xl">
                        Take a full-length 200 MCQ mock test. Randomly generated questions from Islamic Studies, Urdu, English, General Abilities, and General Knowledge.
                    </p>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                    <button onClick={() => setCurrentView('mptmock')} className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-primaryDark text-white font-black rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center justify-center gap-2">
                        Start Mock Test <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {/* News Headlines Marquee */}`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/app/page.js', code);
console.log('Success');
