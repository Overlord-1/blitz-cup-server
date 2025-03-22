import React from 'react';

const TournamentBracket = () => {
  // Hardcoded data for a tournament of 32 participants
  // Split into left and right sides of the bracket
  const leftBracket = [
    {
      name: "Round of 32",
      matches: [
        { player1: { name: "Player 1", seed: 1 }, player2: { name: "Player 32", seed: 32 }, score: "2-0" },
        { player1: { name: "Player 16", seed: 16 }, player2: { name: "Player 17", seed: 17 }, score: "2-1" },
        { player1: { name: "Player 8", seed: 8 }, player2: { name: "Player 25", seed: 25 }, score: "2-0" },
        { player1: { name: "Player 9", seed: 9 }, player2: { name: "Player 24", seed: 24 }, score: "2-1" },
        { player1: { name: "Player 4", seed: 4 }, player2: { name: "Player 29", seed: 29 }, score: "2-0" },
        { player1: { name: "Player 13", seed: 13 }, player2: { name: "Player 20", seed: 20 }, score: "0-2" },
        { player1: { name: "Player 5", seed: 5 }, player2: { name: "Player 28", seed: 28 }, score: "2-0" },
        { player1: { name: "Player 12", seed: 12 }, player2: { name: "Player 21", seed: 21 }, score: "2-1" },
      ]
    },
    {
      name: "Round of 16",
      matches: [
        { player1: { name: "Player 1", seed: 1 }, player2: { name: "Player 16", seed: 16 }, score: "2-0" },
        { player1: { name: "Player 8", seed: 8 }, player2: { name: "Player 9", seed: 9 }, score: "1-2" },
        { player1: { name: "Player 4", seed: 4 }, player2: { name: "Player 20", seed: 20 }, score: "2-0" },
        { player1: { name: "Player 5", seed: 5 }, player2: { name: "Player 12", seed: 12 }, score: "2-1" },
      ]
    },
    {
      name: "Quarter Finals",
      matches: [
        { player1: { name: "Player 1", seed: 1 }, player2: { name: "Player 9", seed: 9 }, score: "2-1" },
        { player1: { name: "Player 4", seed: 4 }, player2: { name: "Player 5", seed: 5 }, score: "0-2" },
      ]
    },
    {
      name: "Semi Finals",
      matches: [
        { player1: { name: "Player 1", seed: 1 }, player2: { name: "Player 5", seed: 5 }, score: "2-0" },
      ]
    },
  ];
  
  const rightBracket = [
    {
      name: "Round of 32",
      matches: [
        { player1: { name: "Player 2", seed: 2 }, player2: { name: "Player 31", seed: 31 }, score: "2-0" },
        { player1: { name: "Player 15", seed: 15 }, player2: { name: "Player 18", seed: 18 }, score: "1-2" },
        { player1: { name: "Player 7", seed: 7 }, player2: { name: "Player 26", seed: 26 }, score: "2-0" },
        { player1: { name: "Player 10", seed: 10 }, player2: { name: "Player 23", seed: 23 }, score: "2-1" },
        { player1: { name: "Player 3", seed: 3 }, player2: { name: "Player 30", seed: 30 }, score: "2-0" },
        { player1: { name: "Player 14", seed: 14 }, player2: { name: "Player 19", seed: 19 }, score: "2-1" },
        { player1: { name: "Player 6", seed: 6 }, player2: { name: "Player 27", seed: 27 }, score: "2-0" },
        { player1: { name: "Player 11", seed: 11 }, player2: { name: "Player 22", seed: 22 }, score: "2-1" },
      ]
    },
    {
      name: "Round of 16",
      matches: [
        { player1: { name: "Player 2", seed: 2 }, player2: { name: "Player 18", seed: 18 }, score: "2-0" },
        { player1: { name: "Player 7", seed: 7 }, player2: { name: "Player 10", seed: 10 }, score: "0-2" },
        { player1: { name: "Player 3", seed: 3 }, player2: { name: "Player 14", seed: 14 }, score: "2-1" },
        { player1: { name: "Player 6", seed: 6 }, player2: { name: "Player 11", seed: 11 }, score: "2-0" },
      ]
    },
    {
      name: "Quarter Finals",
      matches: [
        { player1: { name: "Player 2", seed: 2 }, player2: { name: "Player 10", seed: 10 }, score: "2-0" },
        { player1: { name: "Player 3", seed: 3 }, player2: { name: "Player 6", seed: 6 }, score: "1-2" },
      ]
    },
    {
      name: "Semi Finals",
      matches: [
        { player1: { name: "Player 2", seed: 2 }, player2: { name: "Player 6", seed: 6 }, score: "2-1" },
      ]
    },
  ];
  
  const finals = {
    name: "Finals",
    matches: [
      { player1: { name: "Player 1", seed: 1 }, player2: { name: "Player 2", seed: 2 }, score: "2-1" },
    ]
  };

  return (
    <div className="bg-red-600 tournament-container">
      <h1>Tournament Bracket</h1>
      <div className="bracket-wrapper">
        <div className="bracket-container">
          {/* Left side of bracket */}
          <div className="bracket-side left-bracket">
            {leftBracket.map((round, roundIndex) => (
              <div key={`left-${roundIndex}`} className="round">
                <h3 className="round-title">{round.name}</h3>
                <div className="matches">
                  {round.matches.map((match, matchIndex) => (
                    <div key={`left-${roundIndex}-${matchIndex}`} className="match-container">
                      <div className="match">
                        <div className={`player ${match.score.charAt(0) > match.score.charAt(2) ? 'winner' : ''}`}>
                          <span className="seed">#{match.player1.seed}</span>
                          <span className="name">{match.player1.name}</span>
                          <span className="score">{match.score.charAt(0)}</span>
                        </div>
                        <div className={`player ${match.score.charAt(0) < match.score.charAt(2) ? 'winner' : ''}`}>
                          <span className="seed">#{match.player2.seed}</span>
                          <span className="name">{match.player2.name}</span>
                          <span className="score">{match.score.charAt(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Finals (center) */}
          <div className="finals-bracket">
            <div className="round">
              <h3 className="round-title">{finals.name}</h3>
              <div className="matches">
                {finals.matches.map((match, matchIndex) => (
                  <div key={`finals-${matchIndex}`} className="match-container finals-match">
                    <div className="match">
                      <div className={`player ${match.score.charAt(0) > match.score.charAt(2) ? 'winner champion' : ''}`}>
                        <span className="seed">#{match.player1.seed}</span>
                        <span className="name">{match.player1.name}</span>
                        <span className="score">{match.score.charAt(0)}</span>
                      </div>
                      <div className={`player ${match.score.charAt(0) < match.score.charAt(2) ? 'winner champion' : ''}`}>
                        <span className="seed">#{match.player2.seed}</span>
                        <span className="name">{match.player2.name}</span>
                        <span className="score">{match.score.charAt(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side of bracket */}
          <div className="bracket-side right-bracket">
            {rightBracket.map((round, roundIndex) => (
              <div key={`right-${roundIndex}`} className="round">
                <h3 className="round-title">{round.name}</h3>
                <div className="matches">
                  {round.matches.map((match, matchIndex) => (
                    <div key={`right-${roundIndex}-${matchIndex}`} className="match-container">
                      <div className="match">
                        <div className={`player ${match.score.charAt(0) > match.score.charAt(2) ? 'winner' : ''}`}>
                          <span className="seed">#{match.player1.seed}</span>
                          <span className="name">{match.player1.name}</span>
                          <span className="score">{match.score.charAt(0)}</span>
                        </div>
                        <div className={`player ${match.score.charAt(0) < match.score.charAt(2) ? 'winner' : ''}`}>
                          <span className="seed">#{match.player2.seed}</span>
                          <span className="name">{match.player2.name}</span>
                          <span className="score">{match.score.charAt(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;