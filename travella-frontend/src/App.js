import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const activities = [
    "Museums",
    "Parks",
    "Shopping",
    "Historical Sites",
    "Beaches",
    "Food & Restaurants",
    "Adventure Sports"
  ];

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const generatePlan = async () => {
    if (!city) return alert("Please enter a city.");
    if (selectedActivities.length === 0)
      return alert("Please select at least one activity.");

    setLoading(true);
    setResponse("");

    const activityList = selectedActivities.join(", ");
    const prompt = `Create a 3-day travel itinerary for visiting ${city}. The person is interested in: ${activityList}. Include suggestions for morning, afternoon, and evening activities. Make it detailed but easy to follow.`;

    try {
      const res = await axios.post("https://localhost:5000/api/ask", {
        prompt,
      });
      setResponse(res.data.reply);
    } catch (err) {
      console.error(err);
      setResponse("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🧠 AI Travel Planner</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>City:</label>
        <input
          type="text"
          placeholder="e.g., Paris"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-style"
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Preferred Activities:</label>
        <div className="checkbox-grid">
          {activities.map((activity) => (
            <label key={activity} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedActivities.includes(activity)}
                onChange={() => toggleActivity(activity)}
              />
              {activity}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generatePlan}
        disabled={loading}
        className="button-style"
      >
        {loading ? "Generating..." : "Generate Travel Plan"}
      </button>

      {response && (
        <div className="response-box">
          {response}
        </div>
      )}
    </div>
  );
}

export default App;
