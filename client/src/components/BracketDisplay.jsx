import React from 'react';
import AllRounds from './AllRounds';

const BracketDisplay = ({ matches, participants }) => {
    // Calculate dimensions based on tournament structure
    const columnWidth = 280;
    const matchHeight = 100;
    const bracketWidth = columnWidth * 9; // 9 columns total (4 left + finals + 4 right)
    const bracketHeight = matchHeight * 11; // Height to accommodate 8 first-round matches

    return (
        <div className="w-full pb-8 overflow-x-auto">
            <div className="relative" style={{ width: bracketWidth, height: bracketHeight }}>
                {/* Tournament Brackets - Using absolute positioning */}
                {/* <div className="absolute grid grid-cols-9 w-full h-full"> */}
                <div className="flex flex-row gap-4 w-full h-full">
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
    );
};

export default BracketDisplay;