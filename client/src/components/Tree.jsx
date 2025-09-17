import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import BlitzAnimation from './BlitzAnimation';
import BracketDisplay from './BracketDisplay';
import VerticalBracket from './VerticalBracket';
import { backendURL } from '../config/backendURL';
// import { motion, AnimatePresence } from 'framer-motion';
// import confetti from 'canvas-confetti';
import { SocketContext } from '../config/Socket';
import { use } from 'react';
import { WindIcon } from 'lucide-react';

const Tree = () => {
    const [participants, setParticipants] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [tournamentStatus, setTournamentStatus] = useState(true);
    const [scale, setScale] = useState(0.5);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState(null);
    const [view, setView] = useState('tree'); // 'tree' or 'vertical'

    const {socket, socketConnected}=useContext(SocketContext)

    // Add fetchMatches function to get updated match data
    // const fetchMatches = useCallback(async () => {
    //     try {
    //         const matchesResponse = await axios.get(`${backendURL}/game/get-matches`);
    //         const newMatches = matchesResponse.data;
    //         setMatches(newMatches);
    //     } catch (err) {
    //         console.error('Error fetching matches:', err);
    //     }
    // }, []);

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

            const matchesResponse2 = await axios.get(`${backendURL}/game/get-matches`);
            const matchesData2 = matchesResponse2.data;
            setMatches(matchesData2);

            if (orderedParticipants.length !== 32) {
                throw new Error('Need exactly 32 participants to start the tournament');
            }
            setParticipants(orderedParticipants);
            // console.log(orderedParticipants)
            // console.log(participants)
        } catch (err) {
            setError(err.message || 'Failed to fetch tournament data');
            console.error('Tournament data fetch error:', err);
        }
    };

    // useEffect(() => {
    //     const checkForNewWinners = () => {
    //         matches.forEach(match => {
    //             // Skip if no winner or already processed
    //             if (!match.winner || winners.has(match.winner)) {
    //                 return;
    //             }
    
    //             const winningPlayer = participants.find(p => p.id === match.winner);
    //             if (winningPlayer) {
    //                 // Update winners set
    //                 setWinners(prevWinners => new Set([...prevWinners, match.winner]));
    //                 setCurrentWinner(winningPlayer);
                    
    //                 // Trigger confetti
    //                 const triggerConfetti = () => {
    //                     const defaults = { 
    //                         startVelocity: 30, 
    //                         spread: 360, 
    //                         ticks: 60, 
    //                         zIndex: 100,
    //                         particleCount: 100,
    //                         origin: { y: 0.6 }
    //                     };
    
    //                     confetti({
    //                         ...defaults,
    //                         angle: 60,
    //                         origin: { x: 0, y: 0.8 }
    //                     });
    
    //                     confetti({
    //                         ...defaults,
    //                         angle: 120,
    //                         origin: { x: 1, y: 0.8 }
    //                     });
    //                 };
    
    //                 // Trigger multiple bursts
    //                 triggerConfetti();
    //                 setTimeout(triggerConfetti, 250);
    //                 setTimeout(triggerConfetti, 500);
    
    //                 // Show winner animation
    //                 setShowWinnerAnimation(true);
    
    //                 // Reset animation after delay
    //                 setTimeout(() => {
    //                     setShowWinnerAnimation(false);
    //                 }, 3000);
    //             }
    //         });
    //     };
    
    //     if (matches.length > 0 && participants.length > 0) {
    //         checkForNewWinners();
    //     }
    // }, [matches, participants]); // Remove winners from dependencies to prevent loops

    useEffect(()=>{
        socket.on('new_winner', (data)=>{
            setMatches(prevMatches=>{
                return prevMatches.map(match=>{
                    if (match.id === data.match_id){
                        const winningPlayer = participants.find(p => p.id === data.new_winner);
                        match.winner =  winningPlayer ? winningPlayer.id : null;
                        return match;
                    }
                    return match;
                })
            })
        });

        return ()=>{
            socket.off('new_winner');
        }
    }, [matches, participants])

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
    // useEffect(() => {
    //     let pollInterval;
    //     if (tournamentStatus && participants) {
    //         pollInterval = setInterval(fetchMatches, 5000); // Poll every minute
    //     }

    //     return () => {
    //         if (pollInterval) {
    //             clearInterval(pollInterval);
    //         }
    //     };
    // }, [tournamentStatus, participants, fetchMatches]);

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

    const resetTournament = async () => {
        try {
            setLoading(true);
            setParticipants(null);
            setMatches([]);
            await axios.get(`${backendURL}/game/reset`);
            setTournamentStatus(false);
        } catch (err) {
            setError(err.message || 'Failed to reset tournament');
            console.error('Tournament reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const newScale = Math.min(Math.max(0.2, scale - (e.deltaY * 0.002)), 2);
            setScale(newScale);
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetView = () => {
        setScale(0.5);
        setPosition({ x: 0, y: 0 });
    };

    // Add zoom controls effect
    useEffect(() => {
        const container = document.getElementById('bracket-container');
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [scale]);

    // Add touch handlers for mobile
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setTouchStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        } else if (e.touches.length === 2) {
            // Handle pinch zoom
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setTouchStart({ ...touchStart, dist });
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 1 && isDragging) {
            setPosition({
                x: e.touches[0].clientX - touchStart.x,
                y: e.touches[0].clientY - touchStart.y
            });
        } else if (e.touches.length === 2 && touchStart?.dist) {
            const newDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = newDist - touchStart.dist;
            const newScale = Math.min(Math.max(0.3, scale + (delta * 0.01)), 2);
            setScale(newScale);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setTouchStart(null);
    };

    if (error) {
        return (
            <div className="animate-fadeIn mx-auto max-w-2xl p-4">
                <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 md:p-6 backdrop-blur-sm">
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
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
                <div className="relative">
                    <div className="w-10 h-10 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-10 h-10 border-2 border-[#3ECF8E]/10 rounded-full"></div>
                </div>
                <div className="mt-6 space-y-1 text-center">
                    <p className="text-5xl 3xl:text-8xl font-medium text-[#E5E7EB] mb-4">Loading Tournament</p>
                    <p className="text-2xl 3xl:text-6xl text-[#6B7280]">Fetching match data...</p>
                </div>
            </div>
        );
    }

    if (!tournamentStatus || !participants) {
        return (
            <div className="flex flex-col items-center text-center justify-center min-h-[400px] w-full mx-auto px-2 md:px-4 animate-fadeIn">
                <div className="w-full md:w-3/5 rounded-xl border border-[#3ECF8E]/10 bg-[#3ECF8E]/[0.02] p-4 md:p-8 backdrop-blur-sm">
                    <h2 className="text-3xl md:text-5xl 3xl:text-8xl font-semibold text-[#3ECF8E] mb-2">Initialize Tournament</h2>
                    <p className="text-lg md:text-xl 3xl:text-6xl text-[#6B7280] mb-2">Start the tournament to generate brackets and begin matches.</p>
                    <button
                        onClick={initializeTournament}
                        disabled={loading || isAnimating}
                        className="w-full md:w-2/5 px-4 py-2.5 rounded-lg text-lg md:text-xl 3xl:text-6xl font-medium
                            transition-all duration-200 cursor-pointer mt-4
                            ${loading || isAnimating
                                ? 'bg-[#1C1C1C] text-[#6B7280] cursor-not-allowed'
                                : 'bg-[#3ECF8E] text-[#0A0A0A] hover:bg-[#3AC489] hover:shadow-lg hover:shadow-[#3ECF8E]/10'
                            }"
                    >
                        {loading ? 'Initializing...' : 'Start Tournament'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-7rem)] overflow-hidden'>
            {/* Reset Tournament button */}
            <button 
                onClick={resetTournament} 
                className='absolute top-4 left-4 z-20 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-all duration-200'
            >
                Reset Tournament
            </button>

            {/* View Toggle Button */}
            <button 
                onClick={() => {setView(view === 'tree' ? 'vertical' : 'tree'); setPosition({x:0,y:0})}} 
                className='absolute text-md top-8 right-6 max-w-32 md:max-w-72 md:top-5 md:right-64 md:text-2xl z-20 px-3 py-1.5 bg-[#3ECF8E]/10 text-[#3ECF8E] rounded-md hover:bg-[#3ECF8E]/20 transition-all duration-200 hover:scale-105 active:scale-95'
            >
                {view === 'tree' ? 'Switch to Vertical View' : 'Switch to Tree View'}
            </button>

            {/* Show zoom controls only in tree view */}
            {view === 'tree' && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 bg-[#1C1C1C]/80 p-2 rounded-lg backdrop-blur-sm md:absolute md:bottom-auto md:left-auto md:transform-none md:top-4 md:right-4">
                    <button
                        onClick={() => setScale(prev => Math.min(prev + 0.3, 2))}
                        className="p-2 bg-[#3ECF8E]/10 rounded-lg hover:bg-[#3ECF8E]/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setScale(prev => Math.max(prev - 0.2, 0.2))}
                        className="p-2 bg-[#3ECF8E]/10 rounded-lg hover:bg-[#3ECF8E]/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <button
                        onClick={resetView}
                        className="p-2 bg-[#3ECF8E]/10 rounded-lg hover:bg-[#3ECF8E]/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            )}
            
            {view === 'tree' ? (
                <div
                    id="bracket-container"
                    className="w-full h-full flex justify-center items-center cursor-grab active:cursor-grabbing touch-none overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div 
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        className="relative animate-fadeIn"
                    >
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none z-10"></div>
                        <div className="relative">
                            <BracketDisplay matches={matches} participants={participants} />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none z-10"></div>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full overflow-y-auto">
                    <VerticalBracket matches={matches} participants={participants} />
                </div>
            )}
        </div>
    );
};

export default Tree;