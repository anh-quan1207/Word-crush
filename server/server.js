const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors({
  origin: true, // Cho phép tất cả các origins
  credentials: true // Cho phép gửi credentials
}));
app.use(express.json());

// Khởi tạo server HTTP và socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Cho phép tất cả các origins
    methods: ['GET', 'POST'],
    credentials: true // Cho phép gửi credentials
  }
});

// Store rooms and players data
const rooms = new Map();

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new room
  socket.on('create-room', (callback) => {
    const roomId = generateRoomId();
    rooms.set(roomId, {
      players: [],
      messages: [],
      hostId: socket.id,
      gameState: {
        isPlaying: false,
        currentWord: '',
        currentPlayerId: '',
        lastWordPlayerId: '',
        losers: [],
        reports: [],
        playerOrderIndex: 0
      }
    });
    
    callback({ success: true, roomId });
  });

  // Join a room
  socket.on('join-room', ({ roomId, playerName }, callback) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      callback({ success: false, message: 'Phòng không tồn tại' });
      return;
    }

    // Kiểm tra xem người chơi đã tồn tại trong phòng chưa
    const existingPlayerIndex = room.players.findIndex(p => p.id === socket.id);
    
    if (existingPlayerIndex !== -1) {
      // Người chơi đã tồn tại, trả về thông tin phòng
      callback({ 
        success: true, 
        room: {
          players: room.players,
          messages: room.messages,
          hostId: room.hostId
        },
        isHost: socket.id === room.hostId
      });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      loseCount: 0
    };

    room.players.push(player);
    socket.join(roomId);
    
    // Nếu game đã kết thúc và có danh sách playersBackToRoom, 
    // tự động thêm người chơi mới vào playersBackToRoom
    if (!room.gameState.isPlaying && room.playersBackToRoom) {
      room.playersBackToRoom.add(socket.id);
      console.log(`New player ${socket.id} (${playerName}) added to back-to-room list. Total: ${room.playersBackToRoom.size}/${room.players.length}`);
    }
    
    io.to(roomId).emit('players-update', room.players);
    io.to(roomId).emit('messages-update', room.messages);
    
    callback({ 
      success: true, 
      room: {
        players: room.players,
        messages: room.messages,
        hostId: room.hostId
      },
      isHost: socket.id === room.hostId 
    });
  });

  // Start game
  socket.on('start-game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // Chỉ host mới có thể bắt đầu game
    if (socket.id !== room.hostId) {
      socket.emit('error-message', { message: 'Chỉ chủ phòng mới có thể bắt đầu game' });
      return;
    }
    
    if (room.players.length < 2) {
      socket.emit('error-message', { message: 'Cần ít nhất 2 người chơi để bắt đầu game' });
      return;
    }
    
    // Nếu đang trong game, thì không cho bắt đầu game mới
    if (room.gameState.isPlaying) {
      socket.emit('error-message', { message: 'Game đang diễn ra, không thể bắt đầu game mới' });
      return;
    }
    
    // Đếm số lượng người chơi có kết nối
    const connectedSockets = io.sockets.adapter.rooms.get(roomId);
    if (!connectedSockets || connectedSockets.size < room.players.length) {
      socket.emit('error-message', { message: 'Không đủ người chơi có kết nối trong phòng' });
      return;
    }
    
    // Kiểm tra tất cả người chơi đã quay lại phòng chờ
    if (room.playersBackToRoom) {
      // Kiểm tra xem có người chơi nào chưa quay lại phòng chờ không
      const missingPlayers = room.players.filter(p => !room.playersBackToRoom.has(p.id));
      
      if (missingPlayers.length > 0) {
        const missingNames = missingPlayers.map(p => p.name).join(', ');
        socket.emit('error-message', { message: `Vui lòng đợi ${missingNames} quay lại phòng chờ` });
        
        // Cập nhật cho người chơi biết họ cần quay lại phòng chờ
        missingPlayers.forEach(player => {
          const playerSocket = io.sockets.sockets.get(player.id);
          if (playerSocket) {
            playerSocket.emit('error-message', { 
              message: 'Bạn cần quay lại phòng chờ để game mới có thể bắt đầu. Vui lòng nhấn "Quay lại phòng chờ".' 
            });
          }
        });
        
        return;
      }
    }
    
    // Reset game state
    room.gameState.isPlaying = true;
    room.gameState.currentWord = '';
    room.gameState.losers = [];
    room.gameState.reports = [];
    room.gameState.lastWordPlayerId = '';
    
    // Reset danh sách người chơi đã quay lại
    if (room.playersBackToRoom) {
      room.playersBackToRoom.clear();
    }
    
    // Xáo trộn thứ tự người chơi ngẫu nhiên
    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
    
    // Lưu danh sách đã xáo trộn để sử dụng trong quá trình chơi
    room.gameState.shuffledPlayerOrder = shuffledPlayers.map(p => p.id);
    
    // Bắt đầu với người chơi đầu tiên trong danh sách đã xáo trộn
    room.gameState.playerOrderIndex = 0;
    const firstPlayerId = shuffledPlayers[0].id;
    room.gameState.currentPlayerId = firstPlayerId;
    
    // Xác định người chơi tiếp theo
    const nextPlayerIndex = 1 % shuffledPlayers.length;
    const nextPlayerId = shuffledPlayers[nextPlayerIndex].id;
    const nextPlayerName = room.players.find(p => p.id === nextPlayerId)?.name || 'Người chơi tiếp theo';
    
    console.log(`Game started in room ${roomId}. First player: ${firstPlayerId}`);
    
    // Thông báo cho tất cả người chơi về việc game bắt đầu
    io.to(roomId).emit('game-started', {
      currentPlayerId: firstPlayerId,
      playerOrder: shuffledPlayers.map(p => ({ id: p.id, name: p.name }))
    });
    
    // Ngay sau đó, gửi thông báo về người chơi đầu tiên
    setTimeout(() => {
      io.to(roomId).emit('next-player', {
        currentPlayerId: firstPlayerId,
        nextPlayerId: nextPlayerId,
        nextPlayerName: nextPlayerName,
        timeRemaining: 30,
        playerOrder: shuffledPlayers.map(p => ({ id: p.id, name: p.name }))
      });
    }, 500);
  });

  // Submit word
  socket.on('submit-word', ({ roomId, word }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState.isPlaying) return;
    
    // Kiểm tra xem có phải lượt của người chơi hiện tại không
    if (room.gameState.currentPlayerId !== socket.id) {
      socket.emit('error-message', { message: 'Không phải lượt của bạn' });
      return;
    }
    
    console.log(`Checking word: "${word}" from player ${socket.id}`);
    
    // Save the word
    if (!room.gameState.currentWord) {
      // First word of the game
      room.gameState.currentWord = word;
      console.log(`First word: ${word}`);
    } else {
      // Lấy từ cuối cùng
      const previousWord = room.gameState.currentWord;
      console.log(`Previous word: "${previousWord}", New word: "${word}"`);
      
      try {
        // Tách từ trước đó thành các từ riêng biệt
        const previousWords = previousWord.trim().split(/\s+/);
        const lastWordOfPrevious = previousWords[previousWords.length - 1];
        console.log(`Last word of previous: "${lastWordOfPrevious}"`);
        
        // Tách từ mới thành các từ riêng biệt
        const newWords = word.trim().split(/\s+/);
        const firstWordOfNew = newWords[0];
        console.log(`First word of new: "${firstWordOfNew}"`);
        
        // Kiểm tra từ đầu tiên của từ mới có giống từ cuối cùng của từ trước không
        if (firstWordOfNew.toLowerCase() !== lastWordOfPrevious.toLowerCase()) {
          const reason = `Từ "${word}" không bắt đầu bằng từ "${lastWordOfPrevious}" (từ cuối của "${previousWord}")`;
          socket.emit('error-message', { message: reason });
          handlePlayerLose(roomId, socket.id, reason);
          return;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra từ:", error);
        // Nếu có lỗi, không phạt người chơi mà để họ tiếp tục
      }
      
      room.gameState.currentWord = word;
    }
    
    // Lưu lại ID của người chơi vừa nhập từ để xử lý báo cáo chính xác
    room.gameState.lastWordPlayerId = socket.id;
    
    // Thông báo cho tất cả người chơi về từ mới
    io.to(roomId).emit('word-update', {
      word: room.gameState.currentWord,
      playerId: socket.id
    });
    
    // Select next player randomly (ensure fair distribution)
    selectNextPlayer(roomId);
  });

  // Report word
  socket.on('report-word', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState.isPlaying) return;
    
    console.log(`Player ${socket.id} is reporting the word "${room.gameState.currentWord}"`);
    
    // Add the report
    if (!room.gameState.reports.find(report => report.playerId === socket.id)) {
      room.gameState.reports.push({
        playerId: socket.id,
        vote: true
      });
      
      console.log(`Reports after adding: ${JSON.stringify(room.gameState.reports)}`);
    }
    
    // Gửi thông báo đến tất cả người chơi trong phòng
    io.to(roomId).emit('report-started', {
      reports: room.gameState.reports,
      word: room.gameState.currentWord
    });
    
    console.log(`Report-started event sent to room ${roomId}`);
  });

  // Vote on report
  socket.on('vote-report', ({ roomId, vote }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState.isPlaying) return;
    
    // Update player's vote
    const existingReport = room.gameState.reports.find(report => report.playerId === socket.id);
    if (existingReport) {
      existingReport.vote = vote;
    } else {
      room.gameState.reports.push({
        playerId: socket.id,
        vote
      });
    }
    
    // Check if enough votes to make a decision
    const totalPlayers = room.players.length;
    const totalVotes = room.gameState.reports.length;
    const yesVotes = room.gameState.reports.filter(report => report.vote).length;
    
    io.to(roomId).emit('report-update', {
      reports: room.gameState.reports,
      word: room.gameState.currentWord
    });
    
    // If all players voted or majority reached
    if (totalVotes === totalPlayers || yesVotes > totalPlayers / 2) {
      if (yesVotes >= totalPlayers / 2) {
        // Word rejected, last player who submitted the word loses
        const lastSubmittedPlayerId = room.gameState.lastWordPlayerId;
        
        // Nếu không có ID người chơi đã lưu (hiếm khi xảy ra), dùng người chơi hiện tại
        const playerIdToLose = lastSubmittedPlayerId || room.gameState.currentPlayerId;
        
        handlePlayerLose(roomId, playerIdToLose, 'Từ bị từ chối bởi đa số người chơi');
      } else {
        // Word accepted, continue game
        room.gameState.reports = [];
        io.to(roomId).emit('report-finished', { accepted: true });
      }
    }
  });

  // Chat message
  socket.on('send-message', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Giới hạn độ dài tin nhắn tối đa 100 ký tự
    const MAX_MESSAGE_LENGTH = 100;
    const trimmedMessage = message.slice(0, MAX_MESSAGE_LENGTH);
    
    const newMessage = {
      id: Date.now(),
      senderId: socket.id,
      senderName: player.name,
      text: trimmedMessage,
      timestamp: new Date().toISOString()
    };
    
    room.messages.push(newMessage);
    io.to(roomId).emit('new-message', newMessage);
  });

  // Timeout (player took too long)
  socket.on('player-timeout', ({ roomId }) => {
    handlePlayerLose(roomId, socket.id, 'Hết thời gian');
  });

  // Player disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Tìm phòng mà người chơi đang tham gia
    let roomIdFound = null;
    
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        roomIdFound = roomId;
        
        // Lấy thông tin người chơi để sử dụng sau khi xóa
        const playerName = room.players[playerIndex].name;
        const isHost = room.hostId === socket.id;
        
        // Xóa người chơi khỏi danh sách
        room.players.splice(playerIndex, 1);
        
        // Xóa người chơi khỏi danh sách playersBackToRoom nếu có
        if (room.playersBackToRoom && room.playersBackToRoom.has(socket.id)) {
          room.playersBackToRoom.delete(socket.id);
          console.log(`Player ${socket.id} removed from back-to-room list. Total: ${room.playersBackToRoom.size}/${room.players.length}`);
        }
        
        // Nếu phòng trống, xóa phòng
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted because it's empty`);
        } else {
          // Nếu người chơi rời đi là host, chỉ định host mới
          if (isHost) {
            const newHostIndex = 0; // Chọn người đầu tiên làm host mới
            room.hostId = room.players[newHostIndex].id;
            
            // Thông báo cho tất cả người chơi còn lại về host mới
            io.to(roomId).emit('host-changed', {
              newHostId: room.hostId,
              newHostName: room.players[newHostIndex].name,
              message: `${playerName} (chủ phòng cũ) đã thoát. ${room.players[newHostIndex].name} là chủ phòng mới.`
            });
            
            console.log(`Host changed in room ${roomId} to ${room.hostId}`);
          } else {
            // Thông báo người chơi đã thoát
            io.to(roomId).emit('player-left', {
              playerId: socket.id,
              playerName: playerName,
              message: `${playerName} đã thoát khỏi phòng.`
            });
          }
          
          // Update players in room
          io.to(roomId).emit('players-update', room.players);
          
          // If the disconnected player was the current player, select a new one
          if (room.gameState.isPlaying && room.gameState.currentPlayerId === socket.id) {
            // Dừng timer hiện tại nếu có
            if (room.gameState.timer) {
              clearInterval(room.gameState.timer);
              room.gameState.timer = null;
            }
            
            // Chuyển lượt sang người chơi tiếp theo
            selectNextPlayer(roomId);
          }
        }
      }
    }
  });

  // Kiểm tra người chơi có trong phòng không
  socket.on('check-player-in-room', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      callback({ success: false, message: 'Phòng không tồn tại' });
      return;
    }
    
    const playerInRoom = room.players.some(p => p.id === socket.id);
    
    if (!playerInRoom) {
      callback({ success: false, message: 'Bạn không có trong phòng này' });
      return;
    }
    
    callback({ success: true });
  });
  
  // Lấy thông tin phòng hiện tại
  socket.on('get-room-info', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      callback({ success: false, message: 'Phòng không tồn tại' });
      return;
    }
    
    callback({ 
      success: true, 
      players: room.players,
      currentPlayerId: room.gameState.currentPlayerId,
      isPlaying: room.gameState.isPlaying,
      currentWord: room.gameState.currentWord,
      messages: room.messages,
      hostId: room.hostId
    });
  });

  // Rời khỏi phòng
  socket.on('leave-room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;
    
    // Lấy thông tin người chơi để sử dụng sau khi xóa
    const playerName = room.players[playerIndex].name;
    const isHost = room.hostId === socket.id;
    
    // Xóa người chơi khỏi danh sách
    room.players.splice(playerIndex, 1);
    
    // Xóa người chơi khỏi danh sách playersBackToRoom nếu có
    if (room.playersBackToRoom && room.playersBackToRoom.has(socket.id)) {
      room.playersBackToRoom.delete(socket.id);
      console.log(`Player ${socket.id} removed from back-to-room list. Total: ${room.playersBackToRoom.size}/${room.players.length}`);
    }
    
    socket.leave(roomId);
    
    // Nếu phòng trống, xóa phòng
    if (room.players.length === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted because it's empty`);
    } else {
      // Nếu người chơi rời đi là host, chỉ định host mới
      if (isHost) {
        const newHostIndex = 0; // Chọn người đầu tiên làm host mới
        room.hostId = room.players[newHostIndex].id;
        
        // Thông báo cho tất cả người chơi còn lại về host mới
        io.to(roomId).emit('host-changed', {
          newHostId: room.hostId,
          newHostName: room.players[newHostIndex].name,
          message: `${playerName} (chủ phòng cũ) đã thoát. ${room.players[newHostIndex].name} là chủ phòng mới.`
        });
        
        console.log(`Host changed in room ${roomId} to ${room.hostId}`);
      } else {
        // Thông báo người chơi đã thoát
        io.to(roomId).emit('player-left', {
          playerId: socket.id,
          playerName: playerName,
          message: `${playerName} đã thoát khỏi phòng.`
        });
      }
      
      // Cập nhật danh sách người chơi trong phòng
      io.to(roomId).emit('players-update', room.players);
      
      // Nếu người rời đi đang là người chơi hiện tại trong game, chọn người chơi mới
      if (room.gameState.isPlaying && room.gameState.currentPlayerId === socket.id) {
        // Dừng timer hiện tại nếu có
        if (room.gameState.timer) {
          clearInterval(room.gameState.timer);
          room.gameState.timer = null;
        }
        
        // Chuyển lượt sang người chơi tiếp theo
        selectNextPlayer(roomId);
      }
    }
  });

  // Xử lý người chơi quay lại phòng chờ
  socket.on('player-back-to-room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // Xác nhận người chơi đang ở phòng chờ
    socket.join(roomId);
    
    // Đảm bảo có danh sách theo dõi người chơi đã quay lại
    if (!room.playersBackToRoom) {
      room.playersBackToRoom = new Set();
    }
    
    // Đánh dấu người chơi đã quay lại
    room.playersBackToRoom.add(socket.id);
    
    console.log(`Player ${socket.id} back to waiting room. Total back: ${room.playersBackToRoom.size}/${room.players.length}`);
    
    // Tìm tên người chơi để thông báo
    const player = room.players.find(p => p.id === socket.id);
    const playerName = player ? player.name : 'Người chơi';
    
    // Gửi thông báo cho tất cả người chơi
    io.to(roomId).emit('player-back-notification', {
      playerId: socket.id,
      playerName: playerName,
      message: `${playerName} đã quay lại phòng chờ.`
    });
    
    // Kiểm tra nếu tất cả người chơi đã quay lại và thông báo cho chủ phòng
    if (room.playersBackToRoom.size === room.players.length) {
      console.log(`All players in room ${roomId} are back to the waiting room`);
      
      // Thông báo chỉ gửi cho chủ phòng
      const hostSocket = io.sockets.sockets.get(room.hostId);
      if (hostSocket) {
        hostSocket.emit('all-players-back', {
          message: 'Tất cả người chơi đã quay lại phòng chờ. Bạn có thể bắt đầu game mới.'
        });
      }
    }
  });
});

