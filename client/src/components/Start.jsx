import React, { useState } from 'react';
import axios from 'axios';
import { backendURL } from '../config/backendURL';

const Start = () => {
  const [selectedRound, setSelectedRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState(null);

  const rounds = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleGetMatch = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/game/get-match`, {
        round: selectedRound
      });
      setMatch(response.data);
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = () => {
    // Handle starting the match here
    console.log('Starting match:', match);
  };

  return (
    <div className="min-h-screen bg-[#242424] p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#2a2a2a] rounded-lg p-4 sm:p-6 shadow-lg border border-[#646cff]/20">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white">Select Match Round</h2>
          
          <div className="space-y-6">
            <div className="relative">
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="w-full bg-[#1a1a1a] border border-[#646cff]/30 text-white rounded-lg px-4 py-2 
                         appearance-none focus:outline-none focus:border-[#646cff] transition-colors"
              >
                {rounds.map((round) => (
                  <option key={round} value={round} className="bg-[#1a1a1a]">
                    Round {round}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#646cff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              onClick={handleGetMatch}
              disabled={loading}
              className="w-full bg-[#646cff] text-white font-medium py-2 px-4 rounded-lg
                       hover:bg-[#646cff]/90 transition-colors disabled:opacity-50"
            >
              {loading && (
                <svg className="animate-spin inline-block mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              )}
              {loading ? 'Finding Match...' : 'Get Next Match'}
            </button>
          </div>
        </div>

        {match && (
          <div className="mt-4 sm:mt-6 bg-[#2a2a2a] rounded-lg p-4 sm:p-8 shadow-lg border border-[#646cff]/20">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-white text-center">Match Details</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-center w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#1a1a1a] rounded-lg border border-[#646cff]/30">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#646cff] to-[#8f95ff] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(100,108,255,0.3)]">
                  {match.player1.cf_handle}
                </span>
              </div>
              <div className="px-4">
                <span className="text-xl sm:text-2xl font-bold text-[#646cff]">VS</span>
              </div>
              <div className="text-center w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#1a1a1a] rounded-lg border border-[#646cff]/30">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#646cff] to-[#8f95ff] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(100,108,255,0.3)]">
                  {match.player2.cf_handle}
                </span>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={handleStartMatch}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#646cff] text-white font-medium rounded-lg
                         hover:bg-[#646cff]/90 transition-colors transform hover:scale-105"
              >
                Start Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Start;