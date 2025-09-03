import React from 'react';
import AllRounds from './AllRounds';
import { motion } from 'framer-motion';

const BracketDisplay = ({ matches, participants }) => {
    // Calculate dimensions based on tournament structure
    // const columnWidth = 280;
    // const matchHeight = 100;
    // const bracketWidth = columnWidth * 9; // 9 columns total (4 left + finals + 4 right)
    // const bracketHeight = matchHeight * 11; // Height to accommodate 8 first-round matches

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full pb-8 overflow-x-auto overflow-y-auto xl:overflow-hidden"
        >
            <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-full" 
                // style={{ width: bracketWidth, height: bracketHeight }}
            >
        <div className="w-full pb-8 overflow-x-auto xl:overflow-hidden">
            <div className="relative w-full">
                <div className="flex flex-row gap-16 w-full h-full mt-20">
                    {/* Left Bracket */}
                    <div className="flex flex-col justify-around">
                        <AllRounds
                            size={8}
                            desc="Round of 32"
                            matches={matches}
                            level={1}
                            startIndex={31}
                            participants={participants}
                        />
                    </div>
                    <div className="flex flex-col justify-around py-16">
                        <AllRounds
                            size={4}
                            desc="Round of 16"
                            matches={matches}
                            level={2}
                            startIndex={15}
                            participants={participants}
                        />
                    </div>
                    <div className="flex flex-col justify-around py-32">
                        <AllRounds
                            size={2}
                            desc="Quarter Finals"
                            matches={matches}
                            level={3}
                            startIndex={7}
                            participants={participants}
                        />
                    </div>
                    <div className="flex flex-col justify-around py-64">
                        <AllRounds
                            size={1}
                            desc="Semi Finals"
                            matches={matches}
                            level={4}
                            startIndex={3}
                            participants={participants}
                        />
                    </div>

                    {/* Finals */}
                    <div className="flex flex-col justify-center">
                        <AllRounds
                            size={1}
                            desc="Finals"
                            matches={matches}
                            level={5}
                            startIndex={1}
                            participants={participants}
                        />
                    </div>

                    {/* Right Bracket */}
                    <div className="flex flex-col justify-around py-64">
                        <AllRounds
                            size={1}
                            desc="Semi Finals"
                            matches={matches}
                            level={4}
                            startIndex={2}
                            participants={participants}
                        />
                    </div>
                    <div className="flex flex-col justify-around py-32">
                        <AllRounds
                            size={2}
                            desc="Quarter Finals"
                            matches={matches}
                            level={3}
                            startIndex={5}
                            participants={participants}
                        />
                    </div>
                    <div className="flex flex-col justify-around py-16">
                        <AllRounds
                            size={4}
                            desc="Round of 16"
                            matches={matches}
                            level={2}
                            startIndex={11}
                            participants={participants}
                        />
                    </div>
                    <div className="flex flex-col justify-around">
                        <AllRounds
                            size={8}
                            desc="Round of 32"
                            matches={matches}
                            level={1}
                            startIndex={23}
                            participants={participants}
                        />
                    </div>
                </div>
            </div>
        </div>
        </motion.div>
    </motion.div>
    );
};

export default BracketDisplay;