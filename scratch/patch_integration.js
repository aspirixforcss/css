const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Add import
if (!code.includes('import MPTMockTest from')) {
    code = code.replace(
        "import * as XLSX from 'xlsx';",
        "import * as XLSX from 'xlsx';\nimport MPTMockTest from './MPTMockTest';"
    );
}

// 2. Add to Sidebar
if (!code.includes("id: 'mptmock'")) {
    code = code.replace(
        "{ id: 'vocab', icon: 'fa-solid fa-spell-check', label: 'Vocab Flashcards' },",
        "{ id: 'vocab', icon: 'fa-solid fa-spell-check', label: 'Vocab Flashcards' },\n        { id: 'mptmock', icon: 'fa-solid fa-graduation-cap', label: 'MPT Mock Test', pro: true },"
    );
}

// 3. Add to premiumViews
code = code.replace(
    "const premiumViews = ['mcqs', 'currentaffairs'];",
    "const premiumViews = ['mcqs', 'currentaffairs', 'mptmock'];"
);

// 4. Add to App switch statement
code = code.replace(
    "case 'mcqs': return <SubjectWiseMCQs selectedSubjects={selectedSubjects} />;",
    "case 'mcqs': return <SubjectWiseMCQs selectedSubjects={selectedSubjects} />;\n                              case 'mptmock': return <MPTMockTest isPro={isPro} />;"
);

fs.writeFileSync('src/app/page.js', code);
console.log("Success");
