import React, { useState, useEffect } from 'react';

function Leaderboard({ gameId, gameTitle }) {
  const [scores, setScores] = useState([]);
  const [timeFrame, setTimeFrame] = useState('all'); // 'all', 'week', 'today'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll simulate with localStorage
    loadScores();
  }, [gameId, timeFrame]);

  const loadScores = () => {
    setLoading(true);
    
    // Get scores from localStorage
    const allScores = JSON.parse(localStorage.getItem(`game_${gameId}_scores`) || '[]');
    
    // Filter based on timeFrame
    let filteredScores = [];
    const now = new Date();
    
    if (timeFrame === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filteredScores = allScores.filter(score => new Date(score.date).getTime() >= today);
    } else if (timeFrame === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      filteredScores = allScores.filter(score => new Date(score.date).getTime() >= weekAgo);
    } else {
      filteredScores = allScores;
    }
    
    // Sort by score (descending)
    filteredScores.sort((a, b) => b.score - a.score);
    
    setScores(filteredScores.slice(0, 10)); // Top 10
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">{gameTitle || 'Game'} Leaderboard</h3>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded ${timeFrame === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeFrame('all')}
          >
            All Time
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${timeFrame === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeFrame('week')}
          >
            This Week
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${timeFrame === 'today' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeFrame('today')}
          >
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : scores.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left pl-2">#</th>
              <th className="py-2 text-left">Player</th>
              <th className="py-2 text-right">Score</th>
              <th className="py-2 text-right pr-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr 
                key={index} 
                className={`border-b ${index === 0 ? 'bg-yellow-50' : index < 3 ? 'bg-gray-50' : ''}`}
              >
                <td className="py-2 pl-2 font-medium">
                  {index === 0 && (
                    <span className="flex h-6 w-6 rounded-full bg-yellow-400 text-white justify-center items-center">
                      1
                    </span>
                  )}
                  {index === 1 && (
                    <span className="flex h-6 w-6 rounded-full bg-gray-400 text-white justify-center items-center">
                      2
                    </span>
                  )}
                  {index === 2 && (
                    <span className="flex h-6 w-6 rounded-full bg-amber-600 text-white justify-center items-center">
                      3
                    </span>
                  )}
                  {index > 2 && (
                    <span className="text-gray-500">{index + 1}</span>
                  )}
                </td>
                <td className="py-2">{score.username}</td>
                <td className="py-2 text-right font-mono">{score.score.toLocaleString()}</td>
                <td className="py-2 text-right pr-2 text-gray-500 text-sm">{formatDate(score.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No scores recorded yet. Be the first to set a high score!
        </div>
      )}
    </div>
  );
}

export default Leaderboard;