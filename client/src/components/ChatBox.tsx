import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  compact?: boolean;
}

function ChatBox({ messages, onSendMessage, compact = false }: ChatBoxProps) {
  const { theme } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  // Giới hạn số ký tự
  const MAX_MESSAGE_LENGTH = 100;
  
  // Tính số ký tự còn lại
  const remainingChars = MAX_MESSAGE_LENGTH - newMessage.length;

  // Xác định màu sắc dựa trên theme
  const containerBg = theme === 'vscode' 
    ? 'bg-[#2D2D2D] border border-[#3C3C3C]' 
    : 'bg-white';
    
  const headerBg = theme === 'vscode'
    ? 'border-b border-[#3C3C3C]'
    : 'border-b';
    
  const headerText = theme === 'vscode'
    ? 'text-blue-300'
    : 'text-gray-800';
    
  const emptyText = theme === 'vscode'
    ? 'text-gray-400'
    : 'text-gray-500';
    
  const messageSenderText = theme === 'vscode'
    ? 'text-blue-400'
    : 'text-indigo-600';
    
  const messageTimestampText = theme === 'vscode'
    ? 'text-gray-400'
    : 'text-gray-500';
    
  const messageBg = theme === 'vscode'
    ? 'bg-[#37373D] text-gray-200'
    : 'bg-gray-100 text-gray-800';
    
  const inputBg = theme === 'vscode'
    ? 'bg-[#3C3C3C] focus:ring-blue-500 border-[#6B6B6B] text-gray-200'
    : 'bg-gray-50 focus:ring-purple-500 border-gray-200 text-gray-800';
    
  const buttonBg = theme === 'vscode'
    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500';
    
  const remainingCharsColor = remainingChars <= 10
    ? 'text-red-500'
    : theme === 'vscode' ? 'text-gray-400' : 'text-gray-500';

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage('');
  };

  // Xử lý khi nhập tin nhắn
  const handleMessageChange = (e: any) => {
    const value = e.target.value;
    // Chỉ lấy 100 ký tự đầu tiên
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value);
    } else {
      setNewMessage(value.slice(0, MAX_MESSAGE_LENGTH));
    }
  };

  // Format thời gian
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${containerBg} rounded-lg shadow-md flex flex-col ${compact ? 'h-[300px] w-[300px]' : 'h-full'}`}>
      <div className={`p-3 ${headerBg}`}>
        <h3 className={`text-lg font-semibold ${headerText}`}>Chat</h3>
      </div>
      
      <div className={`flex-grow overflow-y-auto p-3 ${compact ? 'max-h-[200px]' : 'max-h-[400px]'}`}>
        {messages.length === 0 ? (
          <div className={`text-center ${emptyText} py-4`}>
            Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="mb-2"
              >
                <div className="flex flex-col">
                  <div className="flex items-baseline mb-1">
                    <span className={`font-semibold text-sm ${messageSenderText} mr-2`}>{message.senderName}</span>
                    <span className={`text-xs ${messageTimestampText}`}>{formatTime(message.timestamp)}</span>
                  </div>
                  <div className={`${messageBg} rounded-lg p-2 break-words max-w-full`}>
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className={`p-3 ${theme === 'vscode' ? 'border-t border-[#3C3C3C]' : 'border-t'}`}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex">
            <input
              type="text"
              className={`flex-grow px-3 py-2 ${inputBg} focus:outline-none focus:ring-1 block w-full text-sm rounded-md border`}
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={handleMessageChange}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <button
              type="submit"
              className={`ml-2 inline-flex justify-center py-2 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${buttonBg} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Gửi
            </button>
          </div>
          <div className={`text-xs mt-1 self-end ${remainingCharsColor}`}>
            Còn lại: {remainingChars} ký tự
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;