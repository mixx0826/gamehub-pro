import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 overflow-y-auto`}
      >
        <div className="p-4 flex justify-between items-center lg:hidden">
          <h2 className="text-xl font-semibold text-indigo-700">Categories</h2>
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <h2 className="text-xl font-semibold text-indigo-700 hidden lg:block mb-4">Categories</h2>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/games"
                  className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 font-medium"
                >
                  All Games
                </Link>
              </li>
              
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/games?category=${category.slug}`}
                    className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 font-medium"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              <Link to="/games?tag=multiplayer" className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Multiplayer</Link>
              <Link to="/games?tag=new" className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">New</Link>
              <Link to="/games?tag=featured" className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Featured</Link>
              <Link to="/games?tag=highscore" className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Highscore</Link>
              <Link to="/games?tag=popular" className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Popular</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;