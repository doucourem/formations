// pages/Dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService';

export default function Dashboard() {
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!isAuthenticated()) {
     // navigate('/login');
    }
  }, []);

  return (
    <div>
      <h1>Bienvenue sur votre tableau de bord !</h1>
      <button onClick={() => { logout(); navigate('/login'); }}>Se déconnecter</button>
    </div>
  );
}
