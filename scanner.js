const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');
const ctx = canvas.getContext('2d');

let questionsData = localStorage.getItem('data');
let lastAnswer = null; // track last logged answer


// 2️⃣ Start the webcam
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("❌ Camera access denied:", err);
  }
}

// 3️⃣ Scan using OCR every 5 seconds
async function scanFrame() {
  if (!questionsData.length) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const result = await Tesseract.recognize(canvas, 'eng');
  const detectedText = result.data.text.toLowerCase().trim();

  // Find a match
  const match = questionsData.find(q =>
    detectedText.includes(q.question.toLowerCase().slice(0, 20)) // partial match check
  );

  if (match) {
    if (lastAnswer !== match.answer) {
      console.log(`🧠 Question detected: ${match.code}`);
      console.log(`✅ Answer: ${match.answer}`);
      document.getElementById('result').innerHTML = '<span style="color: green;">' + match.answer + '</span>';
      lastAnswer = match.answer;
    } else {
      console.log(`⏭️ Same question detected again, skipping...`);
    }
  } else {
    console.log("❌ No question match found in frame.");
  }
}

// 4️⃣ Start scanning loop
function startAutoScan() {
  setInterval(scanFrame, 5000); // every 5 seconds
}

// 5️⃣ Initialize everything
(async function init() {
  await loadQuestions();
  await startCamera();
  startAutoScan();
})();
