import React, { useState, useRef, useEffect } from 'react';

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
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Giới hạn số ký tự
  const MAX_MESSAGE_LENGTH = 100;

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage('');
  };

  // Xử lý khi nhập tin nhắn
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Tính số ký tự còn lại
  const remainingChars = MAX_MESSAGE_LENGTH - newMessage.length;

  return (
    <div className={`bg-white rounded-lg shadow-md flex flex-col ${compact ? 'h-[300px] w-[300px]' : 'h-full'}`}>
      <div className="p-3 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
      </div>
      
      <div className={`flex-grow overflow-y-auto p-3 ${compact ? 'max-h-[200px]' : 'max-h-[400px]'}`}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
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
                    <span className="font-semibold text-sm text-indigo-600 mr-2">{message.senderName}</span>
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 text-gray-800 break-words max-w-full">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex">
            <input
              type="text"
              className="flex-grow px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 block w-full text-sm rounded-md border border-gray-200"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={handleMessageChange}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <button
              type="submit"
              className="ml-2 inline-flex justify-center py-2 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Gửi
            </button>
          </div>
          <div className={`text-xs mt-1 self-end ${remainingChars <= 10 ? 'text-red-500' : 'text-gray-500'}`}>
            Còn lại: {remainingChars} ký tự
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;