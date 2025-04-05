import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tree from './components/Tree';
import Layout from './components/Layout';
import GetProblemLink from './components/MatchDetails';
import './App.css';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-[#0A0A0A] text-[#E5E7EB] relative overflow-hidden">
                {/* Background patterns */}
                <div className="fixed inset-0 bg-[linear-gradient(to_right,#1C1C1C_1px,transparent_1px),linear-gradient(to_bottom,#1C1C1C_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
                <div className="fixed inset-0 bg-gradient-to-tr from-[#3ECF8E]/[0.02] via-transparent to-transparent"></div>

                <div className="relative z-10">
                    <Layout>
                        <Routes>
                            <Route path="/" element={<GetProblemLink />} />
                            <Route
                                path="/match-details"
                                element={
                                    <div className="-mt-6">
                                        <div className="bg-transparentrounded-lg shadow-sm">
                                            <Tree />
                                        </div>
                                    </div>
                                }
                            />
                        </Routes>
                    </Layout>
                </div>

                {/* Bottom fade */}
                <div className="fixed bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
            </div>
        </Router>
    );
}

export default App;