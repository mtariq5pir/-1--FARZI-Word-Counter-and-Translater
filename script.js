// --- Elements Setup ---
const textInput = document.getElementById('text-input');
const btnCopy = document.getElementById('btn-copy');
const btnClear = document.getElementById('btn-clear');
const dropZone = document.getElementById('drop-zone');
const filePicker = document.getElementById('file-picker');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Stats Fields
const statWords = document.getElementById('stat-words');
const statChars = document.getElementById('stat-chars');
const statCharsNoSpace = document.getElementById('stat-chars-no-space');
const statSentences = document.getElementById('stat-sentences');
const statParagraphs = document.getElementById('stat-paragraphs');
const statReading = document.getElementById('stat-reading');
const statSpeaking = document.getElementById('stat-speaking');
const topWordsList = document.getElementById('top-words-list');

// --- Google Charts Init ---
let chartData = [['Metric', 'Count']];
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    const data = google.visualization.arrayToDataTable([
        ['Task', 'Text Analytics Summary'],
        ['Words', parseInt(statWords.textContent) || 0],
        ['Sentences', parseInt(statSentences.textContent) || 0],
        ['Paragraphs', parseInt(statParagraphs.textContent) || 0]
    ]);

    const options = {
        title: 'متن کا گرافک خاکہ (Text Structure)',
        is3D: true,
        backgroundColor: 'transparent',
        titleTextStyle: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333' },
        legend: { textStyle: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333' } }
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
}

// --- 5. Dark Mode Persistent Switch Logic ---
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.textContent = "☀️";
}

darkModeToggle.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        darkModeToggle.textContent = "🌙";
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.textContent = "☀️";
        localStorage.setItem('theme', 'dark');
    }
    drawChart(); // Redraw chart with new colors
});

// --- 6. File Upload / Upload Handling ---
dropZone.addEventListener('click', () => filePicker.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.background = "rgba(37, 99, 235, 0.1)"; });
dropZone.addEventListener('dragleave', () => dropZone.style.background = "");
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = "";
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});
filePicker.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });

function handleFile(file) {
    if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            textInput.value = e.target.result;
            textInput.dispatchEvent(new Event('input'));
        };
        reader.readAsText(file);
    } else {
        alert("فلحال صرف .txt فائلز اسٹرکچر کو یہ ڈائریکٹ اسپورٹ کرتا ہے، مزید ایکسٹینشنز اگلے ورژن میں شامل ہوں گی!");
    }
}

// --- Dynamic Analyzer Core Counter Logic ---
textInput.addEventListener('input', () => {
    const text = textInput.value;

    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, '').length;
    const wordsArray = text.trim().match(/\p{L}+/gu) || [];
    const wordCount = wordsArray.length;
    const sentenceCount = text.trim() === "" ? 0 : (text.split(/[.!?۔؟]+/g).filter(s => s.trim().length > 0).length);
    const paragraphCount = text.trim() === "" ? 0 : text.split(/\n+/).filter(p => p.trim().length > 0).length;

    // View Updating
    statWords.textContent = wordCount;
    statChars.textContent = charCount;
    statCharsNoSpace.textContent = charNoSpaceCount;
    statSentences.textContent = sentenceCount;
    statParagraphs.textContent = paragraphCount;
    statReading.textContent = `${Math.floor(wordCount / 200)}m ${Math.round((wordCount % 200) / 3.3)}s`;
    statSpeaking.textContent = `${Math.floor(wordCount / 130)}m ${Math.round((wordCount % 130) / 2.1)}s`;

    // 9. Process Top Repeated Words
    calculateTopWords(wordsArray);
    
    // Refresh chart live
    drawChart();
});

// --- 9. Top Words Calculation Generator ---
function calculateTopWords(words) {
    if (words.length === 0) {
        topWordsList.innerHTML = `<li class="empty-list">متن لکھیں تاکہ بار بار آنے والے الفاظ یہاں نظر آئیں۔</li>`;
        return;
    }
    let freqMap = {};
    words.forEach(w => {
        let cleanWord = w.toLowerCase();
        if(cleanWord.length > 2) { // Skip tiny words
            freqMap[cleanWord] = (freqMap[cleanWord] || 0) + 1;
        }
    });

    let sortedWords = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    if(sortedWords.length === 0) {
        topWordsList.innerHTML = `<li class="empty-list">تھوڑا طویل متن لکھیں...</li>`;
        return;
    }

    topWordsList.innerHTML = sortedWords.map(([word, num]) => `<li><span>${word}</span> <strong>(${num})</strong></li>`).join('');
}

