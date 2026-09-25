const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldLogic1 = `                const stripHtml = (html) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    return doc.body.textContent || "";
                };

                const cleanItems = (items) => items.map(item => ({
                    ...item,
                    fullText: stripHtml(item.content || item.description || "")
                }));`;

const newLogic1 = `                const stripHtml = (html) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    // Add explicit newlines for block elements to preserve paragraph structure
                    doc.querySelectorAll('br').forEach(br => br.replaceWith('\\n'));
                    doc.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach(el => {
                        el.appendChild(doc.createTextNode('\\n\\n'));
                    });
                    let text = doc.body.textContent || "";
                    // Clean up run-on spaces and limit multiple newlines
                    text = text.replace(/ {2,}/g, ' ');
                    text = text.replace(/\\n\\s*\\n/g, '\\n\\n');
                    return text.trim();
                };

                const cleanItems = (items) => items.map(item => ({
                    ...item,
                    fullText: stripHtml(item.content || item.description || "")
                }));`;

const oldLogic2 = `                        <div className="columns-1 md:columns-2 gap-10 text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-justify">
                            {(topArticle.fullText || "").split('. ').filter(s => s.trim().length > 0).map((sentence, idx) => (
                                <p key={idx} className="mb-4 break-inside-avoid-column">
                                    {idx === 0 ? <span className="float-left text-5xl font-black text-slate-900 dark:text-white pr-3 font-serif mt-2">{sentence.charAt(0)}</span> : null}
                                    {idx === 0 ? sentence.substring(1) + (sentence.endsWith('.') ? '' : '.') : sentence + (sentence.endsWith('.') ? '' : '.')}
                                </p>
                            ))}
                        </div>`;

const newLogic2 = `                        <div className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-justify space-y-4">
                            {(topArticle.fullText || "").split('\\n\\n').filter(s => s.trim().length > 0).map((paragraph, idx) => (
                                <p key={idx} className="leading-7">
                                    {idx === 0 && paragraph.length > 0 ? (
                                        <>
                                            <span className="float-left text-5xl font-black text-slate-900 dark:text-white pr-3 font-serif mt-2 leading-none">{paragraph.charAt(0)}</span>
                                            {paragraph.substring(1)}
                                        </>
                                    ) : (
                                        paragraph
                                    )}
                                </p>
                            ))}
                        </div>`;

code = code.replace(oldLogic1, newLogic1);
code = code.replace(oldLogic2, newLogic2);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed current affairs text formatting');
