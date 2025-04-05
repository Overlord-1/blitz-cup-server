import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tree from './components/Tree';
import Leaderboard from './components/Leaderboard';
import Start from './components/Start';
import Layout from './components/Layout';
import Test from './components/Test';
import GetProblemLink from './components/MatchDetails';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Tree />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/match-starter" element={<Start />} />
          <Route path="/test" element={<Test />} />
          <Route path="/match-details" element={<GetProblemLink />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;