const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldParser = `                          } else if (subDomain === 'Idioms') {
                              word = row[0];
                              meaning = row[1];
                              example = row[2] || "";
                          } else {
                              word = row[0];
                              meaning = row[1];
                              if (row[2]) syn = row[2].toString().split(',').map(s=>s.trim());
                              if (row[3]) ant = row[3].toString().split(',').map(s=>s.trim());
                              if (row[4]) example = row[4];
                          }`;

const newParser = `                          } else if (subDomain === 'Idioms') {
                              word = row[0];
                              meaning = row[1];
                              example = row[2] || "";
                          } else if (subDomain === 'Pair of words') {
                              word = row[0];
                              meaning = row[1];
                              example = row[2] || "";
                          } else {
                              word = row[0];
                              meaning = row[1];
                              if (row[2]) syn = row[2].toString().split(',').map(s=>s.trim());
                              if (row[3]) ant = row[3].toString().split(',').map(s=>s.trim());
                              if (row[4]) example = row[4];
                          }`;

code = code.replace(oldParser, newParser);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed Pair of words parsing');
