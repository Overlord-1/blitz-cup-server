import React from 'react';

const BlitzAnimation = () => {
  return (
    <div className="relative w-24 h-24 m-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-12 h-12" viewBox="0 0 24 24">
          <path 
            className="animate-bolt fill-yellow-400"
            d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12L11 3h1l-1 7h3.5c.49 0 .56.33.47.51l-4 10.49z"
          />
        </svg>
      </div>
      <div className="circles">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className={`absolute inset-0 border-4 border-blue-500 rounded-full
              animate-ripple-${i + 1} opacity-0`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default BlitzAnimation;