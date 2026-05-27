fetch("https://schemesetu-nu.vercel.app/api/gemini/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userInput: "What is PM Kisan?",
    history: [],
    language: "en"
  })
})
  .then(r => {
    console.log("Status:", r.status);
    return r.text();
  })
  .then(d => console.log("RESPONSE:", d.substring(0, 800)))
  .catch(e => console.error("ERROR:", e.message));
