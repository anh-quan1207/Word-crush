import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Timer from '../components/Timer';
import WordChain from '../components/WordChain';
import PlayersList from '../components/PlayersList';
import WordInput from '../components/WordInput';

interface Player {
  id: string;
  name: string;
  loseCount: number;
}

interface GameParams {
  roomId: string;
}

interface ReportVote {
  playerId: string;
  vote: boolean;
}

interface WordHistory {
  word: string;
  playerId: string;
}

function GamePage() {
  const { roomId } = useParams<keyof GameParams>();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [inputWord, setInputWord] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [lastPlayerId, setLastPlayerId] = useState('');
  const [losers, setLosers] = useState<string[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [rankings, setRankings] = useState<Player[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState<ReportVote[]>([]);
  const [gameMessage, setGameMessage] = useState('');
  const [error, setError] = useState('');
  const [wordHistory, setWordHistory] = useState<WordHistory[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const myPlayerId = socket?.id;

  useEffect(() => {
    if (!socket) return;

    socket.emit('check-player-in-room', { roomId }, (response: { success: boolean; message?: string }) => {
      if (!response.success) {
        navigate(`/room/${roomId}`);
      }
    });

    socket.emit('get-room-info', { roomId }, (response: { success: boolean; players?: Player[]; currentPlayerId?: string }) => {
      if (response.success && response.players) {
        setPlayers(response.players);
        if (response.currentPlayerId) {
          setCurrentPlayerId(response.currentPlayerId);
          setIsMyTurn(response.currentPlayerId === socket.id);
        }
      }
    });

    socket.on('game-started', (data: { currentPlayerId: string }) => {
      console.log('Game đã bắt đầu với người chơi đầu tiên:', data.currentPlayerId);
      setGameMessage('Trò chơi đã bắt đầu!');
    });

    socket.on('players-update', (updatedPlayers: Player[]) => {
      const uniquePlayersMap = new Map<string, Player>();
      updatedPlayers.forEach(player => {
        uniquePlayersMap.set(player.id, player);
      });
      setPlayers(Array.from(uniquePlayersMap.values()));
    });

    socket.on('next-player', (data: { currentPlayerId: string, timeRemaining: number }) => {
      console.log('Người chơi tiếp theo:', data.currentPlayerId);
      setCurrentPlayerId(data.currentPlayerId);
      setIsMyTurn(data.currentPlayerId === socket.id);
      setInputWord('');
      setTimeRemaining(data.timeRemaining);
      
      const currentPlayer = players.find(p => p.id === data.currentPlayerId);
      if (currentPlayer) {
        if (data.currentPlayerId === socket.id) {
          setGameMessage('Đến lượt của bạn!');
        } else {
          setGameMessage(`Đến lượt của ${currentPlayer.name}`);
        }
      }
    });
    
    socket.on('timer-update', (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('word-update', (data: { word: string; playerId: string }) => {
      setWordHistory(prev => [...prev, { word: data.word, playerId: data.playerId }]);
      
      setCurrentWord(data.word);
      setLastPlayerId(data.playerId);
      console.log(`Word updated: ${data.word} by player ${data.playerId}`);
    });

    socket.on('player-lost', (data: { playerId: string; reason: string; losers: string[] }) => {
      setLosers(data.losers);
      
      const player = players.find(p => p.id === data.playerId);
      if (player) {
        setGameMessage(`${player.name} đã thua: ${data.reason}`);
        
        setTimeout(() => setGameMessage(''), 3000);
      }
    });

    socket.on('game-ended', (data: { losers: string[]; rankings: Player[] }) => {
      setGameEnded(true);
      setRankings(data.rankings);
    });

    socket.on('error-message', (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('report-started', (data: { reports: ReportVote[]; word: string }) => {
      console.log("Received report-started event", data);
      setShowReportModal(true);
      setReports(data.reports);
      
      const reporter = players.find(p => p.id === data.reports[0]?.playerId);
      if (reporter) {
        setGameMessage(`${reporter.name} đã báo cáo từ "${data.word}"`);
      }
    });

    socket.on('report-update', (data: { reports: ReportVote[]; word: string }) => {
      setReports(data.reports);
    });

    socket.on('report-finished', (data: { accepted: boolean }) => {
      setShowReportModal(false);
      setReports([]);
      setGameMessage('');
    });

    return () => {
      socket.off('players-update');
      socket.off('next-player');
      socket.off('word-update');
      socket.off('player-lost');
      socket.off('game-ended');
      socket.off('report-started');
      socket.off('report-update');
      socket.off('report-finished');
      socket.off('error-message');
      socket.off('game-started');
      socket.off('timer-update');
    };
  }, [socket, roomId, navigate, players]);

  const submitWord = () => {
    if (!inputWord.trim()) return;
    
    if (currentWord) {
      try {
        const previousWords = currentWord.trim().split(/\s+/);
        const lastWordOfPrevious = previousWords[previousWords.length - 1];
        
        const newWords = inputWord.trim().split(/\s+/);
        const firstWordOfNew = newWords[0];
        
        if (firstWordOfNew.toLowerCase() !== lastWordOfPrevious.toLowerCase()) {
          setError(`Từ phải bắt đầu bằng từ "${lastWordOfPrevious}" (từ cuối của "${currentWord}")`);
          setTimeout(() => setError(''), 3000);
          return;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra từ:", error);
      }
    }
    
    socket?.emit('submit-word', { roomId, word: inputWord.trim() });
    setInputWord('');
  };

  const reportWord = () => {
    console.log("Sending report-word event", { roomId });
    socket?.emit('report-word', { roomId });
  };

  const voteReport = (vote: boolean) => {
    socket?.emit('vote-report', { roomId, vote });
  };

  const backToRoom = () => {
    if (socket) {
      socket.emit('player-back-to-room', { roomId });
    }
    navigate(`/room/${roomId}`);
  };

  if (gameEnded) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">Trò chơi kết thúc!</h1>
        
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-purple-800 mb-3">Xếp hạng</h2>
          <div className="space-y-2">
            {rankings.map((player, index) => (
              <div 
                key={player.id} 
                className={`p-3 rounded-lg flex justify-between items-center ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-amber-100' : 'bg-white'}`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-gray-600">{player.loseCount} thua</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition duration-300"
            onClick={backToRoom}
          >
            Quay lại phòng chờ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {gameMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 m-4 rounded relative">
          <span className="block sm:inline">{gameMessage}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-700 mb-4 md:mb-0">Word Crush</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <span className="text-gray-600 mr-2">Mã phòng:</span>
              <span className="font-mono font-bold">{roomId}</span>
            </div>
            {gameEnded && (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                onClick={backToRoom}
              >
                Quay lại phòng chờ
              </button>
            )}
          </div>
        </div>
        
        {gameEnded && (
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <p className="text-purple-700 font-bold text-xl mb-2">Trò chơi kết thúc!</p>
            <p className="text-gray-600">Xem bảng điểm bên trái để biết người chiến thắng.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <PlayersList 
              players={players} 
              currentPlayerId={currentPlayerId} 
              scores={rankings}
              hostId={socket?.id} 
            />
          </div>
          
          <div className="md:col-span-3">
            <div className="mb-6">
              <WordChain words={wordHistory.map(item => item.word)} />
            </div>
            
            {isMyTurn && socket?.id === currentPlayerId && (
              <WordInput 
                onSubmitWord={submitWord} 
                disabled={false} 
                lastWord={wordHistory.length > 0 ? wordHistory[wordHistory.length - 1].word : ''} 
                timeLeft={timeRemaining}
              />
            )}
            
            {socket?.id !== currentPlayerId && (
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-gray-600">Chờ lượt {players.find(p => p.id === currentPlayerId)?.name || 'Người chơi'} đang suy nghĩ...</p>
                <p className="text-gray-500 mt-2">Thời gian còn lại: {timeRemaining} giây</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Báo cáo từ</h2>
            <p className="mb-4">Có người cho rằng từ "{currentWord}" không hợp lệ. Bạn có đồng ý không?</p>
            
            <div className="flex justify-between mb-4">
              <div className="text-sm text-gray-600">
                Đã bỏ phiếu: {reports.length}/{players.length}
              </div>
              <div className="text-sm text-gray-600">
                Đồng ý: {reports.filter(r => r.vote).length}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Danh sách bỏ phiếu:</h3>
              <ul className="text-xs text-gray-600">
                {reports.map(report => {
                  const player = players.find(p => p.id === report.playerId);
                  return (
                    <li key={report.playerId} className="flex justify-between py-1">
                      <span>{player?.name || 'Người chơi'}</span>
                      <span>{report.vote ? '✅ Đồng ý' : '❌ Không đồng ý'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => voteReport(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition duration-300"
              >
                Đồng ý
              </button>
              <button
                onClick={() => voteReport(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-300"
              >
                Không đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePage; 