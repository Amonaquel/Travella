import React, { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const askAI = async () => {
    const res = await axios.post("http://localhost:5000/api/ask", {
      prompt: `Create a 3-day travel itinerary for someone visiting ${prompt}`
    });
    setResponse(res.data.reply);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🧳 AI Travel Planner</h1>
      <input
        type="text"
        placeholder="Enter destination..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={askAI}>Generate Plan</button>
      <pre style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>{response}</pre>
    </div>
  );
}

export default App;