const XLSX = require('xlsx');
const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
async function test() {
    let url = `https://www.googleapis.com/drive/v3/files/1E9xhzKgJfyZVajtks17ozgicUuxq8ZsP?alt=media&key=${API_KEY}`;
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, {type: 'array'});
    console.log("Sheet names:", wb.SheetNames);
    
    let allRules = [];
    wb.SheetNames.forEach(sheetName => {
        const sheet = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        const rules = data.filter(r => r[0] && typeof r[0] === 'string' && r[0].toLowerCase().includes('rule')).map(r => r[0]);
        allRules.push(...rules);
    });
    console.log("All rules:", allRules);
}
test();
