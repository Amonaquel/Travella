import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function Schedule() {
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();

  // All hooks must be called unconditionally
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  // Memoize values from state to prevent unnecessary re-renders
  const { 
    city, 
    startDate, 
    endDate, 
    budgetAmount, 
    selectedActivities 
  } = useMemo(() => ({
    city: state?.city || "",
    startDate: state?.startDate || "",
    endDate: state?.endDate || "",
    budgetAmount: state?.budgetAmount || "",
    selectedActivities: state?.selectedActivities || []
  }), [state]);

  // Handle missing state case
  useEffect(() => {
    if (state) {
      // Initialize schedule from dates
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

  // Memoize the sample activities to prevent recreation on each render
  const sampleActivities = useMemo(() => ({
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
  }), []);

  // Activities setup effect with properly defined dependencies
  useEffect(() => {
    if (!state) return;
    
    const setupActivities = () => {
      try {
        setLoading(true);

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
  }, [state, city, selectedActivities, schedule.length, sampleActivities]);

  // Handle drag end - with activity swapping
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Only handle drags from activity list to schedule
    if (source.droppableId === "activityList" && destination.droppableId.includes("-")) {
      try {
        // Get the activity being dragged
        const draggedActivity = activities[source.index];
        
        // Parse the destination as day-timeOfDay
        const [dayIndex, timeOfDay] = destination.droppableId.split("-");
        
        // Update schedule
        const newSchedule = [...schedule];
        if (newSchedule[dayIndex]) {
          // Store the existing activity if any
          const existingActivity = newSchedule[dayIndex][timeOfDay];
          
          // Replace with new activity
          newSchedule[dayIndex][timeOfDay] = draggedActivity;
          setSchedule(newSchedule);
          
          // Remove dragged activity from the list
          const newActivities = [...activities];
          newActivities.splice(source.index, 1);
          
          // If there was an existing activity, add it back to the activities list
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

  // Render empty UI if no state
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
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
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
                <tr key={`day-${dayIndex}`}>
                  <td className="day-label">Day {dayIndex + 1}</td>
                  {["morning", "afternoon", "evening"].map((timeOfDay) => (
                    <td key={`${dayIndex}-${timeOfDay}-cell`}>
                      <Droppable droppableId={`${dayIndex}-${timeOfDay}`} isDropDisabled={false}>
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
                ref={provided.innerRef}
                {...provided.droppableProps}
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