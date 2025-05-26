import React from 'react';

interface Player {
  id: string;
  name: string;
  loseCount: number;
}

interface PlayersListProps {
  players: Player[];
  hostId?: string;
  currentPlayerId?: string;
  scores?: Player[];
}

function PlayersList({ players, hostId, currentPlayerId, scores }: PlayersListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-purple-50 border-b">
        <h3 className="text-lg font-semibold text-purple-800">Người chơi ({players.length})</h3>
      </div>
      
      <div className="p-2">
        {players.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Chưa có người chơi nào tham gia
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {players.map((player) => (
              <li 
                key={player.id} 
                className={`py-3 px-2 flex items-center justify-between ${currentPlayerId === player.id ? 'bg-green-50' : ''}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 font-medium">
                    {player.name}
                    {player.id === hostId && (
                      <span className="ml-2 text-yellow-500" title="Chủ phòng">👑</span>
                    )}
                    {currentPlayerId === player.id && (
                      <span className="ml-2 text-green-500" title="Đang đánh">🎮</span>
                    )}
                  </span>
                </div>
                {scores ? (
                  <span className="text-sm text-red-500">
                    {scores.find(s => s.id === player.id)?.loseCount || 0} thua
                  </span>
                ) : (
                  player.loseCount > 0 && (
                    <span className="text-sm text-red-500">{player.loseCount} thua</span>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PlayersList; 