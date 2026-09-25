const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';

async function searchDrive() {
    try {
        // Find CSS mix data folder
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='CSS mix data' and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${API_KEY}`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        console.log("CSS mix data folders:", data);
        
        if (data.files && data.files.length > 0) {
            const folderId = data.files[0].id;
            
            // Find contents of CSS mix data
            const contentsUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;
            const contentsRes = await fetch(contentsUrl);
            const contentsData = await contentsRes.json();
            console.log("\nContents of CSS mix data:", contentsData);
            
            // For each subfolder, list a few files to see names
            for (let file of contentsData.files) {
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    const subUrl = `https://www.googleapis.com/drive/v3/files?q='${file.id}' in parents&fields=files(id,name)&key=${API_KEY}&pageSize=5`;
                    const subRes = await fetch(subUrl);
                    const subData = await subRes.json();
                    console.log(`\nFiles in ${file.name}:`, subData);
                }
            }
        }
    } catch(e) {
        console.error(e);
    }
}
searchDrive();
