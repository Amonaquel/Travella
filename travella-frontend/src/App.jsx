import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { useNavigate } from "react-router-dom";


function App() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [city, setCity] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [countryCurrency, setCountryCurrency] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const activities = [
    "Museums",
    "Parks",
    "Shopping",
    "Historical Sites",
    "Beaches",
    "Food & Restaurants",
    "Adventure Sports",
    "Cultural Events"
  ];

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const fetchCurrency = async (cityName) => {
    try {
      const countryRes = await axios.get(
        `https://restcountries.com/v3.1/capital/${cityName}`
      );
      const country = countryRes.data[0];
      const currencyCode = Object.keys(country.currencies)[0];
      setCountryCurrency(currencyCode);

      const currencyRes = await axios.get(
        `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=YOUR_CURRENCYFREAKS_KEY`
      );
      const sarRate = currencyRes.data.rates["SAR"];
      const targetRate = currencyRes.data.rates[currencyCode];
      const rate = parseFloat(targetRate) / parseFloat(sarRate);
      setExchangeRate(rate.toFixed(2));
    } catch (error) {
      console.error("Error fetching currency info:", error);
      setCountryCurrency(null);
      setExchangeRate(null);
    }
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
  
    // navigate to /schedule and send data
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
        <h1 className="app-title">🧠 AI Travel Planner</h1>

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

        <button onClick={generatePlan} disabled={loading} className="button-style">
          {loading ? "Generating..." : "Generate Travel Plan"}
        </button>

        {countryCurrency && exchangeRate && (
          <p className="exchange-rate">
            💱 1 SAR ≈ {exchangeRate} {countryCurrency}
          </p>
        )}

        {response && <div className="response-box">{response}</div>}
      </div>
    </div>
  );
}

export default App;