// Helper function to generate a random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Helper function to select the next player randomly
function selectNextPlayer(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.gameState.isPlaying || room.players.length < 2) return;
  
  // Lấy danh sách ID người chơi theo thứ tự đã xáo trộn
  const shuffledPlayerIds = room.gameState.shuffledPlayerOrder || room.players.map(p => p.id);
  
  // Lọc ra những người chơi chưa bị loại, nhưng vẫn giữ thứ tự đã xáo trộn
  const availablePlayerIds = shuffledPlayerIds.filter(playerId => 
    !room.gameState.losers.includes(playerId)
  );
  
  // Nếu không còn người chơi khả dụng, kết thúc trò chơi
  if (availablePlayerIds.length === 0) {
    room.gameState.isPlaying = false;
    io.to(roomId).emit('game-ended', {
      losers: room.gameState.losers,
      rankings: room.players.sort((a, b) => a.loseCount - b.loseCount)
    });
    return;
  }
  
  // Lấy người chơi tiếp theo trong vòng, theo thứ tự đã xáo trộn
  room.gameState.playerOrderIndex = (room.gameState.playerOrderIndex + 1) % availablePlayerIds.length;
  room.gameState.currentPlayerId = availablePlayerIds[room.gameState.playerOrderIndex];
  
  // Xác định người chơi tiếp theo sau lượt này
  const nextPlayerIndex = (room.gameState.playerOrderIndex + 1) % availablePlayerIds.length;
  const nextPlayerId = availablePlayerIds[nextPlayerIndex];
  const nextPlayerName = room.players.find(p => p.id === nextPlayerId)?.name || 'Người chơi tiếp theo';
  
  // Chuyển từ danh sách ID sang đối tượng người chơi đầy đủ để hiển thị
  const playerOrder = availablePlayerIds.map(id => {
    const player = room.players.find(p => p.id === id);
    return { id, name: player?.name || 'Người chơi' };
  });
  
  // Reset report votes for new turn
  room.gameState.reports = [];
  
  // Thời gian cho lượt đi
  const turnTime = 30; // 30 giây
  
  // Thiết lập đồng hồ đếm ngược cho server
  if (room.gameState.timer) {
    clearTimeout(room.gameState.timer);
  }
  
  // Notify clients about next player and thời gian còn lại
  io.to(roomId).emit('next-player', {
    currentPlayerId: room.gameState.currentPlayerId,
    nextPlayerId: nextPlayerId,
    nextPlayerName: nextPlayerName,
    timeRemaining: turnTime,
    playerOrder: playerOrder
  });
  
  // Thiết lập hàm định kỳ gửi thời gian còn lại
  let timeRemaining = turnTime;
  room.gameState.timer = setInterval(() => {
    timeRemaining--;
    
    // Gửi cập nhật thời gian đến tất cả người chơi
    io.to(roomId).emit('timer-update', {
      timeRemaining: timeRemaining
    });
    
    // Khi hết thời gian
    if (timeRemaining <= 0) {
      clearInterval(room.gameState.timer);
      handlePlayerLose(roomId, room.gameState.currentPlayerId, 'Hết thời gian');
    }
  }, 1000);
}

