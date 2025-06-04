import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { games } from '../data/games';
import { categories } from '../data/categories';
import { GameStorage } from '../utils/adminStorage';
import { githubStorage } from '../utils/githubStorage';
import Rating from '../components/Rating';
import CommentSection from '../components/CommentSection';
import GameCard from '../components/GameCard';
import AdBanner from '../components/AdBanner';

function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [relatedGames, setRelatedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // 获取所有游戏（静态 + 上传）
      const allGames = GameStorage.getAllManagedGames();
      
      // 查找指定ID的游戏
      const foundGame = allGames.find(g => g.id.toString() === gameId);
      
      if (foundGame) {
        setGame(foundGame);
        
        // 查找相关游戏（相同分类）
        const gameCategories = foundGame.categoryIds || [];
        const related = allGames
          .filter(g => g.id.toString() !== gameId && 
                      g.categoryIds?.some(cat => gameCategories.includes(cat)))
          .slice(0, 3);
        
        setRelatedGames(related);
      }
    } catch (error) {
      console.error('获取游戏数据失败:', error);
    }
    
    setLoading(false);
  }, [gameId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 获取游戏的iframe URL
  const getGameUrl = (gameData) => {
    console.log('Getting game URL for:', gameData);
    console.log('Game fileName:', gameData.fileName);
    console.log('Game gameUrl:', gameData.gameUrl);
    console.log('Game gameFileBlob:', gameData.gameFileBlob);
    console.log('Is uploaded game:', gameData.isUploadedGame);
    console.log('GitHub storage:', gameData.githubStorage);
    
    if (gameData.isUploadedGame) {
      // 检查是否是GitHub存储的游戏
      if (gameData.githubStorage && gameData.gameUrl) {
        console.log('Using GitHub Pages URL:', gameData.gameUrl);
        return gameData.gameUrl;
      }
      
      // 对于本地上传的游戏，优先使用保存的 blob URL
      
      // 首先尝试使用 gameFileBlob（新版本）
      if (gameData.gameFileBlob) {
        console.log('Using gameFileBlob:', gameData.gameFileBlob);
        return gameData.gameFileBlob;
      }
      
      // 然后尝试使用 gameUrl 中的 blob URL
      if (gameData.gameUrl && gameData.gameUrl.startsWith('blob:')) {
        console.log('Using blob URL from gameUrl:', gameData.gameUrl);
        return gameData.gameUrl;
      }
      
      // 如果没有 blob URL，说明是旧数据或者 blob URL 已失效
      console.warn('No valid blob URL found for uploaded game:', gameData.title);
      console.warn('This usually means the page was refreshed and blob URLs became invalid');
      
      // 返回错误页面而不是尝试加载不存在的文件
      return 'data:text/html,<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>游戏文件不可用</h2><p>请重新上传游戏文件</p><p>原因：页面刷新后游戏文件链接失效</p></body></html>';
      
    } else {
      // 静态游戏使用传统路径
      const url = `/games/${gameData.slug}/index.html`;
      console.log('Platform game URL:', url);
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Game Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">The game you're looking for doesn't exist or has been removed.</p>
        <Link to="/games" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold">
          Browse Games
        </Link>
      </div>
    );
  }

  // Get category names for this game
  const gameCategories = (game.categoryIds || []).map(catId => 
    categories.find(cat => cat.id === catId)?.name
  ).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/games" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Games
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{game.title}</h1>
                <Rating value={game.rating || 0} />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {gameCategories.map((category, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                    {category}
                  </span>
                ))}
                {(game.tags || []).map((tag, index) => (
                  <span key={`tag-${index}`} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-600 mb-6">{game.description}</p>
              
              {/* Play button */}
              <button
                onClick={toggleFullscreen}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center w-full md:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play Now
              </button>
            </div>
            
            {/* Game iframe */}
            <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full max-w-lg mx-auto aspect-square'}`}>
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Debug info */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-10">
                <div>URL: {getGameUrl(game)}</div>
                <div>Type: {game.isUploadedGame ? 'Uploaded' : 'Platform'}</div>
              </div>
              
              <iframe
                src={getGameUrl(game)}
                title={game.title}
                className={`w-full ${isFullscreen ? 'h-full' : 'h-full'} border-0 rounded-lg`}
                allowFullScreen
                onLoad={() => console.log('Iframe loaded successfully')}
                onError={() => console.log('Iframe failed to load')}
              ></iframe>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments</h2>
            <CommentSection gameId={game.id} />
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Game stats */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Released</p>
                <p>{game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Developer</p>
                <p>{game.developer || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Times Played</p>
                <p>{(game.playCount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platforms</p>
                <div className="flex space-x-2 mt-1">
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Web</span>
                  {game.isMobile && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Mobile</span>
                  )}
                </div>
              </div>
              {game.isUploadedGame && (
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">User Upload</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Related games */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">You May Also Like</h2>
            <div className="space-y-4">
              {relatedGames.length > 0 ? (
                relatedGames.map(relatedGame => (
                  <GameCard key={relatedGame.id} game={relatedGame} compact />
                ))
              ) : (
                <p className="text-gray-500 text-sm">No related games found.</p>
              )}
            </div>
          </div>
          
          {/* Sidebar Ad */}
          <div className="bg-white rounded-lg shadow p-4">
            <AdBanner 
              type="vertical"
              size="medium"
              content={
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-green-400 to-blue-500 text-white">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-3">⭐</div>
                    <h3 className="text-lg font-bold mb-2">游戏推荐</h3>
                    <p className="text-sm opacity-90 mb-3">发现更多精彩游戏</p>
                    <Link 
                      to="/games" 
                      className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      浏览所有
                    </Link>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;