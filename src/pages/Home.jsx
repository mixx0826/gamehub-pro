import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import CategoryCard from '../components/CategoryCard';
import AdBanner from '../components/AdBanner';
import { games } from '../data/games';
import { categories } from '../data/categories';
import { GameStorage } from '../utils/adminStorage';

function Home() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [popularGames, setPopularGames] = useState([]);
  const [allGames, setAllGames] = useState([]);

  useEffect(() => {
    loadAllGames();
  }, []);

  const loadAllGames = () => {
    try {
      // 获取所有游戏（平台游戏 + 上传游戏）
      const managedGames = GameStorage.getAllManagedGames();
      
      // 过滤掉隐藏的游戏，只显示active状态的游戏
      const visibleGames = managedGames.filter(game => 
        (game.status || 'active') === 'active'
      );
      
      setAllGames(visibleGames);
      
      // Get featured games
      const featured = visibleGames.filter(game => game.featured).slice(0, 3);
      setFeaturedGames(featured);
      
      // Get popular games (highest ratings)
      const popular = [...visibleGames].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
      setPopularGames(popular);
    } catch (error) {
      console.error('加载游戏数据失败:', error);
      // 降级方案：使用静态游戏数据
      const featured = games.filter(game => game.featured).slice(0, 3);
      setFeaturedGames(featured);
      
      const popular = [...games].sort((a, b) => b.rating - a.rating).slice(0, 6);
      setPopularGames(popular);
      setAllGames(games);
    }
  };

  // 计算每个分类的游戏数量
  const categoriesWithCount = categories.map(category => ({
    ...category,
    gameCount: allGames.filter(game => 
      game.categoryIds?.includes(category.id)
    ).length
  }));

  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xl overflow-hidden mb-10">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 flex flex-col items-start">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Welcome to GameHub Pro</h1>
            <p className="text-xl mb-6">Your destination for the best online games! Play instantly in your browser.</p>
            <Link 
              to="/games" 
              className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              Play Now
            </Link>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            <img 
              src="/assets/images/hero-games.svg" 
              alt="Gaming illustration" 
              className="max-w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Games</h2>
          <Link to="/games?featured=true" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </Link>
        </div>
        {featuredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map(game => (
              <GameCard key={game.id} game={game} featured />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>暂无精选游戏</p>
          </div>
        )}
      </section>

      {/* Ad Banner */}
      <section className="mb-10">
        <AdBanner />
      </section>

      {/* Browse by Category */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesWithCount.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Popular Games */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Popular Games</h2>
          <Link to="/games?sort=popular" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </Link>
        </div>
        {popularGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>暂无热门游戏</p>
          </div>
        )}
      </section>

      {/* Ad Banner 2 */}
      <section className="mb-10">
        <AdBanner 
          size="large"
          content={
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="text-center">
                <div className="text-3xl mb-2">🎮</div>
                <h3 className="text-lg font-bold mb-1">开发者合作计划</h3>
                <p className="text-sm opacity-90">上传您的游戏，获得收益分成</p>
              </div>
            </div>
          }
        />
      </section>

      {/* 显示游戏统计信息 */}
      <section className="mb-10 text-center">
        <p className="text-gray-600">
          总计 {allGames.length} 款游戏 | 精选 {featuredGames.length} 款
        </p>
      </section>
    </div>
  );
}

export default Home;