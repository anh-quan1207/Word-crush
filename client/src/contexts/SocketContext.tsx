import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface SocketContextType {
  socket: any;
  connected: boolean;
}

const SocketContext = createContext({
  socket: null,
  connected: false
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: any;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Lấy protocol và hostname của window để kết nối
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const hostname = window.location.hostname;
    // Kết nối đến server socket.io với protocol tương ứng và cổng 5000
    const socketInstance = io(`${protocol}://${hostname}:5000`, {
      withCredentials: true, // Bật withCredentials để hỗ trợ CORS
      path: '/socket.io', // Đường dẫn mặc định
    });

    // Lắng nghe sự kiện kết nối
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    // Lắng nghe sự kiện ngắt kết nối
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Lắng nghe lỗi kết nối
    socketInstance.on('connect_error', (error) => {
      console.log('Connection error:', error);
    });

    // Lưu instance socket
    setSocket(socketInstance);

    // Dọn dẹp khi component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}; 