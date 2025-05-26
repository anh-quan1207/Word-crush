import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
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
    </SocketProvider>
  );
}

export default App; 