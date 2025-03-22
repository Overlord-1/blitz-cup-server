import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  const [activePage, setActivePage] = useState(window.location.pathname);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <h1>IEEE Blitz</h1>
        </div>
        <nav className="nav">
          <Link 
            to="/" 
            className={activePage === '/' ? 'active' : ''}
            onClick={() => setActivePage('/')}
          >
            Tournament Bracket
          </Link>
          <Link 
            to="/leaderboard" 
            className={activePage === '/leaderboard' ? 'active' : ''}
            onClick={() => setActivePage('/leaderboard')}
          >
            Leaderboard
          </Link>
          <Link 
            to="/match-starter" 
            className={activePage === '/match-starter' ? 'active' : ''}
            onClick={() => setActivePage('/match-starter')}
          >
            Start Match
          </Link>
        </nav>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
