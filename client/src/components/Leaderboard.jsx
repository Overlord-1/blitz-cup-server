import React, { useState } from 'react';

const Leaderboard = () => {
  // Hardcoded data for leaderboard
  const [players, setPlayers] = useState([
    { id: 1, rank: 1, name: "Player 1", handle: "coder123", rating: 2845, wins: 28, losses: 4, winRate: "87.5%" },
    { id: 2, rank: 2, name: "Player 2", handle: "algorithm_master", rating: 2792, wins: 24, losses: 6, winRate: "80.0%" },
    { id: 3, rank: 3, name: "Player 3", handle: "cpp_wizard", rating: 2753, wins: 22, losses: 7, winRate: "75.9%" },
    { id: 4, rank: 4, name: "Player 4", handle: "dynamic_coder", rating: 2711, wins: 21, losses: 8, winRate: "72.4%" },
    { id: 5, rank: 5, name: "Player 5", handle: "pythonista", rating: 2685, wins: 20, losses: 9, winRate: "69.0%" },
    { id: 6, rank: 6, name: "Player 6", handle: "graph_theory", rating: 2650, wins: 19, losses: 10, winRate: "65.5%" },
    { id: 7, rank: 7, name: "Player 7", handle: "binary_search", rating: 2623, wins: 18, losses: 11, winRate: "62.1%" },
    { id: 8, rank: 8, name: "Player 8", handle: "swift_dev", rating: 2601, wins: 17, losses: 11, winRate: "60.7%" },
    { id: 9, rank: 9, name: "Player 9", handle: "java_coder", rating: 2575, wins: 17, losses: 12, winRate: "58.6%" },
    { id: 10, rank: 10, name: "Player 10", handle: "sorting_algo", rating: 2549, wins: 16, losses: 13, winRate: "55.2%" },
    { id: 11, rank: 11, name: "Player 11", handle: "dp_master", rating: 2520, wins: 15, losses: 14, winRate: "51.7%" },
    { id: 12, rank: 12, name: "Player 12", handle: "competitive_dev", rating: 2498, wins: 14, losses: 15, winRate: "48.3%" },
    { id: 13, rank: 13, name: "Player 13", handle: "segment_tree", rating: 2470, wins: 13, losses: 15, winRate: "46.4%" },
    { id: 14, rank: 14, name: "Player 14", handle: "functional_prog", rating: 2445, wins: 13, losses: 16, winRate: "44.8%" },
    { id: 15, rank: 15, name: "Player 15", handle: "bit_manipulator", rating: 2412, wins: 12, losses: 17, winRate: "41.4%" },
  ]);

  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedPlayers = [...players].sort((a, b) => {
      if (a[key] < b[key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
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

  return (
    <div className="flex flex-col gap-4 leaderboard-container">
      <h1>Codeforces Blitz Leaderboard</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by player name or handle..."
          className="search-input"
        />
      </div>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('rank')}>
              Rank{getSortIndicator('rank')}
            </th>
            <th onClick={() => requestSort('name')}>
              Player{getSortIndicator('name')}
            </th>
            <th onClick={() => requestSort('handle')}>
              Handle{getSortIndicator('handle')}
            </th>
            <th onClick={() => requestSort('rating')}>
              Rating{getSortIndicator('rating')}
            </th>
            <th onClick={() => requestSort('wins')}>
              Wins{getSortIndicator('wins')}
            </th>
            <th onClick={() => requestSort('losses')}>
              Losses{getSortIndicator('losses')}
            </th>
            <th onClick={() => requestSort('winRate')}>
              Win Rate{getSortIndicator('winRate')}
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>{player.rank}</td>
              <td>{player.name}</td>
              <td className="handle">{player.handle}</td>
              <td className="rating">{player.rating}</td>
              <td>{player.wins}</td>
              <td>{player.losses}</td>
              <td>{player.winRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="pagination-button">Previous</button>
        <span className="page-info">Page 1 of 3</span>
        <button className="pagination-button">Next</button>
      </div>
    </div>
  );
};

export default Leaderboard;