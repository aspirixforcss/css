const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldDeps = `}, [selectedSubjects, completedTopics, facts, dailyStreak, targetYear, user, loadingAuth]);`;
const newDeps = `}, [selectedSubjects, completedTopics, facts, dailyStreak, targetYear, user, loadingAuth, appState]);`;

code = code.replace(oldDeps, newDeps);

fs.writeFileSync('src/app/page.js', code);
console.log('Patched syncData deps');
