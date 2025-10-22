const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('result');
const ctx = canvas.getContext('2d');

let questionsData = [];
let lastAnswer = null;

// 🧠 Load data from localStorage
function loadData() {
  try {
    const raw = localStorage.getItem('data');
    if (!raw) {
      output.innerHTML = `<pre style="color:red;">⚠️ No JSON found in localStorage.</pre>`;
      return;
    }

    // Parse the string into an object
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed.questions)) {
      questionsData = parsed.questions;
      //console.log(`✅ Loaded ${questionsData.length} questions`);
    } else {
      output.innerHTML = `<pre style="color:red;">⚠️ Invalid data format: ${JSON.stringify(parsed, null, 2)}</pre>`;
    }
  } catch (err) {
    output.innerHTML = `<pre style="color:red;">❌ JSON parse error:\n${err}</pre>`;
  }
}

// 🎥 Start the webcam
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

// 🔍 Scan every 5 seconds
async function scanFrame() {
  //console.log('🔁 Scanning frame...');

  // Reload JSON each scan (if you update it)
  loadData();

  if (!questionsData.length) {
    //console.warn("⚠️ No question data loaded yet.");
    return;
  }

  // Capture current frame
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // OCR detection
  const result = await Tesseract.recognize(canvas, 'eng');
  const detectedText = result.data.text.toLowerCase().trim();

  // Try to find a match
  const match = questionsData.find(q => {
    const questionText = (q.question || '').toLowerCase();
    return detectedText.includes(questionText.slice(0, 25));
  });

  if (match) {
    if (lastAnswer !== match.answer) {
      console.log(`Detected Question: ${match.code}`);
      console.log(`Answer: ${match.answer}`);
      output.innerHTML = `<span style="color:Black; font-size: 30px;">Detected Question: ${match.question}</span>` + 
    `<br><span style="color:red; font-size: 30px;">${match.answer}</span>`;
      speak(match.answer)
      lastAnswer = match.answer;
    } else {
      //console.log(`⏭️ Same answer detected again — skipped.`);
    }
  } else {
    //console.log("❌ No match found in this frame.");
  }
}

// ⏱️ Auto-scan loop
function startAutoScan() {
  setInterval(scanFrame, 2000); // every 5 seconds
}

// 🔊 Speak the answer aloud
function speak(text) {
  if (!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";          // language/accent
  utter.rate = 1;                // speed (0.5–2)
  utter.pitch = 1;               // voice pitch
  speechSynthesis.cancel();      // stop any previous speech
  speechSynthesis.speak(utter);
}

// 🚀 Initialize everything
(async function init() {
  loadData();       // load from localStorage
  await startCamera();
  startAutoScan();
})();
