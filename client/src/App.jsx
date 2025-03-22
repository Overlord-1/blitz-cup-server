import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tree from './components/Tree';
import Leaderboard from './components/Leaderboard';
import Start from './components/Start';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Tree />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/match-starter" element={<Start />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;