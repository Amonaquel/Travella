import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [city, setCity] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);

  const navigate = useNavigate();

  const activities = [
    "Museums",
    "Parks",
    "Shopping",
    "Historical Sites",
    "Beaches",
    "Food & Restaurants",
    "Adventure Sports",
    "Cultural Events",
  ];

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const generatePlan = () => {
    if (!city) return alert("Please enter a city.");
    if (selectedActivities.length === 0)
      return alert("Please select at least one activity.");
    if (!budgetAmount || parseFloat(budgetAmount) <= 0)
      return alert("Please enter a valid budget in SAR.");
    if (!startDate || !endDate) return alert("Please select your travel dates.");
    if (new Date(endDate) < new Date(startDate))
      return alert("End date must be after start date.");

    const tripDays = Math.max(
      1,
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      )
    );

    navigate("/schedule", {
      state: {
        city,
        startDate,
        endDate,
        budgetAmount,
        selectedActivities,
        tripDays,
      },
    });
  };

  return (
    <div className="app-background">
      <div className="app-container block-box">
        <h1 className="app-title">Travella✈️🧳</h1>

        <label>City:</label>
        <input
          type="text"
          placeholder="e.g., Tokyo"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-style"
        />

        <div className="form-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-style"
          />
        </div>

        <div className="form-group">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-style"
          />
        </div>

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

        <label>Budget (in SAR):</label>
        <input
          type="number"
          placeholder="e.g., 3000"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          className="input-style"
        />

        <button onClick={generatePlan} className="button-style">
          Continue to Schedule
        </button>
      </div>
    </div>
  );
}

export default App;
