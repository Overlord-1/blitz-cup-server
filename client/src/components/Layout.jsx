import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  const [activePage, setActivePage] = useState(window.location.pathname);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="fixed top-0 w-full z-50 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="logo">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                IEEE Blitz
              </h1>
            </div>
            <div className="flex gap-8 items-center">
              <Link 
                to="/" 
                className={`nav-link relative px-3 py-2 transition-all duration-300 hover:text-blue-400
                  ${activePage === '/' 
                    ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400' 
                    : 'text-gray-300 hover:transform hover:-translate-y-0.5'
                  }`}
                onClick={() => setActivePage('/')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">Tournament</span>
                </span>
              </Link>
              <Link 
                to="/leaderboard" 
                className={`nav-link relative px-3 py-2 transition-all duration-300 hover:text-blue-400
                  ${activePage === '/leaderboard' 
                    ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400' 
                    : 'text-gray-300 hover:transform hover:-translate-y-0.5'
                  }`}
                onClick={() => setActivePage('/leaderboard')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Leaderboard</span>
                </span>
              </Link>
              <Link 
                to="/match-starter" 
                className={`nav-link relative px-3 py-2 transition-all duration-300 hover:text-blue-400
                  ${activePage === '/match-starter' 
                    ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400' 
                    : 'text-gray-300 hover:transform hover:-translate-y-0.5'
                  }`}
                onClick={() => setActivePage('/match-starter')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Start Match</span>
                </span>
              </Link>
              <Link 
                to="/test" 
                className={`nav-link relative px-3 py-2 transition-all duration-300 hover:text-blue-400
                  ${activePage === '/test' 
                    ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400' 
                    : 'text-gray-300 hover:transform hover:-translate-y-0.5'
                  }`}
                onClick={() => setActivePage('/test')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Test Server</span>
                </span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default Layout;