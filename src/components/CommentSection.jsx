import React, { useState, useEffect } from 'react';

function CommentSection({ gameId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  
  // Load comments from localStorage on mount
  useEffect(() => {
    const storedComments = localStorage.getItem(`game_${gameId}_comments`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
    
    // Get previously used username if available
    const storedUsername = localStorage.getItem('gameHub_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [gameId]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !username.trim()) return;
    
    const comment = {
      id: Date.now(),
      username: username,
      text: newComment,
      date: new Date().toISOString(),
      likes: 0
    };
    
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    
    // Save to localStorage
    localStorage.setItem(`game_${gameId}_comments`, JSON.stringify(updatedComments));
    localStorage.setItem('gameHub_username', username);
    
    // Reset form
    setNewComment('');
  };
  
  const handleLike = (commentId) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 };
      }
      return comment;
    });
    
    setComments(updatedComments);
    localStorage.setItem(`game_${gameId}_comments`, JSON.stringify(updatedComments));
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If less than a day ago, show hours/minutes
    if (now - date < 24 * 60 * 60 * 1000) {
      const hours = Math.floor((now - date) / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor((now - date) / (60 * 1000));
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Otherwise show the date
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your username"
            maxLength={30}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">Comment</label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
            placeholder="Share your thoughts about this game..."
            maxLength={500}
            required
          />
        </div>
        
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
        >
          Post Comment
        </button>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{comment.username}</span>
                <span className="text-gray-500 text-sm">{formatDate(comment.date)}</span>
              </div>
              <p className="text-gray-700 mb-2">{comment.text}</p>
              <button
                onClick={() => handleLike(comment.id)}
                className="text-gray-500 text-sm hover:text-indigo-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Like</span>
                {comment.likes > 0 && <span className="ml-1">({comment.likes})</span>}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;