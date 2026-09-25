const fs = require('fs');
let code = fs.readFileSync('scratch/App.js', 'utf8');
code = code.replace("const [mobileMenuOpen, setMobileMenuOpen] = useState(false);", "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n    const [settingsOpen, setSettingsOpen] = useState(false);");
code = code.replace("<Sidebar currentView={currentView}", "<Sidebar onOpenSettings={() => setSettingsOpen(true)} currentView={currentView}");
code = code.replace('<main className="flex-1 h-full flex flex-col relative w-full overflow-y-auto">', `<main className="flex-1 h-full flex flex-col relative w-full overflow-y-auto">
                <button onClick={toggleTheme} className="fixed top-4 right-16 md:top-6 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-yellow-400 hover:scale-110 transition-all z-40">
                    <i className={\`fa-solid \${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg md:text-xl\`}></i>
                </button>`);
code = code.replace("</main>", `</main>
            <SettingsModal 
                isOpen={settingsOpen} 
                onClose={() => setSettingsOpen(false)} 
                onChangeSubjects={() => setAppState('onboarding')} 
                onSignOut={() => signOut(auth)} 
            />`);
fs.writeFileSync('scratch/NewApp.js', code);
