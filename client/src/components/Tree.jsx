import React from 'react';
import Round from './Round';

const TournamentBracket = () => {
  return (
    <div className="tournament-container min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Tournament Bracket
      </h1>
      <div className="bracket-wrapper flex justify-center gap-16">
        {/* Left Bracket */}
        <div className="flex flex-row gap-4 left-bracket">
          <Round size={32} desc='Round of 32'></Round>
          <Round size={16} desc='Round of 16'></Round>
          <Round size={8} desc='Quarter-Finals'></Round>
          <Round size={4} desc='Semi-Finals'></Round>
        </div>

        {/* Finals */}
        <div className="finals-column">
          <h3 className="text-white text-center font-semibold mb-4">Finals</h3>
          <div className="match-box w-48 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 p-2 rounded-lg border border-yellow-700">
            <div className="player p-2 border-l-4 border-yellow-500 bg-yellow-900/30 rounded mb-1">
              <div className="flex justify-between items-center">
                <span className="text-white">Winner L</span>
                <span className="text-yellow-400 text-sm">?</span>
              </div>
            </div>
            <div className="player p-2 border-l-4 border-transparent bg-gray-700/30 rounded">
              <div className="flex justify-between items-center">
                <span className="text-white">Winner R</span>
                <span className="text-gray-400 text-sm">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bracket */}
        <div className="flex flex-row gap-4 right-bracket">
        <div className="flex flex-col justify-center round mb-8">
            <h3 className="text-white text-center font-semibold mb-4">Semi-Finals</h3>
            <div className="matches flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={`r1-right-${i}`} className="match-box w-48 bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <div className="player p-2 border-l-4 border-blue-500 bg-gray-700/50 rounded mb-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {32 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">1</span>
                    </div>
                  </div>
                  <div className="player p-2 border-l-4 border-transparent bg-gray-700/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {31 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center round mb-8">
            <h3 className="text-white text-center font-semibold mb-4">Quarter-Finals</h3>
            <div className="matches flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={`r1-right-${i}`} className="match-box w-48 bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <div className="player p-2 border-l-4 border-blue-500 bg-gray-700/50 rounded mb-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {32 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">1</span>
                    </div>
                  </div>
                  <div className="player p-2 border-l-4 border-transparent bg-gray-700/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {31 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center round mb-8">
            <h3 className="text-white text-center font-semibold mb-4">Round of 16</h3>
            <div className="matches flex flex-col gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={`r1-right-${i}`} className="match-box w-48 bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <div className="player p-2 border-l-4 border-blue-500 bg-gray-700/50 rounded mb-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {32 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">1</span>
                    </div>
                  </div>
                  <div className="player p-2 border-l-4 border-transparent bg-gray-700/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {31 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Round of 32 */}
          <div className="round mb-8">
            <h3 className="text-white text-center font-semibold mb-4">Round of 32</h3>
            <div className="matches flex flex-col gap-4">
              {[...Array(16)].map((_, i) => (
                <div key={`r1-right-${i}`} className="match-box w-48 bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <div className="player p-2 border-l-4 border-blue-500 bg-gray-700/50 rounded mb-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {32 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">1</span>
                    </div>
                  </div>
                  <div className="player p-2 border-l-4 border-transparent bg-gray-700/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Player {31 - (i * 2)}</span>
                      <span className="text-gray-400 text-sm">0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;