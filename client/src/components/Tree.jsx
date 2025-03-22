import React from 'react';
import Round from './Round';

const TournamentBracket = () => {
  return (
    <div className="tournament-container min-h-screen bg-gray-900 p-4 overflow-x-auto">
      <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Tournament Bracket
      </h1>
      <div className="bracket-wrapper flex items-center justify-center min-w-fit">
        {/* Left Bracket */}
        <div className="flex flex-row gap-2 left-bracket">
          <Round size={8} desc='R32'></Round>
          <Round size={4} desc='R16'></Round>
          <Round size={2} desc='QF'></Round>
          <Round size={1} desc='SF'></Round>
        </div>

        {/* Finals */}
        <div className="finals-column mx-4 self-center mt-32">
          <h3 className="text-white text-center font-semibold mb-4">Finals</h3>
          <div className="match-box w-40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 p-2 rounded-lg border border-yellow-700">
            <div className="player p-2 border-l-4 border-yellow-500 bg-yellow-900/30 rounded mb-1">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Winner L</span>
                <span className="text-yellow-400 text-sm">?</span>
              </div>
            </div>
            <div className="player p-2 border-l-4 border-transparent bg-gray-700/30 rounded">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Winner R</span>
                <span className="text-gray-400 text-sm">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bracket */}
        <div className="flex flex-row gap-2 right-bracket">
          <Round size={1} desc='SF'></Round>
          <Round size={2} desc='QF'></Round>
          <Round size={4} desc='R16'></Round>
          <Round size={8} desc='R32'></Round>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;