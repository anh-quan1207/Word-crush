import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import ChatBox from '../components/ChatBox';
import PlayersList from '../components/PlayersList';
import ThemeToggleButton from '../components/ThemeToggleButton';

interface Player {
  id: string;
  name: string;
  loseCount: number;
  isBackToRoom?: boolean;
}

interface RoomParams {
  roomId: string;
}

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

function RoomPage() {
  const { roomId } = useParams();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomHostId, setRoomHostId] = useState('');
  const [gameMessage, setGameMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
      navigate('/');
      return;
    }

    socket.emit('join-room', { roomId, playerName }, (response: any) => {
      setLoading(false);
      if (!response.success) {
        setError(response.message || 'Không thể tham gia phòng');
        return;
      }

      if (response.room) {
        const uniquePlayersMap = new Map();
        response.room.players.forEach((player: any) => {
          uniquePlayersMap.set(player.id, player);
        });
        setPlayers(Array.from(uniquePlayersMap.values()));
        setMessages(response.room.messages);
        
        if (response.room.hostId) {
          setRoomHostId(response.room.hostId);
        }
        
        if (response.isHost !== undefined) {
          setIsHost(response.isHost);
        } else if (response.room.hostId && socket.id === response.room.hostId) {
          setIsHost(true);
        }
        
        console.log('Tham gia phòng:', { 
          socketId: socket.id, 
          hostId: response.room.hostId,
          isHost: response.isHost || (response.room.hostId && socket.id === response.room.hostId)
        });
      }
    });

    socket.on('players-update', (updatedPlayers: any) => {
      const uniquePlayersMap = new Map();
      updatedPlayers.forEach(player => {
        uniquePlayersMap.set(player.id, player);
      });
      setPlayers(Array.from(uniquePlayersMap.values()));
    });

    socket.on('new-message', (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('messages-update', (updatedMessages: any) => {
      setMessages(updatedMessages);
    });

    socket.on('game-started', () => {
      navigate(`/game/${roomId}`);
    });

    socket.on('error-message', (data: any) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('host-changed', (data: any) => {
      setRoomHostId(data.newHostId);
      
      if (data.newHostId === socket.id) {
        setIsHost(true);
      }
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 5000);
    });

    socket.on('player-left', (data: any) => {
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 5000);
    });

    socket.on('all-players-back', (data: any) => {
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 5000);
    });

    socket.on('player-back-notification', (data: any) => {
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 3000);
    });

    return () => {
      socket.off('players-update');
      socket.off('new-message');
      socket.off('messages-update');
      socket.off('game-started');
      socket.off('error-message');
      socket.off('host-changed');
      socket.off('player-left');
      socket.off('all-players-back');
      socket.off('player-back-notification');
    };
  }, [socket, roomId, navigate]);

  const startGame = () => {
    if (players.length < 2) {
      setError('Cần ít nhất 2 người chơi để bắt đầu');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    socket?.emit('start-game', { roomId });
  };

  const sendMessage = (text: string) => {
    socket?.emit('send-message', {
      roomId,
      message: text
    });
  };

  const copyRoomId = () => {
    if (!roomId) return;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(roomId)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(err => {
            console.error('Không thể sao chép: ', err);
            copyToClipboardFallback(roomId);
          });
      } else {
        copyToClipboardFallback(roomId);
      }
    } catch (err) {
      console.error('Lỗi khi sao chép: ', err);
      alert(`Không thể tự động sao chép. Vui lòng sao chép mã phòng thủ công: ${roomId}`);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert(`Không thể tự động sao chép. Vui lòng sao chép mã phòng thủ công: ${roomId}`);
      }
    } catch (err) {
      console.error('Lỗi khi sử dụng phương án dự phòng: ', err);
      alert(`Không thể tự động sao chép. Vui lòng sao chép mã phòng thủ công: ${roomId}`);
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', { roomId });
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Xác định màu sắc dựa trên theme
  const containerClass = 'bg-white';
  const headerClass = 'text-purple-700';

  return (
    <div className={`${containerClass} rounded-xl shadow-md overflow-hidden`}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {gameMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 m-4 rounded relative">
          <span className="block sm:inline">{gameMessage}</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold ${headerClass}`}>Phòng chờ</h1>
            <ThemeToggleButton className="ml-3" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg flex items-center">
              <span className="text-gray-600 mr-2">Mã phòng:</span>
              <span className="font-mono font-bold text-lg">{roomId}</span>
              <button 
                className="ml-2 p-1 text-gray-500 hover:text-indigo-600" 
                onClick={copyRoomId}
                title="Sao chép mã phòng"
              >
                {copied ? '✓' : 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>}
              </button>
            </div>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={leaveRoom}
            >
              Thoát phòng
            </button>
            {isHost && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-300"
                onClick={startGame}
                disabled={players.length < 2}
              >
                Bắt đầu
              </button>
            )}
            {!isHost && players.length < 2 && (
              <div className="text-amber-600 font-medium">
                Chờ thêm người chơi...
              </div>
            )}
            {!isHost && players.length >= 2 && (
              <div className="text-amber-600 font-medium">
                Chờ chủ phòng bắt đầu...
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PlayersList players={players} hostId={roomHostId} />
          </div>
          <div className="md:col-span-2">
            <ChatBox messages={messages} onSendMessage={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomPage; 