import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Round from './Round';
import AllRounds from './AllRounds';
import BlitzAnimation from './BlitzAnimation';
import { backendURL } from '../config/backendURL';

const TournamentBracket = () => {
  const [participants, setParticipants] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tournamentStatus, setTournamentStatus] = useState(false);

  // Add fetchMatches function to get updated match data
  const fetchMatches = useCallback(async () => {
    try {
      const matchesResponse = await axios.get(`${backendURL}/game/get-matches`);
      const newMatches = matchesResponse.data;
      setMatches(newMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  }, []);

  // Modified fetchTournamentData to include matches
  const fetchTournamentData = async () => {
    try {
      // Get matches data
      const matchesResponse = await axios.get(`${backendURL}/game/get-matches`);
      const matchesData = matchesResponse.data;
      setMatches(matchesData);
  
      // Get participants data
      const participantsResponse = await axios.get(`${backendURL}/game/get-participants`);
      const { users } = participantsResponse.data;
  
      const orderedParticipants = [];
      matchesData.forEach(match => {
        if (match.p1 && match.p2) {
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
    } catch (err) {
      setError(err.message || 'Failed to fetch tournament data');
      console.error('Tournament data fetch error:', err);
    }
  };

  useEffect(() => {
    const checkTournamentStatus = async () => {
      try {
        const response = await axios.get(`${backendURL}/game/get-tournament-status`);
        const { status } = response.data;
        setTournamentStatus(status);
        
        if (status) {
          await fetchTournamentData();
        }
      } catch (err) {
        console.error('Error checking tournament status:', err);
        setError('Failed to check tournament status');
      } finally {
        setLoading(false);
      }
    };

    checkTournamentStatus();
  }, []);

  // Add polling effect
  useEffect(() => {
    let pollInterval;
    
    if (tournamentStatus && participants) {
      pollInterval = setInterval(fetchMatches, 100000); // Poll every minute
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [tournamentStatus, participants, fetchMatches]);

  const initializeTournament = async () => {
    setLoading(true);
    setError(null);
    setIsAnimating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await axios.post(`${backendURL}/game/start-game`, { round: 1 });
      await fetchTournamentData();
      setTournamentStatus(true);
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
      setParticipants(null);
      setMatches([]);
      await axios.get(`${backendURL}/game/reset-game`);
      setTournamentStatus(false);
    } catch (err) {
      setError(err.message || 'Failed to reset tournament');
      console.error('Tournament reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!tournamentStatus || !participants) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent mb-6">
          Initialize Tournament
        </h2>
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
      {/* ... header section ... */}
      <button
            onClick={resetTournament}
            className={`
              px-6 py-3 rounded-lg font-semibold
              ${loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }
              text-white transition-colors
            `}
          >
          Reset Tournament
          </button>
      <div className="bracket-wrapper flex items-center justify-center min-w-fit">
        {/* Left Bracket */}
        <div className="flex flex-row gap-2 left-bracket">
          <Round 
            size={8} 
            desc='R32' 
            players={participants.slice(16, 32)} 
            matches={matches.filter(m => m.level === 1).slice(0, 8)}
          />
          <AllRounds 
            size={4} 
            desc='R16' 
            matches={matches.filter(m => m.level === 2).slice(0, 4)}
          />
          <AllRounds 
            size={2} 
            desc='QF' 
            matches={matches.filter(m => m.level === 3).slice(0, 2)}
          />
          <AllRounds 
            size={1} 
            desc='SF' 
            matches={matches.filter(m => m.level === 4).slice(0, 1)}
          />
        </div>

        {/* Finals section */}
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
          <AllRounds 
            size={1} 
            desc='SF'
            matches={matches.filter(m => m.level === 4).slice(1, 2)}
          />
          <AllRounds 
            size={2} 
            desc='QF'
            matches={matches.filter(m => m.level === 3).slice(2, 4)}
          />
          <AllRounds 
            size={4} 
            desc='R16'
            matches={matches.filter(m => m.level === 2).slice(4, 8)}
          />
          <Round 
            size={8} 
            desc='R32' 
            players={participants.slice(0, 16)}
            matches={matches.filter(m => m.level === 1).slice(8, 16)}
          />
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;