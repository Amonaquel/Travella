import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./App.css";
import "./styles/Schedule.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function Schedule() {
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState([]);

  const { 
    city, 
    startDate, 
    endDate, 
    convertedBudget,
    selectedActivities,
    localCurrency
  } = useMemo(() => ({
    city: state?.city || "",
    startDate: state?.startDate || "",
    endDate: state?.endDate || "",
    convertedBudget: state?.convertedBudget || "",
    selectedActivities: state?.selectedActivities || [],
    localCurrency: state?.localCurrency || { currency: "SAR", code: "SAR" }
  }), [state]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 1;
    return Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  // Fetch activities with prices
  useEffect(() => {
    const fetchActivities = async () => {
      if (!city || selectedActivities.length === 0) return;

      try {
        setLoading(true);
        const response = await axios.post('http://localhost:5000/api/get-activities', {
          city,
          activities: selectedActivities,
          days
        });

        if (response.data.activities) {
          setActivities(response.data.activities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [city, selectedActivities, days]);

  // Initialize schedule
  useEffect(() => {
    if (state) {
      const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
      setSchedule(
        [...Array(days)].map(() => ({
          morning: "",
          afternoon: "",
          evening: ""
        }))
      );
    }
  }, [state, startDate, endDate]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    if (source.droppableId === "activityList" && destination.droppableId.includes("-")) {
      try {
        const draggedActivity = activities[source.index];
        const [dayIndex, timeOfDay] = destination.droppableId.split("-");
        
        const newSchedule = [...schedule];
        if (newSchedule[dayIndex]) {
          const existingActivity = newSchedule[dayIndex][timeOfDay];
          newSchedule[dayIndex][timeOfDay] = draggedActivity;
          setSchedule(newSchedule);
          
          const newActivities = [...activities];
          newActivities.splice(source.index, 1);
          
          if (existingActivity) {
            newActivities.push(existingActivity);
          }
          
          setActivities(newActivities);
        }
      } catch (error) {
        console.error("Error handling drag:", error);
      }
    }
  };

  if (!state) {
    return (
      <div className="app-container block-box">
        <h2 className="app-title">No trip data found</h2>
        <p>Please go back and fill out the form to create a schedule.</p>
        <button 
          className="button-style back-button" 
          onClick={() => navigate("/")}
        >
          ⬅️ Back to Form
        </button>
      </div>
    );
  }

  return (
    <div className="app-background">
      <div className="app-container">
        <button className="back-button" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
        
        <div className="schedule-header">
          <h2>Your Travel Schedule for {city}</h2>
          <p>Plan your activities for each day of your trip</p>
        </div>
        
        <div className="budget-info">
          Budget: <strong>{convertedBudget} {localCurrency.code}</strong> | 
          Dates: <strong>{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</strong>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="schedule-container">
            <div className="schedule-section">
              <h3>Available Activities</h3>
              <Droppable droppableId="activityList">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="activity-list"
                  >
                    {loading ? (
                      <div className="loading-activities">Loading activities...</div>
                    ) : activities.length === 0 ? (
                      <div className="no-activities">No activities available</div>
                    ) : (
                      activities.map((activity, index) => (
                        <Draggable
                          key={activity.name}
                          draggableId={activity.name}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="schedule-item"
                            >
                              <div className="activity-name">{activity.name}</div>
                              <div className="activity-price">
                                {activity.price} {activity.currency}
                              </div>
                              <div className="activity-category">{activity.category}</div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="schedule-section">
              <h3>Your Schedule</h3>
              {schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="day-schedule">
                  <h4>Day {dayIndex + 1}</h4>
                  {['morning', 'afternoon', 'evening'].map((timeOfDay) => (
                    <Droppable
                      key={`${dayIndex}-${timeOfDay}`}
                      droppableId={`${dayIndex}-${timeOfDay}`}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="schedule-cell"
                        >
                          <div className="time-label">{timeOfDay}</div>
                          {day[timeOfDay] && (
                            <div className="schedule-item">
                              <div className="activity-name">{day[timeOfDay].name}</div>
                              <div className="activity-price">
                                {day[timeOfDay].price} {day[timeOfDay].currency}
                              </div>
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Schedule;