// Handle player losing
function handlePlayerLose(roomId, playerId, reason) {
  const room = rooms.get(roomId);
  if (!room || !room.gameState.isPlaying) return;
  
  // Dừng timer nếu có
  if (room.gameState.timer) {
    clearInterval(room.gameState.timer);
    room.gameState.timer = null;
  }
  
  // Find the player and increment their lose count
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.loseCount++;
  }
  
  // Add to losers list for this round
  if (!room.gameState.losers.find(id => id === playerId)) {
    room.gameState.losers.push(playerId);
  }
  
  // Notify clients about the player's loss
  io.to(roomId).emit('player-lost', {
    playerId,
    reason,
    losers: room.gameState.losers
  });
  
  // Kết thúc game ngay khi có người thua
  room.gameState.isPlaying = false;
  
  // Reset current player data để không hiển thị thông báo lượt chơi nữa
  room.gameState.currentPlayerId = null;
  room.gameState.playerOrderIndex = -1;
  
  // Khởi tạo/xóa danh sách người chơi đã quay lại phòng chờ
  if (!room.playersBackToRoom) {
    room.playersBackToRoom = new Set();
  } else {
    room.playersBackToRoom.clear();
  }
  
  // Sắp xếp bảng xếp hạng: người có loseCount thấp nhất xếp hạng cao nhất
  const rankings = [...room.players].sort((a, b) => a.loseCount - b.loseCount);
  
  // Gửi cập nhật danh sách người chơi
  io.to(roomId).emit('players-update', room.players);
  
  // Gửi thông báo game kết thúc
  io.to(roomId).emit('game-ended', {
    losers: room.gameState.losers,
    rankings: rankings
  });
  
  // Reset for next game
  room.gameState.losers = [];
  room.gameState.currentWord = '';
  room.gameState.reports = [];
}

// API endpoints
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
}); 