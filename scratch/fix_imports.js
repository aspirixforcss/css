const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');
code = code.replace("import { auth, db, functions, googleProvider } from '../lib/firebase';\\nimport { httpsCallable } from 'firebase/functions';", "import { auth, db, functions, googleProvider } from '../lib/firebase';\nimport { httpsCallable } from 'firebase/functions';");

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed imports');
