import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const AppContent = () => {
  const { theme } = useTheme();
  
  let backgroundClass = '';
  if (theme === 'pink') {
    backgroundClass = 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
  } else {
    backgroundClass = 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700';
  }
  
  return (
    <Router>
      <div className={`min-h-screen ${backgroundClass} flex flex-col relative`}>
        <div className="container mx-auto py-8 px-4 flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/game/:roomId" element={<GamePage />} />
          </Routes>
        </div>
        <div className="py-5 text-center">
          <p className="text-xs text-white">© 2025 Made by PAQ</p>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <SocketProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SocketProvider>
  );
}

export default App; 