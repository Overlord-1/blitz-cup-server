import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Round from './Round';
import BlitzAnimation from './BlitzAnimation';
import { backendURL } from '../config/backendURL';

const TournamentBracket = () => {
  const [participants, setParticipants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchTournamentData = async () => {
    try {
      // Get matches data
      const matchesResponse = await axios.get(`${backendURL}/game/get-matches`);
      const matchesData = matchesResponse.data;  // Now it's already an array and sorted
  
      // Get participants data
      const participantsResponse = await axios.get(`${backendURL}/game/get-participants`);
      const { users } = participantsResponse.data;
  
      const orderedParticipants = [];
      matchesData.forEach(match => {
        if (match.p1 && match.p2) {  // Only add if players are assigned
          const player1 = users.find(u => u.id === match.p1);
          const player2 = users.find(u => u.id === match.p2);
          if (player1) orderedParticipants.push(player1);
          if (player2) orderedParticipants.push(player2);
        }
      });
  
      if (orderedParticipants.length !== 32) {
        throw new Error('Need exactly 32 participants to start the tournament');
      }
  
      setParticipants(orderedParticipants);
      localStorage.setItem('tournamentParticipants', JSON.stringify(orderedParticipants));
    } catch (err) {
      setError(err.message || 'Failed to fetch tournament data');
      console.error('Tournament data fetch error:', err);
    }
  };

  useEffect(() => {
    const isStarted = localStorage.getItem('gameStarted');
    const savedParticipants = localStorage.getItem('tournamentParticipants');

    if (isStarted && savedParticipants) {
      setParticipants(JSON.parse(savedParticipants));
    }
  }, []);

  const initializeTournament = async () => {
    setLoading(true);
    setError(null);
    setIsAnimating(true);
    
    try {
      // Show animation for 2 seconds before making API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await axios.post(`${backendURL}/game/start-game`, { round: 1 });
      await fetchTournamentData();
      localStorage.setItem('gameStarted', 'true');
    } catch (err) {
      setError(err.message || 'Failed to initialize tournament');
      console.error('Tournament initialization error:', err);
    } finally {
      setIsAnimating(false);
      setLoading(false);
    }
  };

  const resetTournament = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('gameStarted');
      localStorage.removeItem('tournamentParticipants');
      setParticipants(null);
      await axios.get(`${backendURL}/game/reset-game`);
    } catch (err) {
      setError(err.message || 'Failed to reset tournament');
      console.error('Tournament reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!participants) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent mb-6">Initialize Tournament</h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {isAnimating ? (
          <BlitzAnimation />
        ) : (
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
        )}
      </div>
    );
  }

  return (
    <div className="tournament-container min-h-screen bg-gray-900 p-4 overflow-x-auto rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Tournament Bracket
        </h1>
        <button
          onClick={resetTournament}
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg font-semibold
            ${loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 cursor-pointer'
            }
            text-white transition-colors
          `}
        >
          {loading ? 'Resetting...' : 'Reset Tournament'}
        </button>
      </div>
      
      <div className="bracket-wrapper flex items-center justify-center min-w-fit">
        {/* Left Bracket */}
        <div className="flex flex-row gap-2 left-bracket">
          <Round size={8} desc='R32' players={participants.slice(0, 16)} />
          <Round size={4} desc='R16' />
          <Round size={2} desc='QF' />
          <Round size={1} desc='SF' />
        </div>

        {/* Finals */}
        <div className="finals-column mx-8 self-center -mt-4">
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
          <Round size={1} desc='SF' />
          <Round size={2} desc='QF' />
          <Round size={4} desc='R16' />
          <Round size={8} desc='R32' players={participants.slice(16, 32)} />
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;