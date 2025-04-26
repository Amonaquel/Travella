import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyCYDK5ivVIZktTa9FDh-xYUJkK8Fi4HFVw",
    authDomain: "authentication-in-react-60fa1.firebaseapp.com",
    projectId: "authentication-in-react-60fa1",
    storageBucket: "authentication-in-react-60fa1.firebasestorage.app",
    messagingSenderId: "891560639970",
    appId: "1:891560639970:web:05ca401578632e6aeacdbb",
    measurementId: "G-SPWWM33SM9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app); 