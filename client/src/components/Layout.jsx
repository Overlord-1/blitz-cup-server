import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const location = useLocation();
    
    const navItems = [
        { path: '/', label: 'Tournament', icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        )},
        { path: '/match-details', label: 'Match Details', icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )}
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-screen mx-auto px-4 py-6"
        >
            <nav>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <motion.h1 
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-5xl font-semibold font-electrolize after:content-[''] relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-[#3ECF8E] after:to-[#3AC489] after:rounded-md"
                    >
                        <span className="bg-gradient-to-r from-[#3ECF8E] to-[#3AC489] bg-clip-text text-transparent">
                            IEEE Blitz Cup
                        </span>
                    </motion.h1>
                    <motion.div 
                        initial={{ x: 20 }}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex gap-1 bg-[#121212] p-1 rounded-lg border border-[#1C1C1C] shadow-xl"
                    >
                        {navItems.map(({ path, label, icon }) => (
                            <motion.div
                                key={path}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    to={path}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 text-md rounded-md transition-all duration-200
                                        ${location.pathname === path 
                                            ? 'bg-[#3ECF8E] text-[#0A0A0A] font-medium shadow-lg shadow-[#3ECF8E]/10' 
                                            : 'text-[#6B7280] hover:text-[#E5E7EB] hover:bg-[#1C1C1C]'
                                        }
                                    `}
                                >
                                    {icon}
                                    {label}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </nav>
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {children}
            </motion.main>
        </motion.div>
    );
};  

export default Layout;