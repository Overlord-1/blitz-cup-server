import React from 'react'

const Round = (match) => {
  return (
    <div className="flex flex-col justify-center round mb-4">
      <h3 className="text-white text-center font-semibold mb-2 text-sm">{match.desc}</h3>
      <div className="matches flex flex-col gap-2">
        {[...Array(match.size)].map((_, i) => (
          <div key={`r1-${i}`} className="match-box w-36 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
            <div className="player p-1.5 border-l-4 border-blue-500 bg-gray-700/50 rounded mb-1">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">P{i * 2 + 1}</span>
                <span className="text-gray-400 text-xs">1</span>
              </div>
            </div>
            <div className="player p-1.5 border-l-4 border-transparent bg-gray-700/30 rounded">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">P{i * 2 + 2}</span>
                <span className="text-gray-400 text-xs">0</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Round;