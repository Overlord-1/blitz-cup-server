import React, { useState } from 'react';
import axios from 'axios';
import Round from './Round';
import { backendURL } from '../config/backendURL';

const TournamentBracket = () => {
  const [participants, setParticipants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeTournament = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${backendURL}/game/initialize-tournament`);
      const { participants: fetchedParticipants } = response.data;
      
      if (!fetchedParticipants || fetchedParticipants.length !== 32) {
        throw new Error('Need exactly 32 participants to start the tournament');
      }

      setParticipants(fetchedParticipants);
    } catch (err) {
      setError(err.message || 'Failed to initialize tournament');
      console.error('Tournament initialization error:', err);
    } finally {
      setLoading(false);
    }
  };
  console.log(participants)
  if (!participants) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <h2 className="text-2xl font-bold text-white mb-6">Initialize Tournament</h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}
        <button
          onClick={initializeTournament}
          disabled={loading}
          className={`
            px-6 py-3 rounded-lg font-semibold
            ${loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }
            text-white transition-colors
          `}
        >
          {loading ? 'Initializing...' : 'Start Tournament'}
        </button>
      </div>
    );
  }

  return (
    <div className="tournament-container min-h-screen bg-gray-900 p-4 overflow-x-auto rounded-lg">
      <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Tournament Bracket
      </h1>
      <div className="bracket-wrapper flex items-center justify-center min-w-fit">
        {/* Left Bracket */}
        <div className="flex flex-row gap-2 left-bracket">
          <Round size={8} desc='R32' players={participants.slice(0, 16)}></Round>
          <Round size={4} desc='R16'></Round>
          <Round size={2} desc='QF'></Round>
          <Round size={1} desc='SF'></Round>
        </div>

        {/* Finals */}
        <div className="finals-column mx-8 self-center mt-32">
          <h3 className="text-white text-center font-semibold mb-2">Finals</h3>
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
          <Round size={8} desc='R32' players={participants.slice(16, 32)}></Round>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;