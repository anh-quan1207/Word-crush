import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Lấy protocol và hostname của window để kết nối
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const hostname = window.location.hostname;
    // Kết nối đến server socket.io với protocol tương ứng
    const socketInstance = io(`${protocol}://${hostname}`, {
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