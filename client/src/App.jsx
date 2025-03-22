import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Tree from './components/Tree';
import Leaderboard from './components/Leaderboard';
import Start from './components/Start';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(window.location.pathname);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="logo">
            <h1>Codeforces Blitz</h1>
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
          <Routes>
            <Route path="/" element={<Tree />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/match-starter" element={<Start />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 Codeforces Blitz. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;