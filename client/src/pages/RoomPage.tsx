import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import ChatBox from '../components/ChatBox';
import PlayersList from '../components/PlayersList';

interface Player {
  id: string;
  name: string;
  loseCount: number;
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
  const { roomId } = useParams<keyof RoomParams>();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameMessage, setGameMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
      navigate('/');
      return;
    }

    socket.emit('join-room', { roomId, playerName }, (response: { success: boolean; message?: string; room?: any; isHost?: boolean }) => {
      setLoading(false);
      if (!response.success) {
        setError(response.message || 'Không thể tham gia phòng');
        return;
      }

      if (response.room) {
        const uniquePlayersMap = new Map<string, Player>();
        response.room.players.forEach((player: Player) => {
          uniquePlayersMap.set(player.id, player);
        });
        setPlayers(Array.from(uniquePlayersMap.values()));
        setMessages(response.room.messages);
        
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

    socket.on('players-update', (updatedPlayers: Player[]) => {
      const uniquePlayersMap = new Map<string, Player>();
      updatedPlayers.forEach(player => {
        uniquePlayersMap.set(player.id, player);
      });
      setPlayers(Array.from(uniquePlayersMap.values()));
    });

    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('messages-update', (updatedMessages: Message[]) => {
      setMessages(updatedMessages);
    });

    socket.on('game-started', () => {
      navigate(`/game/${roomId}`);
    });

    socket.on('error-message', (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('host-changed', (data: { newHostId: string, newHostName: string, message: string }) => {
      if (data.newHostId === socket.id) {
        setIsHost(true);
      }
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 5000);
    });

    socket.on('player-left', (data: { playerId: string, playerName: string, message: string }) => {
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 5000);
    });

    socket.on('all-players-back', (data: { message: string }) => {
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(''), 5000);
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
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/')}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
          <h1 className="text-3xl font-bold text-purple-700 mb-4 md:mb-0">Phòng chờ</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg flex items-center">
              <span className="text-gray-600 mr-2">Mã phòng:</span>
              <span className="font-mono font-bold text-lg">{roomId}</span>
              <button 
                className="ml-2 p-1 text-gray-500 hover:text-indigo-600" 
                onClick={copyRoomId}
                title="Sao chép mã phòng"
              >
                {copied ? 'Đã sao chép!' : '📋'}
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
            <PlayersList players={players} hostId={isHost ? socket?.id : undefined} />
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