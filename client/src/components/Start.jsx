import React, { useState } from 'react';

const Start = () => {
  const [currentRound, setCurrentRound] = useState("Round of 32");
  const [selectedPlayer1, setSelectedPlayer1] = useState("");
  const [selectedPlayer2, setSelectedPlayer2] = useState("");
  
  // Hardcoded round options
  const rounds = [
    "Round of 32",
    "Round of 16",
    "Quarter Finals",
    "Semi Finals",
    "Finals"
  ];
  
  // Hardcoded player options
  const players = [
    { id: 1, name: "Player 1", handle: "coder123", seed: 1 },
    { id: 2, name: "Player 2", handle: "algorithm_master", seed: 2 },
    { id: 3, name: "Player 3", handle: "cpp_wizard", seed: 3 },
    { id: 4, name: "Player 4", handle: "dynamic_coder", seed: 4 },
    { id: 5, name: "Player 5", handle: "pythonista", seed: 5 },
    { id: 6, name: "Player 6", handle: "graph_theory", seed: 6 },
    { id: 7, name: "Player 7", handle: "binary_search", seed: 7 },
    { id: 8, name: "Player 8", handle: "swift_dev", seed: 8 },
    { id: 9, name: "Player 9", handle: "java_coder", seed: 9 },
    { id: 10, name: "Player 10", handle: "sorting_algo", seed: 10 },
    // Add more players as needed
  ];
  
  const handleStartMatch = () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      alert("Please select both players before starting the match.");
      return;
    }
    
    if (selectedPlayer1 === selectedPlayer2) {
      alert("Cannot start a match with the same player. Please select two different players.");
      return;
    }
    
    // In a real application, you would call your backend API here
    alert(`Starting match: ${selectedPlayer1} vs ${selectedPlayer2} in ${currentRound}`);
  };
  
  return (
    <div className="match-starter-container">
      <h1>Start a New Match</h1>
      
      <div className="match-form">
        <div className="form-group">
          <label>Round:</label>
          <select 
            value={currentRound}
            onChange={(e) => setCurrentRound(e.target.value)}
            className="select-input"
          >
            {rounds.map((round, index) => (
              <option key={index} value={round}>{round}</option>
            ))}
          </select>
        </div>
        
        <div className="players-container">
          <div className="player-select">
            <h3>Player 1</h3>
            <select 
              value={selectedPlayer1}
              onChange={(e) => setSelectedPlayer1(e.target.value)}
              className="select-input"
            >
              <option value="">Select Player 1</option>
              {players.map((player) => (
                <option key={player.id} value={player.name}>
                  {player.name} ({player.handle}) - Seed #{player.seed}
                </option>
              ))}
            </select>
          </div>
          
          <div className="vs-indicator">VS</div>
          
          <div className="player-select">
            <h3>Player 2</h3>
            <select 
              value={selectedPlayer2}
              onChange={(e) => setSelectedPlayer2(e.target.value)}
              className="select-input"
            >
              <option value="">Select Player 2</option>
              {players.map((player) => (
                <option key={player.id} value={player.name}>
                  {player.name} ({player.handle}) - Seed #{player.seed}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="match-settings">
          <h3>Match Settings</h3>
          <div className="form-group">
            <label>Time Limit (minutes):</label>
            <input type="number" defaultValue={120} min={5} className="number-input" />
          </div>
          <div className="form-group">
            <label>Number of Problems:</label>
            <input type="number" defaultValue={5} min={1} max={10} className="number-input" />
          </div>
        </div>
        
        <button onClick={handleStartMatch} className="start-button">
          Start Match
        </button>
      </div>
      
      <div className="upcoming-matches">
        <h2>Upcoming Matches</h2>
        <table className="matches-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Player 1</th>
              <th>Player 2</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Round of 16</td>
              <td>Player 3 (cpp_wizard)</td>
              <td>Player 14 (functional_prog)</td>
              <td>Scheduled</td>
            </tr>
            <tr>
              <td>Round of 16</td>
              <td>Player 6 (graph_theory)</td>
              <td>Player 11 (dp_master)</td>
              <td>Scheduled</td>
            </tr>
            <tr>
              <td>Quarter Finals</td>
              <td>Player 1 (coder123)</td>
              <td>Player 9 (java_coder)</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Start;