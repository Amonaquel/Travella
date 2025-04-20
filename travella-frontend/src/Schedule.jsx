import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function Schedule() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { city, startDate, endDate, budgetAmount, selectedActivities } = state;

  const [convertedBudget, setConvertedBudget] = useState(null);
  const [currencyCode, setCurrencyCode] = useState(null);
  const [activities, setActivities] = useState(selectedActivities);
  const [schedule, setSchedule] = useState(
    [...Array(Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))))].map(() => ({
      morning: "",
      afternoon: "",
      evening: ""
    }))
  );

  const tripDays = schedule.length;

  useEffect(() => {
    const fetchCurrencyAndConvert = async () => {
      try {
        const countryRes = await axios.get(
          `https://restcountries.com/v3.1/capital/${city}`
        );
        const country = countryRes.data[0];
        const localCurrency = Object.keys(country.currencies)[0];
        setCurrencyCode(localCurrency);

        const currencyRes = await axios.get(
          `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=abc7d14c5c7a4b74932591950a82b711`
        );

        const sarRate = currencyRes.data.rates["SAR"];
        const targetRate = currencyRes.data.rates[localCurrency];
        const rate = parseFloat(targetRate) / parseFloat(sarRate);
        setConvertedBudget((budgetAmount * rate).toFixed(2));
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setConvertedBudget(null);
        setCurrencyCode(null);
      }
    };

    fetchCurrencyAndConvert();
  }, [city, budgetAmount]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newActivities = Array.from(activities);
    const [moved] = newActivities.splice(result.source.index, 1);
    newActivities.splice(result.destination.index, 0, moved);
    setActivities(newActivities);
  };

  return (
    <div className="app-container block-box">
      <h2 className="app-title">📅 Custom Schedule for {city}</h2>

      <button
        className="button-style back-button"
        onClick={() => navigate("/")}
      >
        ⬅️ Back to Form
      </button>

      <p className="budget-info">
        Trip Dates: {startDate} → {endDate} | Budget: {budgetAmount} SAR
        {convertedBudget && currencyCode && (
          <> | ≈ {convertedBudget} {currencyCode}</>
        )}
      </p>

      <h3>📝 Day Planner</h3>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Morning</th>
            <th>Afternoon</th>
            <th>Evening</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((_, index) => (
            <tr key={index}>
              <td className="day-label">Day {index + 1}</td>
              <td><input className="input-style" type="text" placeholder="Morning..." /></td>
              <td><input className="input-style" type="text" placeholder="Afternoon..." /></td>
              <td><input className="input-style" type="text" placeholder="Evening..." /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="activity-header">🎯 Drag & Drop Suggested Activities</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="activities">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="activity-list"
            >
              {activities.map((activity, index) => (
                <Draggable key={activity} draggableId={activity} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="draggable-item"
                    >
                      {activity}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Schedule;