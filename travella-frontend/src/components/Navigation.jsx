import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleProfileClick = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand" onClick={() => navigate('/')}>
        Travella✈️🧳
      </div>
      <div className="nav-actions">
        {currentUser ? (
          <div className="user-profile" onClick={handleProfileClick}>
            <div className="user-icon">
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            <span className="user-email">{currentUser.email}</span>
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navigation; 