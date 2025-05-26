import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

function HomePage() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tạo phòng mới
  const createRoom = () => {
    if (!playerName.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }

    setLoading(true);
    setError('');

    socket?.emit('create-room', (response: { success: boolean; roomId: string }) => {
      setLoading(false);
      if (response.success) {
        localStorage.setItem('playerName', playerName);
        navigate(`/room/${response.roomId}`);
      } else {
        setError('Có lỗi xảy ra khi tạo phòng');
      }
    });
  };

  // Tham gia phòng hiện có
  const joinRoom = () => {
    if (!playerName.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }

    if (!roomId.trim()) {
      setError('Vui lòng nhập mã phòng');
      return;
    }

    setLoading(true);
    setError('');

    socket?.emit('join-room', { roomId, playerName }, (response: { success: boolean; message?: string }) => {
      setLoading(false);
      if (response.success) {
        localStorage.setItem('playerName', playerName);
        navigate(`/room/${roomId}`);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tham gia phòng');
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">Word Crush</h1>
        <p className="text-gray-600">Game nối từ nhiều người chơi</p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-6">
        <label htmlFor="playerName" className="block text-gray-700 text-sm font-bold mb-2">
          Tên của bạn
        </label>
        <input
          type="text"
          id="playerName"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Nhập tên của bạn"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">Tạo phòng mới</h2>
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            onClick={createRoom}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo phòng'}
          </button>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">Tham gia phòng</h2>
          <div className="mb-4">
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nhập mã phòng"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            />
          </div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            onClick={joinRoom}
            disabled={loading}
          >
            {loading ? 'Đang tham gia...' : 'Tham gia'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 