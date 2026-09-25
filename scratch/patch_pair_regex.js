const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');
code = code.replace(
  /} else if \(subDomain === 'Idioms'\) \{\s*word = row\[0\];\s*meaning = row\[1\];\s*example = row\[2\] \|\| "";\s*} else \{/,
  `} else if (subDomain === 'Idioms') {
                              word = row[0];
                              meaning = row[1];
                              example = row[2] || "";
                          } else if (subDomain === 'Pair of words') {
                              word = row[0];
                              meaning = row[1];
                              example = row[2] || "";
                          } else {`
);
fs.writeFileSync('src/app/page.js', code);
