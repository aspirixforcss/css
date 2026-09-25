const fs = require('fs');
let code = fs.readFileSync('scratch/App.js', 'utf8');

const effectStr = `
    useEffect(() => {
        const handleContextMenu = (e) => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY, text: selectedText });
            } else {
                setContextMenu({ visible: false, x: 0, y: 0, text: '' });
            }
        };
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, text: '' });
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, []);
`;

if (!code.includes('handleContextMenu')) {
    code = code.replace(
        'const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, text: "" });', 
        'const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, text: "" });\n' + effectStr
    );
    fs.writeFileSync('scratch/App.js', code);
    console.log('Added useEffect to App.js');
} else {
    console.log('Already there.');
}
