import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Player {
  id: string;
  name: string;
  loseCount: number;
  isBackToRoom?: boolean;
}

interface PlayersListProps {
  players: Player[];
  hostId?: string;
}

function PlayersList({ players, hostId }: PlayersListProps) {
  const { theme } = useTheme();
  
  // Xác định màu sắc dựa trên theme
  const containerBg = theme === 'vscode' 
    ? 'bg-[#2D2D2D] border border-[#3C3C3C]' 
    : 'bg-white';
    
  const headerBg = theme === 'vscode'
    ? 'bg-[#37373D] border-b border-[#3C3C3C]'
    : 'bg-purple-50 border-b';
    
  const headerText = theme === 'vscode'
    ? 'text-blue-300'
    : 'text-purple-800';
    
  const dividerColor = theme === 'vscode'
    ? 'divide-[#3C3C3C]'
    : 'divide-gray-200';
    
  const emptyText = theme === 'vscode'
    ? 'text-gray-400'
    : 'text-gray-500';
    
  const avatarBg = theme === 'vscode'
    ? 'bg-gradient-to-r from-blue-700 to-blue-900'
    : 'bg-gradient-to-r from-purple-400 to-indigo-500';

  return (
    <div className={`${containerBg} rounded-lg shadow-md overflow-hidden`}>
      <div className={`p-4 ${headerBg}`}>
        <h3 className={`text-lg font-semibold ${headerText}`}>
          Người chơi ({players.length})
        </h3>
      </div>
      
      <div className="p-2">
        {players.length === 0 ? (
          <div className={`text-center ${emptyText} py-4`}>
            Chưa có người chơi nào tham gia
          </div>
        ) : (
          <ul className={`divide-y ${dividerColor}`}>
            {players.map((player) => (
              <li key={player.id} className="py-3 px-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`ml-3 font-medium ${theme === 'vscode' ? 'text-gray-200' : ''}`}>
                    {player.name}
                    {player.id === hostId && (
                      <span className="ml-2 text-yellow-500" title="Chủ phòng">👑</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  {player.loseCount > 0 && (
                    <span className={`text-sm ${theme === 'vscode' ? 'text-red-400' : 'text-red-500'} mr-2`}>{player.loseCount} thua</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PlayersList; 