import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { games } from '../data/games';
import { categories } from '../data/categories';
import { GameStorage } from '../utils/adminStorage';
import GameCard from '../components/GameCard';
import FilterPanel from '../components/FilterPanel';

function GamesCatalog() {
  const [searchParams] = useSearchParams();
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    searchTerm: searchParams.get('search') || '',
    sortBy: searchParams.get('sort') || 'newest'
  });

  // Load all games on component mount
  useEffect(() => {
    loadAllGames();
  }, []);

  const loadAllGames = () => {
    try {
      setLoading(true);
      // 获取所有游戏（平台游戏 + 上传游戏）
      const managedGames = GameStorage.getAllManagedGames();
      
      // 过滤掉隐藏的游戏，只显示active状态的游戏
      const visibleGames = managedGames.filter(game => 
        (game.status || 'active') === 'active'
      );
      
      setAllGames(visibleGames);
    } catch (error) {
      console.error('加载游戏数据失败:', error);
      // 降级方案：使用静态游戏数据
      setAllGames(games);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update from URL params
    const categoryParam = searchParams.get('category');
    const tagParam = searchParams.get('tag');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    
    setActiveFilters({
      category: categoryParam || activeFilters.category,
      tag: tagParam || activeFilters.tag,
      searchTerm: searchParam || activeFilters.searchTerm,
      sortBy: sortParam || activeFilters.sortBy
    });
  }, [searchParams]);

  useEffect(() => {
    // Apply filters
    let result = [...allGames];
    
    // Filter by category
    if (activeFilters.category) {
      const categoryId = categories.find(cat => cat.slug === activeFilters.category)?.id;
      if (categoryId) {
        result = result.filter(game => 
          (game.categoryIds || []).includes(categoryId)
        );
      }
    }
    
    // Filter by tag
    if (activeFilters.tag) {
      result = result.filter(game => 
        (game.tags || []).includes(activeFilters.tag)
      );
    }
    
    // Filter by search term
    if (activeFilters.searchTerm) {
      const term = activeFilters.searchTerm.toLowerCase();
      result = result.filter(game => 
        (game.title || '').toLowerCase().includes(term) || 
        (game.description || '').toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (activeFilters.sortBy) {
      case 'popular':
        result.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = new Date(a.releaseDate || a.uploadTime || 0);
          const dateB = new Date(b.releaseDate || b.uploadTime || 0);
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
    
    setFilteredGames(result);
  }, [allGames, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters({ ...activeFilters, ...newFilters });
  };

  // Get current category name for heading
  const currentCategoryName = activeFilters.category 
    ? categories.find(cat => cat.slug === activeFilters.category)?.name
    : "All Games";

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter panel (visible on desktop) */}
        <div className="hidden md:block w-64">
          <FilterPanel 
            activeFilters={activeFilters} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Games content */}
        <div className="flex-1">
          {/* Mobile filter toggle */}
          <div className="md:hidden mb-4">
            <button 
              className="w-full px-4 py-2 bg-gray-100 rounded-md flex justify-between items-center"
              onClick={() => document.getElementById('mobile-filters').showModal()}
            >
              <span>Filters</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </button>
            <dialog id="mobile-filters" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box">
                <div className="p-4">
                  <FilterPanel 
                    activeFilters={activeFilters} 
                    onFilterChange={handleFilterChange} 
                  />
                </div>
                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn">Close</button>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
          </div>
          
          {/* Games heading */}
          <h1 className="text-3xl font-bold mb-6">
            {currentCategoryName}
            {activeFilters.searchTerm && (
              <span className="text-xl font-normal text-gray-500 ml-2">
                Search results for "{activeFilters.searchTerm}"
              </span>
            )}
          </h1>
          
          {/* Results count */}
          <p className="text-gray-600 mb-6">{filteredGames.length} games found</p>
          
          {/* Games grid */}
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl text-gray-500 mb-4">No games found</h2>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search term</p>
              <Link to="/games" className="btn btn-primary">View All Games</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamesCatalog;