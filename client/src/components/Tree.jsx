import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BlitzAnimation from './BlitzAnimation';
import BracketDisplay from './BracketDisplay';
import { backendURL } from '../config/backendURL';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Tree = () => {
    const [participants, setParticipants] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [tournamentStatus, setTournamentStatus] = useState(true);
    const [winners, setWinners] = useState(new Set());
    const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
    const [currentWinner, setCurrentWinner] = useState(null);

    // Add fetchMatches function to get updated match data
    const fetchMatches = useCallback(async () => {
        try {
            const matchesResponse = await axios.get(`${backendURL}/game/get-matches`);
            const newMatches = matchesResponse.data;
            setMatches(newMatches);
            console.log(matches)
        } catch (err) {
            console.error('Error fetching matches:', err);
        }
    }, []);

    // Modified fetchTournamentData to include matches
    const fetchTournamentData = async () => {
        try {
            // Get matches data
            const matchesResponse = await axios.get(`${backendURL}/game/get-matches1`);
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
                    if (player1 && player2) orderedParticipants.push(player1,player2);
                }
            });
            console.log(orderedParticipants)
            if (orderedParticipants.length !== 32) {
                throw new Error('Need exactly 32 participants to start the tournament');
            }
            setParticipants(orderedParticipants);
            console.log(orderedParticipants)
            // console.log(participants)
        } catch (err) {
            setError(err.message || 'Failed to fetch tournament data');
            console.error('Tournament data fetch error:', err);
        }
    };

    useEffect(() => {
        const checkForNewWinners = () => {
            matches.forEach(match => {
                // Skip if no winner or already processed
                if (!match.winner || winners.has(match.winner)) {
                    return;
                }
    
                const winningPlayer = participants.find(p => p.id === match.winner);
                if (winningPlayer) {
                    // Update winners set
                    setWinners(prevWinners => new Set([...prevWinners, match.winner]));
                    setCurrentWinner(winningPlayer);
                    
                    // Trigger confetti
                    const triggerConfetti = () => {
                        const defaults = { 
                            startVelocity: 30, 
                            spread: 360, 
                            ticks: 60, 
                            zIndex: 100,
                            particleCount: 100,
                            origin: { y: 0.6 }
                        };
    
                        confetti({
                            ...defaults,
                            angle: 60,
                            origin: { x: 0, y: 0.8 }
                        });
    
                        confetti({
                            ...defaults,
                            angle: 120,
                            origin: { x: 1, y: 0.8 }
                        });
                    };
    
                    // Trigger multiple bursts
                    triggerConfetti();
                    setTimeout(triggerConfetti, 250);
                    setTimeout(triggerConfetti, 500);
    
                    // Show winner animation
                    setShowWinnerAnimation(true);
    
                    // Reset animation after delay
                    setTimeout(() => {
                        setShowWinnerAnimation(false);
                    }, 3000);
                }
            });
        };
    
        if (matches.length > 0 && participants.length > 0) {
            checkForNewWinners();
        }
    }, [matches, participants]); // Remove winners from dependencies to prevent loops

    useEffect(() => {
        const checkTournamentStatus = async () => {
            try {
                setLoading(true);
                setIsAnimating(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setLoading(false);
                setIsAnimating(false);
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
            pollInterval = setInterval(fetchMatches, 5000); // Poll every minute
        }

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [tournamentStatus, participants, fetchMatches]);

    const initializeTournament = async () => {
        setLoading(true);
        setIsAnimating(true);
        setError(null);
        
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

    // const resetTournament = async () => {
    //     try {
    //         setLoading(true);
    //         setParticipants(null);
    //         setMatches([]);
    //         await axios.get(`${backendURL}/game/reset`);
    //         setTournamentStatus(false);
    //     } catch (err) {
    //         setError(err.message || 'Failed to reset tournament');
    //         console.error('Tournament reset error:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (error) {
        return (
            <div className="animate-fadeIn mx-auto max-w-2xl">
                <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-red-400">
                        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 text-xs font-medium bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-all duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center xl:min-h-[800px] animate-fadeIn">
                <div className="relative">
                    <div className="w-10 h-10 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-10 h-10 border-2 border-[#3ECF8E]/10 rounded-full"></div>
                </div>
                <div className="mt-6 space-y-1 text-center">
                    <p className="text-sm xl:text-8xl font-medium text-[#E5E7EB]">Loading Tournament</p>
                    <p className="text-xs xl:text-6xl text-[#6B7280]">Fetching match data...</p>
                </div>
            </div>
        );
    }

    if (!tournamentStatus || !participants) {
        return (
            <div className="flex flex-col items-center text-center justify-center min-h-[400px] w-full mx-auto px-4 animate-fadeIn">
                <div className="w-full rounded-xl border border-[#3ECF8E]/10 bg-[#3ECF8E]/[0.02] p-8 backdrop-blur-sm">
                    <h2 className="text-xl xl:text-8xl font-semibold text-[#3ECF8E] mb-4">Initialize Tournament</h2>
                    <p className="text-sm xl:text-6xl text-[#6B7280] mb-6">Start the tournament to generate brackets and begin matches.</p>
                    <button
                        onClick={initializeTournament}
                        disabled={loading || isAnimating}
                        className={`
                            w-1/10 px-4 py-2.5 rounded-lg text-sm xl:text-6xl font-medium
                            transition-all duration-200 cursor-pointer
                            ${loading || isAnimating
                                ? 'bg-[#1C1C1C] text-[#6B7280] cursor-not-allowed'
                                : 'bg-[#3ECF8E] text-[#0A0A0A] hover:bg-[#3AC489] hover:shadow-lg hover:shadow-[#3ECF8E]/10'
                            }
                        `}
                    >
                        {loading ? 'Initializing...' : 'Start Tournament'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex justify-center align-middle overflow-auto mt-28'>
        <div className="relative animate-fadeIn">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none z-10"></div>
            <div className="relative overflow-x-auto overflow-y-hidden">
                <BracketDisplay matches={matches} participants={participants} />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none z-10"></div>
        </div>
        {showWinnerAnimation && currentWinner && (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                    <motion.div 
                        className="bg-[#3ECF8E]/10 backdrop-blur-sm rounded-xl p-8 border border-[#3ECF8E]/20"
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-[#3ECF8E] text-center">
                            {currentWinner.name} Wins!
                        </h2>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        )}
    </div>);
};

export default Tree;