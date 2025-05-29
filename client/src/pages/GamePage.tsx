import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import Timer from '../components/Timer';
import ThemeToggleButton from '../components/ThemeToggleButton';

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
  const { roomId } = useParams();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [nextPlayerId, setNextPlayerId] = useState('');
  const [nextPlayerName, setNextPlayerName] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [inputWord, setInputWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [wordHistory, setWordHistory] = useState([]);
  const [lastPlayerId, setLastPlayerId] = useState('');
  const [gameEnded, setGameEnded] = useState(false);
  const [losers, setLosers] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [gameMessage, setGameMessage] = useState('');
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [playerOrder, setPlayerOrder] = useState([]);
  const timerRef = useRef(null);

  const myPlayerId = socket?.id;

  // Xác định màu sắc dựa trên theme
  const containerClass = theme === 'vscode' 
    ? 'bg-[#2D2D2D] text-gray-100 border border-[#3C3C3C]' 
    : 'bg-white';

  const headerClass = theme === 'vscode' 
    ? 'text-blue-300' 
    : 'text-purple-700';

  const cardClass = theme === 'vscode'
    ? 'bg-[#37373D] border-[#3C3C3C]'
    : 'bg-gray-50';

  const inputClass = theme === 'vscode'
    ? 'bg-[#3C3C3C] text-gray-100 border-[#6B6B6B] focus:ring-blue-500'
    : 'bg-white text-gray-700 border-gray-300 focus:ring-purple-500';

  useEffect(() => {
    if (!socket) return;

    socket.emit('check-player-in-room', { roomId }, (response: any) => {
      if (!response.success) {
        navigate(`/room/${roomId}`);
      }
    });

    socket.emit('get-room-info', { roomId }, (response: any) => {
      if (response.success && response.players) {
        setPlayers(response.players);
        if (response.currentPlayerId) {
          setCurrentPlayerId(response.currentPlayerId);
          setIsMyTurn(response.currentPlayerId === socket.id);
        }
      }
    });

    socket.on('game-started', (data: any) => {
      setCurrentPlayerId(data.currentPlayerId);
      setPlayerOrder(data.playerOrder);
      setIsMyTurn(data.currentPlayerId === socket.id);
      setWordHistory([]);
      setCurrentWord('');
      setGameEnded(false);
      setLosers([]);
    });

    socket.on('players-update', (updatedPlayers: any) => {
      const uniquePlayersMap = new Map();
      updatedPlayers.forEach(player => {
        uniquePlayersMap.set(player.id, player);
      });
      setPlayers(Array.from(uniquePlayersMap.values()));
    });

    socket.on('next-player', (data: any) => {
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
          // setGameMessage(`Đến lượt của bạn! Tiếp theo sẽ là ${data.nextPlayerName}`);
        } else {
          // setGameMessage(`Đến lượt của ${currentPlayer.name}. Tiếp theo sẽ là ${data.nextPlayerName}`);
        }
      }
    });
    
    socket.on('timer-update', (data: any) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('word-update', (data: any) => {
      setWordHistory(prev => [...prev, { word: data.word, playerId: data.playerId }]);
      
      setCurrentWord(data.word);
      setLastPlayerId(data.playerId);
      console.log(`Word updated: ${data.word} by player ${data.playerId}`);
    });

    socket.on('player-lost', (data: any) => {
      setLosers(data.losers);
      
      const player = players.find(p => p.id === data.playerId);
      if (player) {
        setGameMessage(`${player.name} đã thua: ${data.reason}`);
        
        setTimeout(() => {
          const currentPlayer = players.find(p => p.id === currentPlayerId);
          if (currentPlayer) {
            if (currentPlayerId === socket.id) {
              // setGameMessage(`Đến lượt của bạn! Tiếp theo sẽ là ${nextPlayerName}`);
            } else {
              // setGameMessage(`Đến lượt của ${currentPlayer.name}. Tiếp theo sẽ là ${nextPlayerName}`);
            }
          }
        }, 3000);
      }
    });

    socket.on('game-ended', (data: any) => {
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

    socket.on('error-message', (data: any) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('report-started', (data: any) => {
      console.log("Received report-started event", data);
      setShowReportModal(true);
      setReports(data.reports);
      
      const reporter = players.find(p => p.id === data.reports[0]?.playerId);
      if (reporter) {
        setGameMessage(`${reporter.name} đã báo cáo từ "${data.word}"`);
      }
    });

    socket.on('report-update', (data: any) => {
      setReports(data.reports);
    });

    socket.on('report-finished', (data: any) => {
      setShowReportModal(false);
      setReports([]);
      
      // Khôi phục thông báo lượt chơi
      const currentPlayer = players.find(p => p.id === currentPlayerId);
      if (currentPlayer) {
        if (currentPlayerId === socket.id) {
          // setGameMessage(`Đến lượt của bạn! Tiếp theo sẽ là ${nextPlayerName}`);
        } else {
          // setGameMessage(`Đến lượt của ${currentPlayer.name}. Tiếp theo sẽ là ${nextPlayerName}`);
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

  // Tự động quay lại phòng chờ sau khi game kết thúc
  useEffect(() => {
    if (gameEnded) {
      const timer = setTimeout(() => {
        backToRoom();
      }, 10000); // Tự động sau 10 giây
      
      return () => clearTimeout(timer);
    }
  }, [gameEnded]);

  if (gameEnded) {
    return (
      <div className={`${containerClass} rounded-xl shadow-md p-6`}>
        <h1 className={`text-3xl font-bold ${headerClass} mb-6 text-center`}>Trò chơi kết thúc!</h1>
        
        {/* Chỉ hiển thị thông báo nếu là thông báo về người thắng cuộc */}
        {gameMessage && gameMessage.includes('Người thắng') && (
          <div className={theme === 'vscode' 
            ? "bg-blue-900/30 border border-blue-800/50 text-blue-300 px-4 py-3 mb-6 rounded relative"
            : "bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mb-6 rounded relative"
          }>
            <span className="block sm:inline">{gameMessage}</span>
          </div>
        )}
        
        <div className={`${theme === 'vscode' ? 'bg-[#37373D] from-blue-900/20 to-indigo-900/20' : 'bg-gradient-to-r from-purple-100 to-indigo-100'} p-4 rounded-lg mb-6`}>
          <h2 className={`text-xl font-semibold ${headerClass} mb-3`}>Xếp hạng</h2>
          <div className="space-y-2">
            {rankings.map((player, index) => (
              <div 
                key={player.id} 
                className={`p-3 rounded-lg flex justify-between items-center ${
                  theme === 'vscode' ? 
                    (index === 0 ? 'bg-yellow-900/30 border border-yellow-700/50' : 
                    index === 1 ? 'bg-gray-700/30 border border-gray-600/50' : 
                    index === 2 ? 'bg-amber-800/30 border border-amber-700/50' : 
                    'bg-[#2D2D2D] border border-[#3C3C3C]')
                  : 
                    (index === 0 ? 'bg-yellow-100' : 
                    index === 1 ? 'bg-gray-200' : 
                    index === 2 ? 'bg-amber-50' : 
                    'bg-white')
                }`}
              >
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-500' :
                    index === 2 ? 'bg-amber-600' :
                    theme === 'vscode' ? 'bg-blue-600' : 'bg-purple-600'
                  } text-white flex items-center justify-center font-bold mr-3`}>
                    {index + 1}
                  </span>
                  <span className={`font-medium ${theme === 'vscode' ? 'text-gray-200' : ''}`}>{player.name}</span>
                </div>
                <span className={theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'}>{player.loseCount} thua</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <p className={`mb-4 ${theme === 'vscode' ? 'text-gray-300' : 'text-gray-500'}`}>Tự động quay lại phòng chờ sau 10 giây...</p>
          <button
            className={`${theme === 'vscode' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-2 px-6 rounded transition duration-300`}
            onClick={backToRoom}
          >
            Quay lại phòng chờ ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerClass} rounded-xl shadow-md overflow-hidden relative`}>
      
      {error && (
        <div className={theme === 'vscode' 
          ? "bg-red-900/30 border border-red-800/50 text-red-300 px-4 py-3 m-4 rounded relative"
          : "bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded relative"
        }>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {gameMessage && (
        <div className={theme === 'vscode' 
          ? "bg-blue-900/30 border border-blue-800/50 text-blue-300 px-4 py-3 m-4 rounded relative"
          : "bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 m-4 rounded relative"
        }>
          <span className="block sm:inline">{gameMessage}</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold ${headerClass}`}>Word Crush</h1>
            <ThemeToggleButton className="ml-3" />
          </div>
          
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
          <h2 className={`text-lg font-semibold ${headerClass} mb-2`}>Thứ tự chơi:</h2>
          <div className="flex flex-wrap gap-2">
            {playerOrder.map((player) => (
              <div 
                key={player.id}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  player.id === currentPlayerId 
                    ? 'bg-green-500 text-white font-bold' 
                    : player.id === nextPlayerId 
                      ? theme === 'vscode' ? 'bg-blue-900 border border-blue-700 text-blue-300' : 'bg-blue-100 border border-blue-500' 
                      : theme === 'vscode' ? 'bg-[#37373D]' : 'bg-gray-100'
                }`}
              >
                {player.name} {player.id === currentPlayerId ? '(Đang chơi)' : player.id === nextPlayerId ? '(Tiếp theo)' : ''}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`md:col-span-1 ${cardClass} p-4 rounded-lg`}>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'vscode' ? 'text-blue-300' : ''}`}>Người chơi</h3>
            <ul className="space-y-2">
              {players.map(player => (
                <li 
                  key={player.id}
                  className={`p-2 rounded flex justify-between ${
                    player.id === currentPlayerId 
                      ? theme === 'vscode' ? 'bg-blue-900 font-bold' : 'bg-green-100 font-bold'
                      : ''
                  } ${losers.includes(player.id) ? 'text-gray-400 line-through' : ''}`}
                >
                  <span>{player.name}</span>
                  {player.id === currentPlayerId && !losers.includes(player.id) && (
                    <span className={theme === 'vscode' ? 'text-blue-300' : 'text-green-600'}>●</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <div className={`${cardClass} p-4 rounded-lg mb-6`}>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'vscode' ? 'text-blue-300' : ''}`}>Từ hiện tại</h3>
              {currentWord ? (
                <div className={`flex flex-col justify-center items-center ${theme === 'vscode' ? 'bg-[#1E1E1E]' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                  <div className={`text-2xl font-bold ${headerClass} min-h-[60px] mb-3`}>
                    {currentWord}
                  </div>
                  
                  {currentWord && (
                    <div className={`text-sm ${theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                      Từ tiếp theo phải bắt đầu bằng từ: <span className={`font-bold ${headerClass} text-xl`}>
                        {currentWord.trim().split(/\s+/).pop()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between w-full">
                    {lastPlayerId && (
                      <div className={`text-sm ${theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Người chơi: {players.find(p => p.id === lastPlayerId)?.name || 'Không xác định'}
                      </div>
                    )}
                    
                    {currentWord && myPlayerId && lastPlayerId && (myPlayerId !== lastPlayerId) && (
                      <button
                        onClick={reportWord}
                        className={`px-3 py-1 rounded text-sm font-bold ${theme === 'vscode' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white transition duration-200`}
                        title="Báo cáo từ không hợp lệ"
                      >
                        Báo cáo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`${theme === 'vscode' ? 'text-gray-300 bg-[#1E1E1E]' : 'text-gray-500 bg-white'} italic flex justify-center items-center min-h-[60px] p-4 rounded-lg shadow-sm`}>
                  Chưa có từ nào
                </div>
              )}
            </div>
            
            {wordHistory.length > 0 && (
              <div className={`${cardClass} p-4 rounded-lg mb-6`}>
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'vscode' ? 'text-blue-300' : ''}`}>Lịch sử từ</h3>
                <div className={`${theme === 'vscode' ? 'bg-[#1E1E1E]' : 'bg-white'} p-3 rounded-lg shadow-sm max-h-40 overflow-y-auto`}>
                  <ul className="space-y-1">
                    {wordHistory.map((item, index) => {
                      const player = players.find(p => p.id === item.playerId);
                      return (
                        <li key={index} className="text-sm flex justify-between">
                          <span className={`font-medium ${theme === 'vscode' ? 'text-blue-300' : ''}`}>{item.word}</span>
                          <span className={theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'}>{player?.name || 'Người chơi'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
            
            <div className={`${cardClass} p-4 rounded-lg`}>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'vscode' ? 'text-blue-300' : ''}`}>
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
                  className={`flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 ${inputClass}`}
                />
                <button
                  onClick={submitWord}
                  disabled={!isMyTurn || !inputWord.trim() || losers.includes(myPlayerId || '')}
                  className={`px-4 py-2 rounded font-bold ${
                    isMyTurn && inputWord.trim() 
                      ? theme === 'vscode' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
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
          <div className={`${theme === 'vscode' ? 'bg-[#2D2D2D] border border-[#3C3C3C] text-gray-200' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'vscode' ? 'text-blue-300' : ''}`}>Báo cáo từ</h2>
            <p className={`mb-4 ${theme === 'vscode' ? 'text-gray-300' : ''}`}>Có người cho rằng từ "{currentWord}" không hợp lệ. Bạn có đồng ý không?</p>
            
            <div className="flex justify-between mb-4">
              <div className={`text-sm ${theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'}`}>
                Đã bỏ phiếu: {reports.length}/{players.length}
              </div>
              <div className={`text-sm ${theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'}`}>
                Đồng ý: {reports.filter(r => r.vote).length}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className={`text-sm font-semibold ${theme === 'vscode' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Danh sách bỏ phiếu:</h3>
              <ul className={`text-xs ${theme === 'vscode' ? 'text-gray-300' : 'text-gray-600'}`}>
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
                className={`${theme === 'vscode' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2 px-6 rounded transition duration-300`}
              >
                Đồng ý
              </button>
              <button
                onClick={() => voteReport(false)}
                className={`${theme === 'vscode' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-6 rounded transition duration-300`}
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