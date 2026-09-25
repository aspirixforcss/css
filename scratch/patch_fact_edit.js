const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldStateLogic = `const FactBook = ({ facts, setFacts }) => {
    const [newFactTitle, setNewFactTitle] = useState('');
    const [newFactContent, setNewFactContent] = useState('');
    const [newFactTag, setNewFactTag] = useState('Economy');
    const [filterTag, setFilterTag] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);

    const tags = ["Economy", "Budget", "Education", "Security", "Health", "Gender", "Crime", "Governance", "Climate", "Tech", "International Relations", "Society", "History", "Law", "Energy", "Infrastructure", "Agriculture", "Other"];

    const handleSave = () => {
        if (!newFactTitle || !newFactContent) return;
        setFacts([{ id: Date.now().toString(), title: newFactTitle, content: newFactContent, tag: newFactTag, date: new Date().toLocaleDateString() }, ...facts]);
        setNewFactTitle('');
        setNewFactContent('');
        setShowAddModal(false);
    };`;

const newStateLogic = `const FactBook = ({ facts, setFacts }) => {
    const [newFactTitle, setNewFactTitle] = useState('');
    const [newFactContent, setNewFactContent] = useState('');
    const [newFactTag, setNewFactTag] = useState('Economy');
    const [filterTag, setFilterTag] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingFactId, setEditingFactId] = useState(null);

    const tags = ["Economy", "Budget", "Education", "Security", "Health", "Gender", "Crime", "Governance", "Climate", "Tech", "International Relations", "Society", "History", "Law", "Energy", "Infrastructure", "Agriculture", "Other", "Demographics"];

    const handleSave = () => {
        if (!newFactTitle || !newFactContent) return;
        if (editingFactId) {
            setFacts(facts.map(f => f.id === editingFactId ? { ...f, title: newFactTitle, content: newFactContent, tag: newFactTag, date: new Date().toLocaleDateString() } : f));
        } else {
            setFacts([{ id: Date.now().toString(), title: newFactTitle, content: newFactContent, tag: newFactTag, date: new Date().toLocaleDateString() }, ...facts]);
        }
        setNewFactTitle('');
        setNewFactContent('');
        setEditingFactId(null);
        setShowAddModal(false);
    };
    
    const handleEdit = (fact) => {
        setNewFactTitle(fact.title);
        setNewFactContent(fact.content);
        setNewFactTag(fact.tag);
        setEditingFactId(fact.id);
        setShowAddModal(true);
    };
    
    const closeAddModal = () => {
        setShowAddModal(false);
        setEditingFactId(null);
        setNewFactTitle('');
        setNewFactContent('');
    };`;

code = code.replace(oldStateLogic, newStateLogic);

// Now patch the Add New Fact button to use closeAddModal? Wait, it sets showAddModal directly.
// The button is: <button onClick={() => setShowAddModal(true)} ...>
// Let's modify the buttons inside the map to add the Edit button.
const oldActionButtons = `<button onClick={() => removeFact(fact.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                                    <i className="fa-solid fa-trash text-sm"></i>
                                </button>`;

const newActionButtons = `<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(fact)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0" title="Edit Fact">
                                        <i className="fa-solid fa-pen text-sm"></i>
                                    </button>
                                    <button onClick={() => removeFact(fact.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors flex-shrink-0" title="Delete Fact">
                                        <i className="fa-solid fa-trash text-sm"></i>
                                    </button>
                                </div>`;

code = code.replace(oldActionButtons, newActionButtons);

// And update the modal close buttons to use closeAddModal
const oldModalCloseBtn = `<button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex justify-center items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">`;
const newModalCloseBtn = `<button onClick={closeAddModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex justify-center items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">`;
code = code.replace(oldModalCloseBtn, newModalCloseBtn);

const oldModalCancelBtn = `<button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>`;
const newModalCancelBtn = `<button onClick={closeAddModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>`;
code = code.replace(oldModalCancelBtn, newModalCancelBtn);

const oldModalTitle = `<h3 className="font-extrabold text-2xl text-slate-800 dark:text-white flex items-center gap-2"><i className="fa-solid fa-plus text-primary"></i> Add New Fact</h3>`;
const newModalTitle = `<h3 className="font-extrabold text-2xl text-slate-800 dark:text-white flex items-center gap-2"><i className={\`fa-solid \${editingFactId ? 'fa-pen' : 'fa-plus'} text-primary\`}></i> {editingFactId ? 'Edit Fact' : 'Add New Fact'}</h3>`;
code = code.replace(oldModalTitle, newModalTitle);

const oldModalSaveBtn = `<i className="fa-solid fa-save"></i> Save Fact`;
const newModalSaveBtn = `<i className="fa-solid fa-save"></i> {editingFactId ? 'Update Fact' : 'Save Fact'}`;
code = code.replace(oldModalSaveBtn, newModalSaveBtn);

fs.writeFileSync('src/app/page.js', code);
console.log('Fact edit logic added');
