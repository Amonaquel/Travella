import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import Schedule from "./Schedule";
import "./App.css";

function App() {
  const HomePage = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [city, setCity] = React.useState("");
    const [budgetAmount, setBudgetAmount] = React.useState("");
    const [selectedActivities, setSelectedActivities] = React.useState([]);

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

      return {
        city,
        startDate,
        endDate,
        budgetAmount,
        selectedActivities,
        tripDays,
      };
    };
    
    const handleContinue = () => {
      const planData = generatePlan();
      if (planData) {
        navigate("/schedule", { state: planData });
      }
    };
    
    const handleCityChange = (e) => {
      setCity(e.target.value);
    };
    
    const handleStartDateChange = (e) => {
      setStartDate(e.target.value);
    };
    
    const handleEndDateChange = (e) => {
      setEndDate(e.target.value);
    };
    
    const handleBudgetChange = (e) => {
      setBudgetAmount(e.target.value);
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
            onChange={handleCityChange}
            className="input-style"
          />

          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="input-style"
            />
          </div>

          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
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
            onChange={handleBudgetChange}
            className="input-style"
          />

          <button onClick={handleContinue} className="button-style">
            Continue to Schedule
          </button>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;