const XLSX = require('xlsx');
const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
async function test() {
    let url = `https://www.googleapis.com/drive/v3/files/1E9xhzKgJfyZVajtks17ozgicUuxq8ZsP?alt=media&key=${API_KEY}`;
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, {type: 'array'});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    console.log(data.slice(0, 20));
}
test();
