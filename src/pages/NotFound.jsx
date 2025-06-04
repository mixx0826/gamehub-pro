import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Oops! It looks like you've ventured into uncharted territory. The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
          <Link 
            to="/games" 
            className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Browse Games
          </Link>
        </div>
        
        <div className="mt-12">
          <img 
            src="/assets/images/404-game.png" 
            alt="404 Game Over" 
            className="max-w-xs mx-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default NotFound;