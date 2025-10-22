const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');


const ctx = canvas.getContext('2d');

let questionsData = [];
let lastAnswer = null;



function loadData() {
  try {
    const raw = localStorage.getItem('data');
    if (!raw) {
      output.innerHTML = `<pre style="color:red;">⚠️ No JSON found in localStorage.</pre><br>`  + output.innerHTML;
      return;
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed.questions)) {
      questionsData = parsed.questions;
      //console.log(`Loaded ${questionsData.length} questions`);
    } else {
      output.innerHTML = `<pre style="color:red;">⚠️ Invalid data format: ${JSON.stringify(parsed, null, 2)}</pre> <br> ` + output.innerHTML;
    }
  } catch (err) {
    output.innerHTML = `<pre style="color:red;">JSON parse error:\n${err}</pre> <br>`  + output.innerHTML;
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
    //console.error("Camera access denied:", err);
  }
}


async function scanFrame() {
 
 
  loadData();

  if (!questionsData.length) {
    //console.warn("No question data loaded");
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
      //console.log(`Detected Question: ${match.code}`);
      //console.log(`Answer: ${match.answer}`);
      output.innerHTML = `<br><span style="color:red; font-weight: bold;">Answer: ${match.answer}</span><br>` 
      + `<span style="color:yellow; ">Detected Question:</span> ${match.question}` ;
      lastAnswer = match.answer;

       speak(match.answer)
    } else {
      //console.log(` Skipped kay same answer.`);
    }
  } else {
    //console.log("No match");
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
