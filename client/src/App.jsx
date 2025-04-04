import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tree from './components/Tree';
import Leaderboard from './components/Leaderboard';
import Start from './components/Start';
import Layout from './components/Layout';
import Test from './components/Test';
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;