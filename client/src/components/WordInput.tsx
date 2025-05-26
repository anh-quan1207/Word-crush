import React, { useState, useEffect } from 'react';

interface WordInputProps {
  onSubmitWord: (word: string) => void;
  disabled: boolean;
  lastWord: string;
  timeLeft: number;
}

const WordInput: React.FC<WordInputProps> = ({ 
  onSubmitWord, 
  disabled, 
  lastWord,
  timeLeft
}) => {
  const [inputWord, setInputWord] = useState('');
  const [lastWordPart, setLastWordPart] = useState('');
  
  useEffect(() => {
    if (lastWord) {
      const words = lastWord.trim().split(/\s+/);
      setLastWordPart(words[words.length - 1]);
    }
  }, [lastWord]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim()) return;
    
    onSubmitWord(inputWord);
    setInputWord('');
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Lượt của bạn</h3>
        <div className="text-sm font-medium">
          <span className={`${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
            {timeLeft} giây
          </span>
        </div>
      </div>
      
      {lastWord && (
        <div className="bg-yellow-50 p-2 rounded mb-4 text-sm text-gray-700">
          Từ tiếp theo phải bắt đầu bằng: <span className="font-bold text-purple-700">{lastWordPart}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "Chờ lượt của bạn..." : "Nhập từ của bạn..."}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={disabled || !inputWord.trim()}
          className={`px-4 py-2 rounded font-bold ${!disabled && inputWord.trim() ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          Gửi
        </button>
      </form>
    </div>
  );
};

export default WordInput; 