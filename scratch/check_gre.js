const XLSX = require('xlsx');
const API_KEY = 'AIzaSyBRb_sUPTEQDnHi223Kwld4JHKM-5K9000';
async function test() {
    try {
        let url = `https://www.googleapis.com/drive/v3/files/1FDZad7CTF-YhKejQCDUVUUDusVsQkCk-ATx8SL_HG7k?alt=media&key=${API_KEY}`;
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, {type: 'array'});
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        console.log('GRE Vocab:');
        console.log(data.slice(0, 3));
        
        let url2 = `https://www.googleapis.com/drive/v3/files/1SrgH5uqOXSgppibKrXBrFlCdi87-WENOBO_hf7dbN0I?alt=media&key=${API_KEY}`;
        const res2 = await fetch(url2);
        const buf2 = await res2.arrayBuffer();
        const wb2 = XLSX.read(buf2, {type: 'array'});
        const sheet2 = wb2.Sheets[wb2.SheetNames[0]];
        const data2 = XLSX.utils.sheet_to_json(sheet2, {header: 1});
        console.log('Pair of words:');
        console.log(data2.slice(0, 3));
    } catch(e) { console.error(e); }
}
test();
