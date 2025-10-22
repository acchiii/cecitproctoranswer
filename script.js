

const xxx = "https://script.google.com/macros/s/AKfycbxw4dITKgZHApGwPWdciAWvMMofoT6-jwyqwQK-GPZLQxS23jQxEyWhGk53_58LHKcWIQ/exec";
let code = localStorage.getItem('code'); //IAS730Final
let a = dsd('P2FjdGlvbj1nZXRBbGxRdWVzdGlvbnNBbmRBbnN3ZXJzJmNvZGU9'); //?action=getAllQuestionsAndAnswers&code=
const result = document.getElementById('result');



async function getExamData(code, result) {
 
  const xx = `${xxx}${a}${encodeURIComponent(code.toUpperCase())}`;
  
  try {
    const res = await fetch(xx);

    if (res.ok) {
      try {
         result.innerHTML += `<b style="color: orange;">...</b><br>`;
        
        const data = await res.json();

        localStorage.setItem('data', JSON.stringify(data));
        
             if (data && Array.isArray(data.questions)) {
         decode(data);
      } else {
        result.innerHTML += `<b style="color: orange;">No questions found or invalid format.</b><br>`;
        
        result.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      }


      } catch (err) {
        result.innerHTML += `\n<b style="color: red;">JSON parse error: ${err.message}</b><br>`;
      }
    } else {
      result.innerHTML += `\n<b style="color: red;">Network response was not ok!</b><br>`;
    }
  } catch (error) {
    result.innerHTML += `\n<b style="color: red;">Fetch failed: ${error.message}</b><br>`;
  }
}
function decode(data) {
 data.questions.forEach((q, index) => {

    let qq = `<span style="color: green;"><b>${index + 1}. ${q.question}</b></span><br>`;
    let a = `<span style="color: red;"><span style="color: blue;">Answer:</span> <i>${q.answer}</i></span><br><br><br>`;
    result.innerHTML += qq + a;
 });

}
function dsd(a) {
 
  a = a.replace(/[\s\u200B-\u200D\uFEFF]+/g, '');
  try {
    return atob(a).trim();
  } catch (e) {
    console.error("Invalid Base64 string:", e);
    return "";
  }
}






 result.innerHTML += `<b style="color: orange;">Fetching Data of CODE: ${code}</b><br>`;
        
getExamData(code, result);

