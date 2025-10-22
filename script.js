



const api_url = "https://script.google.com/macros/s/AKfycbxw4dITKgZHApGwPWdciAWvMMofoT6-jwyqwQK-GPZLQxS23jQxEyWhGk53_58LHKcWIQ/exec";
let code = 'IAS730Final';
const result = document.getElementById('result');



async function getExamData(code, result) {
 
  const url = `${api_url}?action=getAllQuestionsAndAnswers&code=${encodeURIComponent(code.toUpperCase())}`;
  
  try {
    const res = await fetch(url);

    if (res.ok) {
      try {
         result.innerHTML += `<b style="color: orange;">...</b><br>`;
        
        const data = await res.json();
        
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
    let a = `<span style="color: red;"><span style="color: yellow;">Answer:</span> <i>${q.answer}</i></span><br><br><br>`;
    result.innerHTML += qq + a;
 });

}



 result.innerHTML += `<b style="color: orange;">Fetching Data of CODE: ${code}</b><br>`;
        
getExamData(code, result);

