import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">GameHub Pro</h3>
            <p className="text-gray-300">
              Your favorite destination for free online games. Play the best games anywhere, anytime!
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/games?category=action" className="text-gray-300 hover:text-white">Action</Link></li>
              <li><Link to="/games?category=puzzle" className="text-gray-300 hover:text-white">Puzzle</Link></li>
              <li><Link to="/games?category=arcade" className="text-gray-300 hover:text-white">Arcade</Link></li>
              <li><Link to="/games?category=sports" className="text-gray-300 hover:text-white">Sports</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Developers</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Upload Games</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Developer Console</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">API Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} GameHub Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;