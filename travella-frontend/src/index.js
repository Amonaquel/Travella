import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Schedule from './Schedule'; // ⬅️ Import the new component
import reportWebVitals from './reportWebVitals';

import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ⬅️ Import React Router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/schedule" element={<Schedule />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// Optional: Performance logging
reportWebVitals();
