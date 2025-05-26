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
    // Lấy hostname của window để kết nối
    const hostname = window.location.hostname;
    // Kết nối đến server socket.io (sử dụng hostname hiện tại thay vì hardcode localhost)
    const socketInstance = io(`http://${hostname}:5000`, {
      withCredentials: true, // Bật withCredentials để hỗ trợ CORS
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