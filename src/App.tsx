import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');
  const [userName, setUserName] = useState('Joe Doe');

  const navigateToRegister = () => {
    setCurrentPage('register');
  };

  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  const navigateToDashboard = (name: string) => {
    setUserName(name);
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage 
          onNavigateToRegister={navigateToRegister}
          onLogin={navigateToDashboard}
        />
      )}
      {currentPage === 'register' && (
        <RegisterPage 
          onNavigateToLogin={navigateToLogin}
          onRegister={navigateToDashboard}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard userName={userName} />
      )}
    </>
  );
}

export default App;