import React from 'react';

const Round = ({ size, desc, players = [], matches = [] }) => {
  return (
    <div className="flex flex-col justify-center round mb-4">
      <h3 className="text-white text-center font-semibold mb-2 text-lg">{desc}</h3>
      <div className="matches flex flex-col gap-2">
        {[...Array(size)].map((_, i) => {
          const player1 = players[i * 2];
          const player2 = players[i * 2 + 1];
          const match = matches[i];
          
          const isPlayer1Winner = match?.winner === player1?.id;
          const isPlayer2Winner = match?.winner === player2?.id;

          return (
            <div key={`${desc}-${i}`} className="match-box w-36 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
              <div 
                className={`player p-1.5 border-l-4 rounded mb-1 ${
                  isPlayer1Winner 
                    ? 'border-green-500 bg-green-900/50' 
                    : 'border-blue-500 bg-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg truncate max-w-[120px]">
                    {player1?.cf_handle || `P${i * 2 + 1}`}
                  </span>
                </div>
              </div>
              <div 
                className={`player p-1.5 border-l-4 rounded ${
                  isPlayer2Winner 
                    ? 'border-green-500 bg-green-900/50' 
                    : 'border-transparent bg-gray-700/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg truncate max-w-[120px]">
                    {player2?.cf_handle || `P${i * 2 + 2}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Round;