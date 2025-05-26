import React from 'react';

interface WordChainProps {
  words: string[];
}

const WordChain: React.FC<WordChainProps> = ({ words }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Chuỗi từ</h3>
      
      {words.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-2">
            {words.map((word, index) => (
              <div 
                key={index} 
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100"
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-500 italic flex justify-center items-center min-h-[60px] bg-white p-4 rounded-lg shadow-sm">
          Chưa có từ nào
        </div>
      )}
    </div>
  );
};

export default WordChain; 