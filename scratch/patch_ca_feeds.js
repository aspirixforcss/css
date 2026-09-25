const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldLogic = `        const fetchNews = async () => {
            try {
                const dawnRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.dawn.com/feeds/home/');
                const dawnData = await dawnRes.json();
                const intlRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.theguardian.com/world/rss');
                const intlData = await intlRes.json();
                
                const dawnItems = dawnData.items || [];
                const intlItems = intlData.items || [];
                
                const stripHtml = (html) => {
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
                }));

                setNews({
                    dawn: cleanItems(dawnItems),
                    intl: cleanItems(intlItems)
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching news:", err);
                setLoading(false);
            }
        };`;

const newLogic = `        const fetchNews = async () => {
            try {
                const stripHtml = (html) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    doc.querySelectorAll('br').forEach(br => br.replaceWith('\\n'));
                    doc.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach(el => {
                        el.appendChild(doc.createTextNode('\\n\\n'));
                    });
                    let text = doc.body.textContent || "";
                    text = text.replace(/ {2,}/g, ' ');
                    text = text.replace(/\\n\\s*\\n/g, '\\n\\n');
                    return text.trim();
                };

                const cleanItems = (items, sourceName) => items.map(item => ({
                    ...item,
                    sourceName,
                    fullText: stripHtml(item.content || item.description || "")
                }));

                const fetchRss = async (url) => {
                    try {
                        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url));
                        const data = await res.json();
                        return data.items || [];
                    } catch (e) {
                        return [];
                    }
                };

                const [dawn, guardian, aljazeera, bbc, nyt] = await Promise.all([
                    fetchRss('https://www.dawn.com/feeds/home/'),
                    fetchRss('https://www.theguardian.com/world/rss'),
                    fetchRss('https://www.aljazeera.com/xml/rss/all.xml'),
                    fetchRss('http://feeds.bbci.co.uk/news/world/rss.xml'),
                    fetchRss('https://rss.nytimes.com/services/xml/rss/nyt/World.xml')
                ]);

                const dawnItems = cleanItems(dawn, 'Dawn');
                let intlItems = [
                    ...cleanItems(guardian, 'The Guardian'),
                    ...cleanItems(aljazeera, 'Al Jazeera'),
                    ...cleanItems(bbc, 'BBC News'),
                    ...cleanItems(nyt, 'New York Times')
                ];

                // Sort international items from newest to oldest
                intlItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

                setNews({
                    dawn: dawnItems,
                    intl: intlItems
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching news:", err);
                setLoading(false);
            }
        };`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed RSS feeds');
