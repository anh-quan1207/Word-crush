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
    // Xác định URL kết nối socket dựa trên môi trường
    let socketUrl;
    
    if (process.env.NODE_ENV === 'production') {
      // Trong môi trường production, sử dụng domain hiện tại mà không cần chỉ định port
      socketUrl = window.location.origin;
    } else {
      // Trong môi trường development, sử dụng cổng 5000
      socketUrl = 'http://localhost:5000';
    }
    
    console.log('Connecting to socket server at:', socketUrl);
    
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      path: '/socket.io',
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