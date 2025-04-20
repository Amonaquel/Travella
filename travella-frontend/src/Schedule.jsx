import React from "react";
import { useLocation } from "react-router-dom";
import "./App.css";


function Schedule() {
  const { state } = useLocation();
  const { city, startDate, endDate, budgetAmount, selectedActivities } = state;

  const tripDays = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="app-container block-box">
      <h2 className="app-title">📅 Custom Schedule for {city}</h2>
      <p>
        Trip Dates: {startDate} → {endDate} | Budget: {budgetAmount} SAR
      </p>

      <h3>📝 Day Planner</h3>
      {[...Array(tripDays)].map((_, index) => (
        <div key={index} className="day-block">
          <h4>Day {index + 1}</h4>
          <div className="schedule-row">
            <label>Morning:</label> <input className="input-style" type="text" placeholder="Add morning plan..." />
          </div>
          <div className="schedule-row">
            <label>Afternoon:</label> <input className="input-style" type="text" placeholder="Add afternoon plan..." />
          </div>
          <div className="schedule-row">
            <label>Evening:</label> <input className="input-style" type="text" placeholder="Add evening plan..." />
          </div>
        </div>
      ))}

      <h3>🎯 Suggested Activities</h3>
      <ul>
        {selectedActivities.map((activity, i) => (
          <li key={i}>{activity}</li>
        ))}
      </ul>
    </div>
  );
}

export default Schedule;
