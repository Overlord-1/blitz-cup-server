import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GetProblemLink = () => {
  const [matchId, setMatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Possible match IDs
  const matchOptions = [
    ...Array.from({length: 16}, (_, i) => `ROUND-OF-32-${i+1}`),
    ...Array.from({length: 8}, (_, i) => `ROUND-OF-16-${i+1}`),
    ...Array.from({length: 4}, (_, i) => `QUARTER-FINAL-${i+1}`),
    ...Array.from({length: 2}, (_, i) => `SEMI-FINAL-${i+1}`),
    'FINAL-1'
  ];

  // Filter suggestions based on input
  const filteredOptions = matchOptions.filter(option => 
    option.toLowerCase().includes(matchId.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    if (!matchId.trim()) {
      setError('Please enter a Match ID');
      setLoading(false);
      return;
    }

    try {
      // Using the exact format you specified
      const requestBody = {
        "matchId": matchId
      };

      console.log('Sending request with body:', requestBody);

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/round/get-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          // Try to parse as JSON if possible
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || `Server error: ${response.status}`;
        } catch (parseError) {
          // If parsing fails, use text or status
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Check for empty response
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Server returned an empty response');
      }
      
      // Parse JSON after confirming we have content
      const data = JSON.parse(responseText);
      setResult(data);
      
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to process response');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (option) => {
    setMatchId(option);
    setShowSuggestions(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const resultVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
        className="p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <motion.div 
            className="bg-transparent rounded-2xl shadow-lg p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div 
                className="bg-transparent p-6 rounded-t-lg"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <motion.h2 
                    className="text-xl font-bold mb-1 text-[#E5E7EB] text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Get Problem Link
                </motion.h2>
                <motion.p 
                    className="text-sm text-[#6B7280] text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Enter a match ID to retrieve the problem link
                </motion.p>
            </motion.div>
            
            <motion.div 
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <form onSubmit={handleSubmit}>
                    <motion.div 
                        className="mb-4 relative" 
                        ref={dropdownRef}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label htmlFor="matchId" className="block text-sm font-medium text-[#6B7280] mb-1">
                            Match ID
                        </label>
                        <div className="relative">
                            <input
                                id="matchId"
                                type="text"
                                value={matchId}
                                onChange={(e) => {
                                    setMatchId(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Select or type match ID"
                                className="w-full px-3 py-2 pl-9 bg-[#1C1C1C] border border-[#3ECF8E]/20 text-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        </div>
                        
                        <AnimatePresence>
                            {showSuggestions && filteredOptions.length > 0 && (
                                <motion.ul 
                                    className="absolute z-10 mt-1 w-full bg-[#1C1C1C] border border-[#3ECF8E]/20 rounded-md shadow-lg max-h-60 overflow-x-hidden"
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {filteredOptions.map((option, index) => (
                                        <motion.li 
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ 
                                                opacity: 1, 
                                                x: 0,
                                                transition: { delay: index * 0.05 }
                                            }}
                                            whileHover={{ 
                                                backgroundColor: 'rgba(62, 207, 142, 0.1)',
                                                scale: 1.02
                                            }}
                                            onClick={() => selectOption(option)}
                                            className="px-4 py-2 cursor-pointer text-[#E5E7EB] text-sm"
                                        >
                                            {option}
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    
                    <motion.button 
                        type="submit" 
                        className={`w-full cursor-pointer bg-[#3ECF8E] text-[#0A0A0A] font-medium py-2 px-4 rounded-md hover:bg-[#3AC489] hover:shadow-lg hover:shadow-[#3ECF8E]/10 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        // whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0 }}
                    >
                        {loading ? 'Loading...' : 'Get Problem Link'}
                    </motion.button>
                </form>
                
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            className="mt-4 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-md"
                            variants={resultVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-400">Error</p>
                                    <p className="text-sm text-red-400/90 mt-1">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {result && (
                        <motion.div 
                            className={`mt-4 ${result.problemLink ? 'bg-[#3ECF8E]/5 border border-[#3ECF8E]/20' : 'bg-yellow-500/5 border border-yellow-500/20'} p-6 rounded-xl`}
                            variants={resultVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="flex flex-col items-center text-center">
                                {result.problemLink ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 flex items-center justify-center mb-3">
                                            <CheckCircle className="h-6 w-6 text-[#3ECF8E]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#3ECF8E] mb-2">
                                            Success!
                                        </h3>
                                        <p className="text-sm text-[#3ECF8E]/80 mb-4">
                                            {result.message}
                                        </p>
                                        <motion.a 
                                            href={result.problemLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center w-full max-w-xs bg-gradient-to-r from-[#3ECF8E] to-[#3AC489] text-[#0A0A0A] font-medium py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-[#3ECF8E]/20 transform hover:-translate-y-0.5 transition-all duration-200"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span>Open Problem</span>
                                            <ExternalLink className="ml-2 h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                                        </motion.a>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
                                            <AlertCircle className="h-6 w-6 text-yellow-400" />
                                        </div>
                                        <p className="text-sm text-yellow-400/90">
                                            {result.message}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            
            <motion.div 
                className="border-t border-[#3ECF8E]/20 p-4 bg-[#0A0A0A] text-xs text-[#6B7280] rounded-b-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                Enter the match ID to retrieve the corresponding problem link from Codeforces.
            </motion.div>
        </motion.div>
    </motion.div>
);
};

export default GetProblemLink;