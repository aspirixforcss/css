const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Fix the App component's modal button (revert it)
const brokenAppButton = `<i className="fa-solid fa-save"></i> {editingFactId ? 'Update Fact' : 'Save Fact'}`;
const fixedAppButton = `<i className="fa-solid fa-save"></i> Save Fact`;
code = code.replace(brokenAppButton, fixedAppButton);

// 2. Add the dynamic text to the FactBook component's modal button
const oldFactBookButton = `<i className="fa-solid fa-save"></i> Save to Fact Book`;
const newFactBookButton = `<i className="fa-solid fa-save"></i> {editingFactId ? 'Update Fact' : 'Save to Fact Book'}`;
code = code.replace(oldFactBookButton, newFactBookButton);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed FactBook modal button bug');
