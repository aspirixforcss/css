const fs = require('fs');

let code = fs.readFileSync('src/app/MPTMockTest.js', 'utf8');

// 1. Add the import statement
if (!code.includes('import rawData from')) {
    code = code.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport rawData from '../../public/mpt_mock.json';"
    );
}

// 2. Remove the fetch logic
code = code.replace(
    "const res = await fetch('/mpt_mock.json');\n                const rawData = await res.json();",
    "// Data loaded directly via import"
);

fs.writeFileSync('src/app/MPTMockTest.js', code);
console.log('Fixed MPTMockTest.js');
