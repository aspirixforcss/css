const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// For Sidebar (pl-16 to pl-12)
const sidebarOld = `<div className="flex justify-center w-full mt-8 mb-6 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-16">`;
const sidebarNew = `<div className="flex justify-center w-full mt-8 mb-6 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-12">`;

// For App (pl-12 to pl-8)
const appOld = `<div className="flex items-center h-10 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-12">`;
const appNew = `<div className="flex items-center h-10 mt-2 pl-4 cursor-pointer group transition-transform duration-300 hover:scale-105" onClick={() => setCurrentView('dashboard')}>
                    <div className="relative flex items-center pl-8">`;

code = code.replace(sidebarOld, sidebarNew);
code = code.replace(appOld, appNew);

fs.writeFileSync('src/app/page.js', code);
console.log('Done padding reduction');
