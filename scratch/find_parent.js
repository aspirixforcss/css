const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';

async function checkVocabRoot() {
    try {
        const FOLDER_ID = '1fiaZu0HaW-hcclXv5jx7gJG-z2bKwOgw';
        
        // Let's see if we can get the parent of this folder to find other folders!
        const url1 = `https://www.googleapis.com/drive/v3/files/${FOLDER_ID}?fields=parents&key=${API_KEY}`;
        const res1 = await fetch(url1);
        const data1 = await res1.json();
        console.log("Parents of Vocab folder:", data1);
        
        if (data1.parents && data1.parents.length > 0) {
            const parentId = data1.parents[0];
            const url2 = `https://www.googleapis.com/drive/v3/files?q='${parentId}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;
            const res2 = await fetch(url2);
            const data2 = await res2.json();
            console.log("\nSiblings of Vocab folder:", data2);
        }
    } catch(e) {
        console.error(e);
    }
}
checkVocabRoot();
