import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import PassengerDashboard from './components/PassengerDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Renderizar dashboard baseado no papel do usuário
  switch (user.role) {
    case 'passenger':
      return <PassengerDashboard user={user} onLogout={handleLogout} />;
    case 'driver':
      return <DriverDashboard user={user} onLogout={handleLogout} />;
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    default:
      return <LoginScreen onLogin={handleLogin} />;
  }
}

export default App;

