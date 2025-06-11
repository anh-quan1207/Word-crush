import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleButtonProps {
  className?: string;
}

const ThemeToggleButton = ({ className = '' }: ThemeToggleButtonProps) => {
  const { theme, toggleTheme } = useTheme();
  
  // Thiết lập style và nội dung cho từng theme
  let buttonStyle = '';
  let icon = '';
  let label = '';
  
  if (theme === 'pink') {
    buttonStyle = 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 border-purple-300';
    icon = '🌸';
    label = 'Hồng';
  } else {
    buttonStyle = 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border-gray-600';
    icon = '🌙';
    label = 'Tối';
  }
  
  return (
    <button 
      onClick={toggleTheme}
      className={`px-2.5 py-1.5 text-sm rounded-md transition-all border text-white shadow-md ${buttonStyle} ${className}`}
      title="Nhấn để đổi theme"
      aria-label="Chuyển đổi theme"
    >
      <div className="flex items-center justify-center">
        <span className="mr-1">{icon}</span>
        <span className="font-medium text-xs">{label}</span>
      </div>
    </button>
  );
};

export default ThemeToggleButton; 