import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Search, ChevronDown } from 'lucide-react';

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md border border-emerald-500/30 rounded-lg shadow-xl bg-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-500 p-6">
          <h2 className="text-xl font-bold mb-1 text-white">Get Problem Link</h2>
          <p className="text-sm text-white/80">Enter a match ID to retrieve the problem link</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative" ref={dropdownRef}>
              <label htmlFor="matchId" className="block text-sm font-medium text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 pl-9 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {showSuggestions && filteredOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredOptions.map((option, index) => (
                    <li 
                      key={index}
                      onClick={() => selectOption(option)}
                      className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`w-full bg-gradient-to-r from-emerald-600 to-blue-500 text-white font-medium py-2 px-4 rounded-md hover:from-emerald-700 hover:to-blue-600 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Problem Link'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">Error</p>
                  <p className="text-sm text-red-400/90 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {result && (
            <div className={`mt-4 ${result.problemLink ? 'bg-emerald-900/30 border-l-4 border-emerald-500' : 'bg-yellow-900/30 border-l-4 border-yellow-500'} p-4 rounded-md`}>
              <div className="flex">
                {result.problemLink ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${result.problemLink ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {result.problemLink ? 'Success' : 'Note'}
                  </p>
                  <p className={`text-sm ${result.problemLink ? 'text-emerald-400/90' : 'text-yellow-400/90'} mt-1`}>
                    {result.message}
                  </p>
                  {result.problemLink && (
                    <a 
                      href={result.problemLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium mt-2"
                    >
                      Open Problem <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 p-4 bg-gray-800 text-xs text-gray-400">
          Enter the match ID to retrieve the corresponding problem link from Codeforces.
        </div>
      </div>
    </div>
  );
};

export default GetProblemLink;