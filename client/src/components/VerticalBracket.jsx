import React from 'react';
import { motion } from 'framer-motion';

const VerticalBracket = ({ matches, participants }) => {
    const getRoundMatches = (roundNumber) => {
        return matches
            .filter(match => Math.ceil(Math.log2(32/match.level)) === roundNumber)
            .sort((a, b) => a.match_number - b.match_number);
    };

    const getPlayerName = (playerId) => {
        const player = participants.find(p => p.id === playerId);
        return player ? player.cf_handle : 'TBD';
    };

    const rounds = [
        { name: 'Round of 32', number: 5 },
        { name: 'Round of 16', number: 4 },
        { name: 'Quarter Finals', number: 3 },
        { name: 'Semi Finals', number: 2 },
        { name: 'Finals', number: 1 }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8 p-4 md:p-8 w-full max-w-6xl mx-auto"
        >
            {rounds.map(({ name, number }) => (
                <motion.div 
                    key={number}
                    variants={item}
                    className="w-full"
                >
                    <h3 className="text-2xl md:text-3xl font-medium text-[#3ECF8E] mb-4">{name}</h3>
                    <div className="grid gap-4">
                        {getRoundMatches(number).map((match) => {
                            const player1Name = getPlayerName(match.p1);
                            const player2Name = getPlayerName(match.p2);
                            const isPlayer1Winner = match.winner === match.p1 && match.winner !== null;
                            const isPlayer2Winner = match.winner === match.p2 && match.winner !== null;

                            return (
                                <motion.div
                                    key={match.match_number}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-lg border border-[#1C1C1C] bg-[#121212]"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-[#6B7280]">Match {match.match_number}</span>
                                        <span className="text-sm text-[#6B7280]">{name}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className={`flex justify-between items-center p-3 rounded ${
                                            isPlayer1Winner ? 'bg-[#3ECF8E]/10' : 'hover:bg-[#1C1C1C]'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        isPlayer1Winner ? 'bg-[#3ECF8E]' : 'bg-[#6B7280]'
                                                    }`} />
                                                    {isPlayer1Winner && (
                                                        <div className="absolute inset-0 animate-ping rounded-full bg-[#3ECF8E]/30" />
                                                    )}
                                                </div>
                                                <span className={`text-lg ${
                                                    isPlayer1Winner ? 'text-[#3ECF8E]' : 'text-white'
                                                }`}>{player1Name}</span>
                                            </div>
                                            {isPlayer1Winner && (
                                                <span className="text-[#3ECF8E] text-sm">Winner</span>
                                            )}
                                        </div>
                                        <div className={`flex justify-between items-center p-3 rounded ${
                                            isPlayer2Winner ? 'bg-[#3ECF8E]/10' : 'hover:bg-[#1C1C1C]'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        isPlayer2Winner ? 'bg-[#3ECF8E]' : 'bg-[#6B7280]'
                                                    }`} />
                                                    {isPlayer2Winner && (
                                                        <div className="absolute inset-0 animate-ping rounded-full bg-[#3ECF8E]/30" />
                                                    )}
                                                </div>
                                                <span className={`text-lg ${
                                                    isPlayer2Winner ? 'text-[#3ECF8E]' : 'text-white'
                                                }`}>{player2Name}</span>
                                            </div>
                                            {isPlayer2Winner && (
                                                <span className="text-[#3ECF8E] text-sm">Winner</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default VerticalBracket;
