const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Fix streak logic in onAuthStateChanged
const authStateStart = `if (data.facts) setFacts(data.facts);`;
const authStateEnd = `if (data.dailyStreak) setDailyStreak(data.dailyStreak);`;
const newAuthState = `if (data.facts) setFacts(data.facts);
                              if (data.dailyStreak !== undefined) {
                                  let currentStreak = data.dailyStreak;
                                  const today = new Date().toDateString();
                                  if (data.lastVisitDate !== today) {
                                      if (data.lastVisitDate) {
                                          const lastDate = new Date(data.lastVisitDate);
                                          const todayDate = new Date();
                                          lastDate.setHours(0,0,0,0);
                                          todayDate.setHours(0,0,0,0);
                                          const diffDays = Math.ceil(Math.abs(todayDate - lastDate) / (1000 * 60 * 60 * 24));
                                          if (diffDays === 1) {
                                              currentStreak += 1;
                                          } else if (diffDays > 1) {
                                              currentStreak = 1;
                                          }
                                      } else {
                                          currentStreak = 1;
                                      }
                                  }
                                  setDailyStreak(currentStreak);
                              }`;
code = code.replace(authStateStart + "\n" + `                              if (data.dailyStreak) setDailyStreak(data.dailyStreak);`, newAuthState);
// Sometimes formatting has different spaces, I'll use regex if it fails.
if (!code.includes("if (data.lastVisitDate !== today)")) {
    code = code.replace(/if\s*\(data\.dailyStreak\)\s*setDailyStreak\(data\.dailyStreak\);/g, `if (data.dailyStreak !== undefined) {
                                  let currentStreak = data.dailyStreak;
                                  const today = new Date().toDateString();
                                  if (data.lastVisitDate !== today) {
                                      if (data.lastVisitDate) {
                                          const lastDate = new Date(data.lastVisitDate);
                                          const todayDate = new Date();
                                          lastDate.setHours(0,0,0,0);
                                          todayDate.setHours(0,0,0,0);
                                          const diffDays = Math.ceil(Math.abs(todayDate - lastDate) / (1000 * 60 * 60 * 24));
                                          if (diffDays === 1) {
                                              currentStreak += 1;
                                          } else if (diffDays > 1) {
                                              currentStreak = 1;
                                          }
                                      } else {
                                          currentStreak = 1;
                                      }
                                  }
                                  setDailyStreak(currentStreak);
                              }`);
}


const syncDataMatch = `lastUpdate: new Date()`;
const syncDataReplace = `lastUpdate: new Date(),
                        lastVisitDate: new Date().toDateString()`;
code = code.replace(syncDataMatch, syncDataReplace);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed streak automation');
