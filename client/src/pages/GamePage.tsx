import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Timer from '../components/Timer';

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

interface PlayerOrder {
  id: string;
  name: string;
}

function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [nextPlayerId, setNextPlayerId] = useState<string>('');
  const [nextPlayerName, setNextPlayerName] = useState<string>('');
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
  const [inputWord, setInputWord] = useState<string>('');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [wordHistory, setWordHistory] = useState<WordHistory[]>([]);
  const [lastPlayerId, setLastPlayerId] = useState<string>('');
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [losers, setLosers] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Player[]>([]);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reports, setReports] = useState<ReportVote[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [playerOrder, setPlayerOrder] = useState<PlayerOrder[]>([]);
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

    socket.on('game-started', (data: { currentPlayerId: string, playerOrder: PlayerOrder[] }) => {
      setCurrentPlayerId(data.currentPlayerId);
      setPlayerOrder(data.playerOrder);
      setIsMyTurn(data.currentPlayerId === socket.id);
      setWordHistory([]);
      setCurrentWord('');
      setGameEnded(false);
      setLosers([]);
    });

    socket.on('players-update', (updatedPlayers: Player[]) => {
      const uniquePlayersMap = new Map<string, Player>();
      updatedPlayers.forEach(player => {
        uniquePlayersMap.set(player.id, player);
      });
      setPlayers(Array.from(uniquePlayersMap.values()));
    });

    socket.on('next-player', (data: { 
      currentPlayerId: string, 
      nextPlayerId: string, 
      nextPlayerName: string, 
      timeRemaining: number,
      playerOrder: PlayerOrder[]
    }) => {
      console.log('Người chơi tiếp theo:', data.currentPlayerId);
      setCurrentPlayerId(data.currentPlayerId);
      setNextPlayerId(data.nextPlayerId);
      setNextPlayerName(data.nextPlayerName);
      setPlayerOrder(data.playerOrder);
      setIsMyTurn(data.currentPlayerId === socket.id);
      setInputWord('');
      setTimeRemaining(data.timeRemaining);
      
      const currentPlayer = players.find(p => p.id === data.currentPlayerId);
      if (currentPlayer) {
        if (data.currentPlayerId === socket.id) {
          setGameMessage(`Đến lượt của bạn! Tiếp theo sẽ là ${data.nextPlayerName}`);
        } else {
          setGameMessage(`Đến lượt của ${currentPlayer.name}. Tiếp theo sẽ là ${data.nextPlayerName}`);
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
        
        setTimeout(() => {
          const currentPlayer = players.find(p => p.id === currentPlayerId);
          if (currentPlayer) {
            if (currentPlayerId === socket.id) {
              setGameMessage(`Đến lượt của bạn! Tiếp theo sẽ là ${nextPlayerName}`);
            } else {
              setGameMessage(`Đến lượt của ${currentPlayer.name}. Tiếp theo sẽ là ${nextPlayerName}`);
            }
          }
        }, 3000);
      }
    });

    socket.on('game-ended', (data: { losers: string[]; rankings: Player[], winner?: Player }) => {
      setGameEnded(true);
      setRankings(data.rankings);
      
      // Reset thông tin lượt chơi khi game kết thúc
      setCurrentPlayerId('');
      setNextPlayerId('');
      setNextPlayerName('');
      
      if (data.winner) {
        setGameMessage(`Người thắng: ${data.winner.name}!`);
      }
      
      // Tự động chuyển về phòng chờ sau 10 giây
      setTimeout(() => {
        if (socket) {
          socket.emit('player-back-to-room', { roomId });
          navigate(`/room/${roomId}`);
        }
      }, 10000);
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
      
      // Khôi phục thông báo lượt chơi
      const currentPlayer = players.find(p => p.id === currentPlayerId);
      if (currentPlayer) {
        if (currentPlayerId === socket.id) {
          setGameMessage(`Đến lượt của bạn! Tiếp theo sẽ là ${nextPlayerName}`);
        } else {
          setGameMessage(`Đến lượt của ${currentPlayer.name}. Tiếp theo sẽ là ${nextPlayerName}`);
        }
      }
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
  }, [socket, roomId, navigate, players, currentPlayerId, nextPlayerName]);

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
      setTimeout(() => {
        navigate(`/room/${roomId}`);
      }, 200);
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  if (gameEnded) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">Trò chơi kết thúc!</h1>
        
        {/* Chỉ hiển thị thông báo nếu là thông báo về người thắng cuộc */}
        {gameMessage && gameMessage.includes('Người thắng') && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mb-6 rounded relative">
            <span className="block sm:inline">{gameMessage}</span>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-purple-800 mb-3">Xếp hạng</h2>
          <div className="space-y-2">
            {rankings.map((player, index) => (
              <div 
                key={player.id} 
                className={`p-3 rounded-lg flex justify-between items-center ${
                  index === 0 ? 'bg-yellow-100' : 
                  index === 1 ? 'bg-gray-200' : 
                  index === 2 ? 'bg-amber-50' : 
                  'bg-white'
                }`}
              >
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-500' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-purple-600'
                  } text-white flex items-center justify-center font-bold mr-3`}>
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
          <p className="text-gray-500 mb-4">Tự động quay lại phòng chờ sau 10 giây...</p>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition duration-300"
            onClick={backToRoom}
          >
            Quay lại phòng chờ ngay
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
            <Timer 
              seconds={timeRemaining} 
              isActive={isMyTurn} 
              onTimeout={() => {
                if (isMyTurn) {
                  socket?.emit('player-timeout', { roomId });
                }
              }}
            />
          </div>
        </div>
        
        {/* Hiển thị thứ tự người chơi */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-purple-700 mb-2">Thứ tự chơi:</h2>
          <div className="flex flex-wrap gap-2">
            {playerOrder.map((player) => (
              <div 
                key={player.id}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  player.id === currentPlayerId 
                    ? 'bg-green-500 text-white font-bold' 
                    : player.id === nextPlayerId 
                      ? 'bg-blue-100 border border-blue-500' 
                      : 'bg-gray-100'
                }`}
              >
                {player.name} {player.id === currentPlayerId ? '(Đang chơi)' : player.id === nextPlayerId ? '(Tiếp theo)' : ''}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Người chơi</h3>
            <ul className="space-y-2">
              {players.map(player => (
                <li 
                  key={player.id}
                  className={`p-2 rounded flex justify-between ${player.id === currentPlayerId ? 'bg-green-100 font-bold' : ''} ${losers.includes(player.id) ? 'text-gray-400 line-through' : ''}`}
                >
                  <span>{player.name}</span>
                  {player.id === currentPlayerId && !losers.includes(player.id) && (
                    <span className="text-green-600">●</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3">Từ hiện tại</h3>
              {currentWord ? (
                <div className="flex flex-col justify-center items-center bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-700 min-h-[60px] mb-3">
                    {currentWord}
                  </div>
                  
                  {currentWord && (
                    <div className="text-sm text-gray-600 mb-2">
                      Từ tiếp theo phải bắt đầu bằng từ: <span className="font-bold text-purple-700 text-xl">
                        {currentWord.trim().split(/\s+/).pop()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between w-full">
                    {lastPlayerId && (
                      <div className="text-sm text-gray-600">
                        Người chơi: {players.find(p => p.id === lastPlayerId)?.name || 'Không xác định'}
                      </div>
                    )}
                    
                    {currentWord && myPlayerId && lastPlayerId && (myPlayerId !== lastPlayerId) && (
                      <button
                        onClick={reportWord}
                        className="px-3 py-1 rounded text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition duration-200"
                        title="Báo cáo từ không hợp lệ"
                      >
                        Báo cáo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic flex justify-center items-center min-h-[60px] bg-white p-4 rounded-lg shadow-sm">
                  Chưa có từ nào
                </div>
              )}
            </div>
            
            {wordHistory.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-3">Lịch sử từ</h3>
                <div className="bg-white p-3 rounded-lg shadow-sm max-h-40 overflow-y-auto">
                  <ul className="space-y-1">
                    {wordHistory.map((item, index) => {
                      const player = players.find(p => p.id === item.playerId);
                      return (
                        <li key={index} className="text-sm flex justify-between">
                          <span className="font-medium">{item.word}</span>
                          <span className="text-gray-600">{player?.name || 'Người chơi'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                {isMyTurn ? 'Lượt của bạn' : 'Chờ lượt của bạn'}
              </h3>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isMyTurn && inputWord.trim() && !losers.includes(myPlayerId || '')) {
                      e.preventDefault();
                      submitWord();
                    }
                  }}
                  disabled={!isMyTurn || losers.includes(myPlayerId || '')}
                  placeholder={isMyTurn ? "Nhập từ của bạn..." : "Chờ lượt của bạn..."}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={submitWord}
                  disabled={!isMyTurn || !inputWord.trim() || losers.includes(myPlayerId || '')}
                  className={`px-4 py-2 rounded font-bold ${isMyTurn && inputWord.trim() ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                >
                  Gửi
                </button>
              </div>
            </div>
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