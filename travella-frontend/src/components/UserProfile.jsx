import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/UserProfile.css';

function getDisplayName(email) {
  if (!email) return '';
  return email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function UserProfile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userSchedules, setUserSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserSchedules = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/schedules/${currentUser.uid}`);
        setUserSchedules(response.data);
      } catch (err) {
        setError('Failed to fetch user schedules');
        console.error('Error fetching schedules:', err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchUserSchedules();
    }
  }, [currentUser]);

  const handleDownloadPDF = (schedule) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Travel Schedule for ${schedule.city}`, 14, 18);
    doc.setFontSize(12);
    doc.text(`Budget: ${schedule.convertedBudget || schedule.budgetAmount} ${schedule.localCurrency?.code || 'SAR'}`, 14, 28);
    doc.text(`Dates: ${new Date(schedule.startDate).toLocaleDateString()} - ${new Date(schedule.endDate).toLocaleDateString()}`, 14, 36);
    doc.text(`Activities: ${schedule.selectedActivities?.join(', ')}`, 14, 44);
    // If schedule.schedule exists, print it as a table
    if (schedule.schedule && Array.isArray(schedule.schedule)) {
      schedule.schedule.forEach((day, dayIndex) => {
        doc.text(`Day ${dayIndex + 1}`, 14, 54 + dayIndex * 40);
        const rows = ['morning', 'afternoon', 'evening'].map(timeOfDay => [
          timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1),
          day[timeOfDay] || ''
        ]);
        autoTable(doc, {
          head: [["Time", "Activity"]],
          body: rows,
          startY: 58 + dayIndex * 40,
          theme: "grid"
        });
      });
    }
    doc.save(`Travel_Schedule_${schedule.city}.pdf`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  const displayName = getDisplayName(currentUser.email);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-details">
          <h1>{displayName}</h1>
          <p className="profile-email"><strong>Email:</strong> {currentUser.email}</p>
          <p className="profile-id"><strong>User ID:</strong> {currentUser.uid}</p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <hr className="profile-divider" />
      <div className="profile-info">
        <div className="schedules-section">
          <h2>Your Travel Schedules</h2>
          {loading ? (
            <p>Loading schedules...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : userSchedules.length === 0 ? (
            <p>No schedules found. Start planning your next trip!</p>
          ) : (
            <div className="schedules-list">
              {userSchedules.map((schedule, index) => (
                <div key={index} className="schedule-card">
                  <div className="schedule-card-header">
                    <h3>{schedule.city}</h3>
                    <button className="download-schedule-btn" onClick={() => handleDownloadPDF(schedule)}>
                      Download PDF
                    </button>
                  </div>
                  <p><strong>Dates:</strong> {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}</p>
                  <p><strong>Budget:</strong> {schedule.convertedBudget || schedule.budgetAmount} {schedule.localCurrency?.code || 'SAR'}</p>
                  <p><strong>Activities:</strong> {schedule.selectedActivities?.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 