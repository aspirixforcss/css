const XLSX = require('xlsx');
const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
async function test(id, isSheet) {
    let url = isSheet ? 
        `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&key=${API_KEY}` :
        `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, {type: 'array'});
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        console.log("ID:", id);
        console.log("Row 0:", data[0]);
        console.log("Row 1:", data[1]);
    } catch (e) {
        console.error("Error for ID:", id, e.message);
    }
}

test('1MjwW_0Il-tXHWYeKRnKA_Tav7TDodY5e', false); // Prepositions
test('1xxhAdxXL4EL3otdu19qE616GO2eBPh5C', false); // Translations
test('1Y-j5owIinapffCt03y-p_msXXtLwrE3yGv2X1xHvjlg', true); // Idioms
test('1E9xhzKgJfyZVajtks17ozgicUuxq8ZsP', false); // Sentence correction
