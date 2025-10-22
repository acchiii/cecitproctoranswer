const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('result');
const ctx = canvas.getContext('2d');

let questionsData = [];
let lastAnswer = null;

function loadData() {
  try {
    const raw = localStorage.getItem('data');
    if (!raw) {
      output.innerHTML = `<pre style="color:red;">⚠️ No JSON found in localStorage.</pre>`;
      return;
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed.questions)) {
      questionsData = parsed.questions;
      //console.log(`Loaded ${questionsData.length} questions`);
    } else {
      output.innerHTML = `<pre style="color:red;">⚠️ Invalid data format: ${JSON.stringify(parsed, null, 2)}</pre>`;
    }
  } catch (err) {
    output.innerHTML = `<pre style="color:red;">❌ JSON parse error:\n${err}</pre>`;
  }
}


async function startCamera() {
  try {
   const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    video.setAttribute('playsinline', true);
    video.srcObject = stream;
  } catch (err) {
    //console.error("❌ Camera access denied:", err);
  }
}


async function scanFrame() {
  //console.log('🔁 Scanning frame...');

 
  loadData();

  if (!questionsData.length) {
    //console.warn("⚠️ No question data loaded yet.");
    return;
  }


  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);


  const result = await Tesseract.recognize(canvas, 'eng');
  const detectedText = result.data.text.toLowerCase().trim();

 
  const match = questionsData.find(q => {
    const questionText = (q.question || '').toLowerCase();
    return detectedText.includes(questionText.slice(0, 25));
  });

  if (match) {
    if (lastAnswer !== match.answer) {
      console.log(`Detected Question: ${match.code}`);
      console.log(`Answer: ${match.answer}`);
      output.innerHTML = `<span style="color:Black; font-size: 30px;">Detected Question: ${match.question}</span>` + 
    `<br><span style="color:red; font-size: 30px;">Answer: ${match.answer}</span>`;
      speak(match.answer)
      lastAnswer = match.answer;
    } else {
      //console.log(`⏭️ Same answer detected again — skipped.`);
    }
  } else {
    //console.log("❌ No match found in this frame.");
  }
}


function startAutoScan() {
  setInterval(scanFrame, 2000); 
}


function speak(text) {
  if (!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";         
  utter.rate = 1;                
  utter.pitch = 1;              
  speechSynthesis.cancel();    
  speechSynthesis.speak(utter);
}


(async function init() {
  loadData();      
  await startCamera();
  startAutoScan();
})();
