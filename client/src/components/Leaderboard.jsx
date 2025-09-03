import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../config/backendURL';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'stage', direction: 'descending' });

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      // Get all matches
      const matchesResponse = await axios.get(`${backendURL}/game/get-matches`);
      const matches = matchesResponse.data;

      // Get all participants
      const participantsResponse = await axios.get(`${backendURL}/game/get-participants`);
      const { users } = participantsResponse.data;

      // Process data to create leaderboard
      const playerStats = processMatchData(matches, users);
      setPlayers(playerStats);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Leaderboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processMatchData = (matches, users) => {
    const playerProgress = users.reduce((acc, user) => {
      acc[user.id] = {
        id: user.id,
        handle: user.cf_handle,
        stage: 0,
        matches: 0,
        wins: 0
      };
      return acc;
    }, {});

    matches.forEach(match => {
      if (match.p1) {
        playerProgress[match.p1].matches++;
        if (match.winner === match.p1) {
          playerProgress[match.p1].wins++;
          playerProgress[match.p1].stage = Math.max(playerProgress[match.p1].stage, match.level);
        }
      }
      if (match.p2) {
        playerProgress[match.p2].matches++;
        if (match.winner === match.p2) {
          playerProgress[match.p2].wins++;
          playerProgress[match.p2].stage = Math.max(playerProgress[match.p2].stage, match.level);
        }
      }
    });

    return Object.values(playerProgress)
      .sort((a, b) => b.stage - a.stage || b.wins - a.wins);
  };

  const getStageLabel = (stage) => {
    switch (stage) {
      case 5: return 'Finals';
      case 4: return 'Semi-Finals';
      case 3: return 'Quarter-Finals';
      case 2: return 'Round of 16';
      case 1: return 'Round of 32';
      default: return 'Not Started';
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedPlayers = [...players].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setPlayers(sortedPlayers);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const filteredPlayers = players.filter(player =>
    player.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen bg-gray-950">
      <h1 className="text-3xl font-bold text-center mb-4 text-emerald-400">Tournament Progress</h1>
      
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by handle..."
          className="p-2 w-1/2 bg-gray-900 border border-emerald-500/20 rounded-md text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-emerald-500/20 rounded-lg overflow-hidden">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-4 cursor-pointer text-emerald-400" onClick={() => requestSort('handle')}>
                Player Handle{getSortIndicator('handle')}
              </th>
              <th className="p-4 cursor-pointer text-emerald-400" onClick={() => requestSort('stage')}>
                Highest Stage{getSortIndicator('stage')}
              </th>
              <th className="p-4 cursor-pointer text-emerald-400" onClick={() => requestSort('wins')}>
                Wins{getSortIndicator('wins')}
              </th>
              <th className="p-4 cursor-pointer text-emerald-400" onClick={() => requestSort('matches')}>
                Matches Played{getSortIndicator('matches')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, index) => (
              <tr key={player.id} className="border-t border-emerald-500/20 bg-gray-900/50">
                <td className="p-4 text-white">{player.handle}</td>
                <td className="p-4 text-emerald-400">{getStageLabel(player.stage)}</td>
                <td className="p-4 text-white">{player.wins}</td>
                <td className="p-4 text-white">{player.matches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;