import React from 'react';

const AllRounds = ({ size, desc, matches = [], level, startIndex, participants }) => {
    const findPlayersForMatch = (matchIndex, allMatches) => {
        // Get matches for current and previous levels
        const currentLevelMatches = allMatches.filter(m => m.level === level);
        const prevLevelMatches = allMatches.filter(m => m.level === level - 1);

        // Get the current match
        const currentMatch = currentLevelMatches.find(m => m.match_number === matchIndex);
        
        if (!currentMatch) {
            return {
                p1: 'TBD',
                p2: 'TBD',
                winner: null
            };
        }

        if (level === 1) {
            const player1 = participants?.find(p => p.id === currentMatch.p1);
            const player2 = participants?.find(p => p.id === currentMatch.p2);
            const winner = participants?.find(p => p.id === currentMatch.winner);
            
            return {
                p1: player1?.cf_handle || 'TBD',
                p2: player2?.cf_handle || 'TBD',
                winner: winner?.cf_handle
            };
        }

        // For higher levels, find the previous matches that feed into this one
        const prevMatch1 = prevLevelMatches.find(m => m.match_number === matchIndex * 2);
        const prevMatch2 = prevLevelMatches.find(m => m.match_number === matchIndex * 2 + 1);

        // Get winners from previous matches
        const player1 = participants?.find(p => p.id === prevMatch1?.winner);
        const player2 = participants?.find(p => p.id === prevMatch2?.winner);
        const winner = participants?.find(p => p.id === currentMatch.winner);

        return {
            p1: player1?.cf_handle || 'TBD',
            p2: player2?.cf_handle || 'TBD',
            winner: winner?.cf_handle
        };
    };

    return (
        <div className="flex flex-col-reverse justify-center round mb-4">
            <h3 className="text-white text-center font-semibold mb-2 text-sm">{desc}</h3>
            {Array.from({ length: size }, (_, i) => {
                // Calculate match number for this position
                const currentMatchIndex = startIndex - i;
                // console.log(`Level ${level}, Index ${currentMatchIndex}`); // Debug log
                
                const matchData = findPlayersForMatch(currentMatchIndex, matches);
                
                const isPlayer1Winner = matchData.winner === matchData.p1;
                const isPlayer2Winner = matchData.winner === matchData.p2;

                return (
                    <div key={`${desc}-${currentMatchIndex}`} className="match-box w-36 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
                        <div className={`player p-1.5 border-l-4 rounded mb-1 ${
                            isPlayer1Winner 
                                ? 'border-green-500 bg-green-900/50' 
                                : 'border-blue-500 bg-gray-700/50'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-white text-sm truncate max-w-[120px]">
                                    {matchData.p1}
                                </span>
                            </div>
                        </div>
                        <div className={`player p-1.5 border-l-4 rounded ${
                            isPlayer2Winner 
                                ? 'border-green-500 bg-green-900/50' 
                                : 'border-transparent bg-gray-700/30'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-white text-sm truncate max-w-[120px]">
                                    {matchData.p2}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AllRounds;