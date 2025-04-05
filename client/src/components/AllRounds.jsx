import React from 'react';

const AllRounds = ({ size, desc, matches = [], level, startIndex, participants }) => {
    const findPlayersForMatch = (matchIndex, allMatches) => {
        const currentLevelMatches = allMatches.filter(m => m.level === level);
        const currentMatch = currentLevelMatches.find(m => m.match_number === matchIndex);
        
        if (!currentMatch) {
            return { p1: 'TBD', p2: 'TBD', winner: null };
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
        const prevLevel = level - 1;
        const prevLevelMatches = allMatches.filter(m => m.level === prevLevel);
        const prevMatchIndex = matchIndex * 2;
        
        const prevMatch1 = prevLevelMatches.find(m => m.match_number === prevMatchIndex);
        const prevMatch2 = prevLevelMatches.find(m => m.match_number === prevMatchIndex + 1);

        const player1 = participants?.find(p => p.id === (prevMatch1?.winner || currentMatch.p1));
        const player2 = participants?.find(p => p.id === (prevMatch2?.winner || currentMatch.p2));
        const winner = participants?.find(p => p.id === currentMatch.winner);

        return {
            p1: player1?.cf_handle || 'TBD',
            p2: player2?.cf_handle || 'TBD',
            winner: winner?.cf_handle
        };
    };

    return (
        <div className="flex flex-col-reverse justify-center round max-w-full">
            <div className={`gap-4 space-y-${level === 1 ? '8' : level === 2 ? '12' : '16'}`}>
                {Array.from({ length: size }, (_, i) => {
                    const currentMatchIndex = startIndex - i;
                    const matchData = findPlayersForMatch(currentMatchIndex, matches);
                    const isPlayer1Winner = matchData.winner === matchData.p1;
                    const isPlayer2Winner = matchData.winner === matchData.p2;

                    return (
                        <div 
                            key={`${desc}-${currentMatchIndex}`} 
                            className="flex flex-row-reverse relative w-[280px] bg-[#121212] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#3ECF8E]/5"
                        >
                            {/* Highlight border */}
                            <div className="absolute inset-0 border border-[#1C1C1C] rounded-lg transition-colors duration-300 group-hover:border-[#3ECF8E]/20" />
                            
                            {/* Player 1 */}
                            <div className={`
                                relative p-4 transition-all duration-200
                                ${isPlayer1Winner 
                                    ? 'bg-[#3ECF8E]/[0.02]' 
                                    : 'hover:bg-[#3ECF8E]/[0.01]'}
                            `}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative">
                                            <div className={`
                                                h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300
                                                ${isPlayer1Winner 
                                                    ? 'bg-[#3ECF8E] scale-110' 
                                                    : 'bg-[#6B7280] group-hover:bg-[#3ECF8E]/20'}
                                            `} />
                                            {isPlayer1Winner && (
                                                <div className="absolute inset-0 animate-ping rounded-full bg-[#3ECF8E]/30" />
                                            )}
                                        </div>
                                        <span className={`
                                            text-sm font-medium truncate max-w-[180px]
                                            ${isPlayer1Winner 
                                                ? 'text-[#3ECF8E]' 
                                                : 'text-[#E5E7EB] group-hover:text-white'}
                                        `}>
                                            {matchData.p1 || 'TBD'}
                                        </span>
                                    </div>
                                    {isPlayer1Winner && (
                                        <svg className="w-4 h-4 text-[#3ECF8E] transition-transform duration-200 group-hover:scale-110" 
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M5 13l4 4L19 7" 
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#1C1C1C] to-transparent group-hover:via-[#3ECF8E]/10 transition-colors duration-300" />

                            {/* Player 2 */}
                            <div className={`
                                relative p-4 transition-all duration-200
                                ${isPlayer2Winner 
                                    ? 'bg-[#3ECF8E]/[0.02]' 
                                    : 'hover:bg-[#3ECF8E]/[0.01]'}
                            `}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative">
                                            <div className={`
                                                h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300
                                                ${isPlayer2Winner 
                                                    ? 'bg-[#3ECF8E] scale-110' 
                                                    : 'bg-[#6B7280] group-hover:bg-[#3ECF8E]/20'}
                                            `} />
                                            {isPlayer2Winner && (
                                                <div className="absolute inset-0 animate-ping rounded-full bg-[#3ECF8E]/30" />
                                            )}
                                        </div>
                                        <span className={`
                                            text-sm font-medium truncate max-w-[180px]
                                            ${isPlayer2Winner 
                                                ? 'text-[#3ECF8E]' 
                                                : 'text-[#E5E7EB] group-hover:text-white'}
                                        `}>
                                            {matchData.p2 || 'TBD'}
                                        </span>
                                    </div>
                                    {isPlayer2Winner && (
                                        <svg className="w-4 h-4 text-[#3ECF8E] transition-transform duration-200 group-hover:scale-110" 
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M5 13l4 4L19 7" 
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Match number */}
                            <div className="absolute -top-3 right-3 px-2 py-0.5 bg-[#121212] rounded-md border border-[#1C1C1C] group-hover:border-[#3ECF8E]/20 transition-colors duration-300">
                                <span className="text-xs text-[#6B7280] group-hover:text-[#E5E7EB]">
                                    Match {currentMatchIndex}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <h3 className="text-sm font-medium text-[#6B7280] text-center mb-6 uppercase tracking-wider">{desc}</h3>
        </div>
    );
};

export default AllRounds;