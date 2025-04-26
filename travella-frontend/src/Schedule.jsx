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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const setupActivities = () => {
      try {
        setLoading(true);
        const sampleActivities = {
          'Museums': [
            'National Museum',
            'Art Gallery',
            'Science Museum',
            'History Museum',
            'Modern Art Museum'
          ],
          'Historical Sites': [
            'Ancient Castle',
            'Old Town Square',
            'Historic Cathedral',
            'Ancient Palace',
            'Historic Market'
          ],
          'Parks': [
            'Central Park',
            'Botanical Gardens',
            'Riverside Park',
            'City Park',
            'Nature Reserve'
          ],
          'Shopping': [
            'City Mall',
            'Traditional Market',
            'Shopping Street',
            'Outlet Mall',
            'Artisan Market'
          ],
          'Beaches': [
            'Main Beach',
            'Sunset Beach',
            'Palm Beach',
            'Golden Beach',
            'Crystal Bay'
          ],
          'Food & Restaurants': [
            'Local Food Market',
            'Traditional Restaurant',
            'Food Street',
            'Fine Dining Restaurant',
            'Street Food Market'
          ],
          'Cultural Events': [
            'Local Theater',
            'Music Hall',
            'Cultural Center',
            'Opera House',
            'Arts Festival'
          ],
          'Adventure Sports': [
            'Water Sports Center',
            'Hiking Trail',
            'Adventure Park',
            'Rock Climbing Center',
            'Mountain Biking Trail'
          ]
        };

        // Calculate minimum required activities (3 per day)
        const daysCount = schedule.length;
        const minActivities = daysCount * 3;

        // Generate activities based on selected categories
        let cityActivities = selectedActivities.flatMap(category => 
          sampleActivities[category]?.map(activity => `${activity} in ${city}`) || []
        );

        // If we don't have enough activities, add more from other categories
        if (cityActivities.length < minActivities) {
          const allCategories = Object.keys(sampleActivities);
          let currentIndex = 0;

          while (cityActivities.length < minActivities && currentIndex < allCategories.length) {
            const category = allCategories[currentIndex];
            if (!selectedActivities.includes(category)) {
              const additionalActivities = sampleActivities[category].map(
                activity => `${activity} in ${city}`
              );
              cityActivities = [...cityActivities, ...additionalActivities];
            }
            currentIndex++;
          }
        }

        // Ensure we have at least the minimum number of activities
        setActivities(cityActivities.slice(0, Math.max(minActivities + 3, cityActivities.length)));
      } catch (error) {
        console.error("Error setting up activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    setupActivities();
  }, [city, selectedActivities, schedule.length]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Drop outside any droppable
    if (!destination) return;

    // Same position drop
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Moving from activities list to schedule
    if (source.droppableId === "activityList") {
      const activity = activities[source.index];
      const [dayIndex, timeOfDay] = destination.droppableId.split('-');
      
      const newSchedule = [...schedule];
      newSchedule[parseInt(dayIndex)][timeOfDay] = activity;
      setSchedule(newSchedule);

      const newActivities = [...activities];
      newActivities.splice(source.index, 1);
      setActivities(newActivities);
    }
  };

  return (
    <div className="app-container block-box">
      <h2 className="app-title">
        Custom Schedule for <span>{city}</span> 📅
      </h2>

      <button
        className="button-style back-button"
        onClick={() => navigate("/")}
      >
        ⬅️ Back to Form
      </button>

      <p className="budget-info">
        Trip Dates: <strong>{startDate}</strong> → <strong>{endDate}</strong> | Budget: <strong>{budgetAmount} SAR</strong>
        {convertedBudget && currencyCode && (
          <> | ≈ <strong>{convertedBudget} {currencyCode}</strong></>
        )}
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="schedule-section">
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
              {schedule.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="day-label">Day {dayIndex + 1}</td>
                  {["morning", "afternoon", "evening"].map((timeOfDay) => (
                    <td key={timeOfDay}>
                      <Droppable droppableId={`${dayIndex}-${timeOfDay}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`schedule-cell ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          >
                            {day[timeOfDay] && (
                              <div className="schedule-item">
                                {day[timeOfDay]}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="activities-section">
          <h3 className="activity-header">🎯 Available Activities in {city}</h3>
          <Droppable droppableId="activityList">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="activity-list"
              >
                {loading ? (
                  <li className="loading-activities">Loading activities...</li>
                ) : activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <Draggable
                      key={`activity-${index}`}
                      draggableId={`activity-${index}`}
                      index={index}
                    >
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
                  ))
                ) : (
                  <li className="no-activities">
                    No activities found for {city}. Try different categories.
                  </li>
                )}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}

export default Schedule;