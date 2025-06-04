import React from 'react';
import { categories } from '../data/categories';

function FilterPanel({ activeFilters, onFilterChange }) {
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];
  
  const tags = [
    'multiplayer',
    'action',
    'puzzle',
    'adventure',
    'racing',
    'shooting',
    'sports',
    'highscore',
    'strategy',
    'casual'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold text-gray-800 mb-4">Filters</h3>
      
      {/* Sort by */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Sort By</h4>
        <select 
          value={activeFilters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="cat-all" 
              name="category" 
              checked={activeFilters.category === ''}
              onChange={() => onFilterChange({ category: '' })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="cat-all" className="ml-2 text-gray-700">All Games</label>
          </div>
          
          {categories.map(category => (
            <div key={category.id} className="flex items-center">
              <input 
                type="radio" 
                id={`cat-${category.id}`} 
                name="category" 
                checked={activeFilters.category === category.slug}
                onChange={() => onFilterChange({ category: category.slug })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor={`cat-${category.id}`} className="ml-2 text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Popular Tags */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Popular Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => onFilterChange({ tag: activeFilters.tag === tag ? '' : tag })}
              className={`px-3 py-1 text-sm rounded-full ${
                activeFilters.tag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Clear all filters */}
      {(activeFilters.category || activeFilters.tag || activeFilters.searchTerm) && (
        <button
          onClick={() => onFilterChange({ category: '', tag: '', searchTerm: '' })}
          className="mt-6 w-full py-2 text-indigo-600 font-medium border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default FilterPanel;