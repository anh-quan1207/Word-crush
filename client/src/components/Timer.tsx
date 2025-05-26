import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  seconds: number;
  isActive: boolean;
  onTimeout: () => void;
}

function Timer({ seconds, isActive, onTimeout }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cập nhật thời gian khi seconds thay đổi
    setTimeLeft(seconds);
  }, [seconds]);

  // Tính toán màu sắc dựa trên thời gian còn lại
  const getTimerColor = () => {
    if (timeLeft > 20) return 'bg-green-600';
    if (timeLeft > 10) return 'bg-yellow-500';
    return 'bg-white text-red-600 border-2 border-red-600 font-extrabold';
  };

  // Thêm lớp nếu đang đến lượt người chơi
  const getActiveClass = () => {
    return isActive ? 'ring-2 ring-offset-2 ring-blue-500' : '';
  };

  return (
    <div className="flex items-center">
      <div className="text-gray-700 mr-2">Thời gian:</div>
      <div className={`${getTimerColor()} ${getActiveClass()} font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300`}>
        {timeLeft}
      </div>
    </div>
  );
}

export default Timer; 