import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../SearchBar';

function Header({ toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 lg:hidden p-2 rounded hover:bg-indigo-600 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">GameHub Pro</span>
            </Link>
          </div>
          
          <div className="hidden md:block w-1/3 mx-4">
            <SearchBar />
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="px-3 py-2 rounded hover:bg-indigo-600 transition-colors">Home</Link>
              <Link to="/games" className="px-3 py-2 rounded hover:bg-indigo-600 transition-colors">Games</Link>
            </div>
            
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded hover:bg-indigo-600 focus:outline-none"
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 z-10">
                  <Link to="/" className="block px-4 py-2 hover:bg-gray-100">Home</Link>
                  <Link to="/games" className="block px-4 py-2 hover:bg-gray-100">Games</Link>
                  <div className="px-4 py-2">
                    <SearchBar />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;