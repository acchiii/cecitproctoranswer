const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');


const ctx = canvas.getContext('2d');

let questionsData = [];
let lastAnswer = null;
let interv;


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

    video.play();
  //startScan()


  } catch (err) {
    //console.error("Camera access denied:", err);
  }
}


async function scanFrame() {
 
      
  if(document.getElementById('cdat').style.display == 'none') return;
//console.log('scanning')   

  if (!questionsData.length) {
    console.warn("No question data loaded");
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
      output.innerHTML = `<br><span style="color:red; font-weight: bold;">Answer:  ${match.answer == '-' ? 'false' : match.answer}</span><br>` 
      + `<span style="color:blue; ">Detected Question:</span> ${match.question}` ;
      lastAnswer = `${match.answer == '-' ? 'false' : match.answer}`;

       speak(`${match.answer == '-' ? 'false' : match.answer}`)
    } else {
      //console.log(` Skipped kay same answer.`);
    }
  } else {
    //console.log("No match"); yellow
  }
}


function startScan() {
 interv = setInterval(scanFrame, 2000);
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
  

  document.body.addEventListener('keydown', (event) =>{
    if(event.key == 'Enter' || event.key == 'Space'){
      scanFrame();
    }
  });

  document.body.addEventListener('click', function(){
    scanFrame();
  })
  
})();




const se = document.getElementById('search');

se.addEventListener('input', ()=>{
  let sd = se.value;
  if(!(sd.length>2 ) || !sd.includes(' '))  return;
   const mm = questionsData.find(qq => {
  const questionText = (qq.question || '').toLowerCase();
  return questionText.includes(sd.toLowerCase());
});

  if (mm) {
    if (lastAnswer !== mm.answer) {
      output.innerHTML = `<br><span style="color:red; font-weight: bold;">Answer: ${mm.answer == '-' ? 'false' : mm.answer}</span><br>` 
      + `<span style="color:blue; ">Detected Question:</span> ${mm.question}` ;
      if(se.value.length > 0){ speak( `${mm.answer == '-' ? 'false' : mm.answer}`)}else {output.innerHTML = "Answer shows here...<br>(If you will use camera, focus the cam and touch the screen to answer)"}
      lastAnswer = `${mm.answer == '-' ? 'false' : mm.answer}`;

    }
  }
})




document.getElementById('openCameraBtn').addEventListener('click', ()=>{
  if(document.getElementById('cdat').style.display != 'none'){
    document.getElementById('cdat').style.display = 'none';
     if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
    clearInterval(interv);
   
    
  } else {
     document.getElementById('cdat').style.display = 'flex';
     startCamera();
  }

})