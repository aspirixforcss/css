const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldFacts = `        if (savedFacts && JSON.parse(savedFacts).length > 0) { setFacts(JSON.parse(savedFacts)); } else { 
            setFacts([
                { id: "1", title: "Pakistan GDP Growth", content: "World Bank projects Pakistan's economic growth to remain modest at 1.8% in FY24.", date: new Date().toLocaleDateString(), tag: "Economy" },
                { id: "2", title: "Education Budget", content: "Federal budget allocation for higher education often falls below the 4% of GDP recommended by UNESCO.", date: new Date().toLocaleDateString(), tag: "Education" },
                { id: "3", title: "Climate Vulnerability", content: "Pakistan ranks among the top 10 most vulnerable countries to climate change despite contributing less than 1% to global emissions.", date: new Date().toLocaleDateString(), tag: "Climate" },
                { id: "4", title: "Women in Parliament", content: "Women hold approximately 20% of the seats in the National Assembly of Pakistan.", date: new Date().toLocaleDateString(), tag: "Gender" },
                { id: "5", title: "Cybersecurity Policy", content: "Pakistan introduced a comprehensive National Cyber Security Policy to secure its digital infrastructure in 2021.", date: new Date().toLocaleDateString(), tag: "Security" },
                { id: "6", title: "Infant Mortality", content: "Pakistan has one of the highest infant mortality rates in South Asia, posing major public health challenges.", date: new Date().toLocaleDateString(), tag: "Health" },
                { id: "7", title: "Agriculture Contribution", content: "Agriculture contributes around 22.7% to Pakistan's GDP and employs roughly 37.4% of the national labor force.", date: new Date().toLocaleDateString(), tag: "Agriculture" }
            ]);
 }`;

const newFacts = `        if (savedFacts && JSON.parse(savedFacts).length > 0) { setFacts(JSON.parse(savedFacts)); } else { 
            setFacts([
                { id: "1", title: "GDP Growth & Size", content: "According to the Economic Survey of Pakistan / Federal Budget (FY2026-27) presented by the Ministry of Finance, real GDP growth for the outgoing fiscal year was recorded at 3.7%, while growth for FY2026-27 is projected at 4.0%. The size of the national economy reached $452 billion, with per capita income rising to $1,901.", date: new Date().toLocaleDateString(), tag: "Economy" },
                { id: "2", title: "Federal Budget Outlay", content: "In the Federal Budget FY2026-27, the government unveiled a total budget outlay of Rs 18.8 trillion, targeting a fiscal deficit of 3.6% of GDP and a primary surplus of 2%.", date: new Date().toLocaleDateString(), tag: "Economy" },
                { id: "3", title: "IT & Services Exports", content: "According to data released by the State Bank of Pakistan (SBP), Pakistan's information technology and telecommunication exports reached a record $4.6 billion during FY2025-26, registering a 21% year-on-year increase driven heavily by software services and freelance contributions.", date: new Date().toLocaleDateString(), tag: "Technology" },
                { id: "4", title: "Environmental Performance Index (EPI)", content: "According to the 2026 Environmental Performance Index published by the Yale Center for Environmental Law and Policy, Pakistan ranks 157th globally with a score of 29.03. This represents a 22-place upward movement from its 179th ranking in the prior report, though persistent air quality challenges continue to impact its overall environmental health scores.", date: new Date().toLocaleDateString(), tag: "Environment" },
                { id: "5", title: "Population Metrics", content: "According to United Nations/Worldometer demographic indicators for 2026, Pakistan’s population stands at approximately 259.9 million, maintaining its position as the world's fifth most populous nation.", date: new Date().toLocaleDateString(), tag: "Demographics" }
            ]);
 }`;

code = code.replace(oldFacts, newFacts);

// Update OnboardingWizard state
const oldOnboardingState = `const OnboardingWizard = ({ onComplete }) => {
    const [selected, setSelected] = useState([]);
    const [targetYear, setTargetYear] = useState(2027);`;

const newOnboardingState = `const OnboardingWizard = ({ onComplete }) => {
    const getBaseYear = () => {
        const now = new Date();
        return now.getMonth() >= 2 ? now.getFullYear() + 1 : now.getFullYear();
    };
    const baseYear = getBaseYear();
    const [selected, setSelected] = useState([]);
    const [targetYear, setTargetYear] = useState(baseYear);`;

code = code.replace(oldOnboardingState, newOnboardingState);

// Update OnboardingWizard UI
const oldOnboardingUI = `                    <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">Target Exam Year</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setTargetYear(2027)}
                            className={\`flex-1 py-4 rounded-2xl font-bold border-2 transition-all \${targetYear === 2027 ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50'}\`}
                        >
                            CSS 2027
                        </button>
                        <button 
                            onClick={() => setTargetYear(2028)}
                            className={\`flex-1 py-4 rounded-2xl font-bold border-2 transition-all \${targetYear === 2028 ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50'}\`}
                        >
                            CSS 2028
                        </button>
                    </div>`;

const newOnboardingUI = `                    <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">Target Exam Year</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setTargetYear(baseYear)}
                            className={\`flex-1 py-4 rounded-2xl font-bold border-2 transition-all \${targetYear === baseYear ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50'}\`}
                        >
                            CSS {baseYear}
                        </button>
                        <button 
                            onClick={() => setTargetYear(baseYear + 1)}
                            className={\`flex-1 py-4 rounded-2xl font-bold border-2 transition-all \${targetYear === (baseYear + 1) ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50'}\`}
                        >
                            CSS {baseYear + 1}
                        </button>
                    </div>`;

code = code.replace(oldOnboardingUI, newOnboardingUI);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed facts and auto year progression');