// --- 7. Download Report Methods ---
function downloadAs(type) {
    const textData = `FARZI Text Report\n=====\nWords: ${statWords.textContent}\nCharacters: ${statChars.textContent}\nSentences: ${statSentences.textContent}\nParagraphs: ${statParagraphs.textContent}`;
    let blob, filename;
    
    if (type === 'txt') {
        blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
        filename = "farzi-report.txt";
    } else if (type === 'csv') {
        const csvData = `Metric,Count\nWords,${statWords.textContent}\nCharacters,${statChars.textContent}\nSentences,${statSentences.textContent}\nParagraphs,${statParagraphs.textContent}`;
        blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
        filename = "farzi-report.csv";
    }
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// اس فنکشن کو اپنے script.js میں نیچے کہیں بھی شامل کر لیں

function triggerGoogleTranslate(langCode) {
    if (!langCode) return;

    // گوگل ٹرانسلیٹ کے اندرونی سلیکٹر کو تلاش کرنا
    const googleSelect = document.querySelector('.goog-te-combo');
    
    if (googleSelect) {
        googleSelect.value = langCode;
        // گوگل کے ویجیٹ کو بتانا کہ زبان تبدیل ہو چکی ہے تاکہ وہ رینڈر کرے
        googleSelect.dispatchEvent(new Event('change'));
    } else {
        alert("گوگل ٹرانسلیٹر ابھی لوڈ ہو رہا ہے، براہ کرم ایک سیکنڈ انتظار کر کے دوبارہ کوشش کریں۔");
    }
}

// گوگل ٹرانسلیٹ انیشلائزیشن کو اپڈیٹ کریں تاکہ یہ تمام زبانوں کو سپورٹ کرے
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'ur',
        // یہاں آپ جتنی چاہیں زبانیں شامل کر سکتے ہیں، خالی چھوڑنے سے گوگل خودکار طور پر تمام زبانیں سپورٹ کر لیتا ہے
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

// Direction UI Switcher
function setDirection(dir) {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ur' : 'en');
    document.getElementById('btn-ur-ar').classList.toggle('active', dir === 'rtl');
    document.getElementById('btn-en').classList.toggle('active', dir === 'ltr');
    textInput.style.fontFamily = dir === 'rtl' ? "var(--font-ur)" : "var(--font-en)";
}

// Copy & Clear Utility Actions
btnCopy.addEventListener('click', () => {
    if (!textInput.value.trim()) return;
    textInput.select();
    navigator.clipboard.writeText(textInput.value);
    const old = btnCopy.textContent; btnCopy.textContent = "Copied! ✓";
    setTimeout(() => { btnCopy.textContent = old; }, 1500);
});

btnClear.addEventListener('click', () => {
    textInput.value = "";
    textInput.dispatchEvent(new Event('input'));
});

// Like/Dislike Mechanism
let likes = parseInt(localStorage.getItem('f_l')) || 0, dislikes = parseInt(localStorage.getItem('f_d')) || 0;
document.getElementById('like-count').textContent = likes; document.getElementById('dislike-count').textContent = dislikes;

document.getElementById('btn-like').addEventListener('click', () => {
    if(localStorage.getItem('f_voted')) return alert("آپ پہلے ہی ووٹ دے چکے ہیں!");
    likes++; document.getElementById('like-count').textContent = likes;
    localStorage.setItem('f_l', likes); localStorage.setItem('f_voted', true);
});
// ڈس لائک کا صحیح اور مکمل کوڈ
document.getElementById('btn-dislike').addEventListener('click', () => {
    if(localStorage.getItem('f_voted')) return alert("آپ پہلے ہی ووٹ دے چکے ہیں!");
    dislikes++; 
    document.getElementById('dislike-count').textContent = dislikes;
    localStorage.setItem('f_d', dislikes); 
    localStorage.setItem('f_voted', true);
});

// فارم سبمٹ ہونے پر لائکس بھیجنے کا کوڈ
document.getElementById('feedback-form').addEventListener('submit', function() {
    document.getElementById('hidden-likes').value = localStorage.getItem('f_l') || 0;
    document.getElementById('hidden-dislikes').value = localStorage.getItem('f_d') || 0;
});