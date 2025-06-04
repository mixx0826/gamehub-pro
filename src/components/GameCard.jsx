import React from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';

function GameCard({ game, featured = false, compact = false }) {
  // 获取游戏封面图片URL
  const getThumbnailUrl = (game) => {
    if (game.isUploadedGame && game.coverImageBlob) {
      // 对于上传游戏，如果有blob URL则使用
      return game.coverImageBlob;
    }
    return game.thumbnail;
  };

  if (compact) {
    return (
      <Link to={`/games/${game.id}`} className="flex items-center space-x-3 group">
        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
          <img 
            src={getThumbnailUrl(game)} 
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // 如果图片加载失败，使用默认图片
              e.target.src = '/api/placeholder/64/64';
            }}
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{game.title}</h3>
          <div className="flex items-center space-x-2">
            <Rating value={game.rating} small />
            <span className="text-xs text-gray-500">{(game.playCount || 0).toLocaleString()} plays</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${featured ? 'border-2 border-indigo-500' : ''}`}>
      {featured && (
        <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 text-center">
          FEATURED GAME
        </div>
      )}
      
      <Link to={`/games/${game.id}`} className="block relative group">
        <div className="aspect-video overflow-hidden">
          <img 
            src={getThumbnailUrl(game)} 
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // 如果图片加载失败，使用默认图片
              e.target.src = '/api/placeholder/400/225';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium">
            Play Now
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800">
            <Link to={`/games/${game.id}`} className="hover:text-indigo-600 transition-colors">
              {game.title}
            </Link>
          </h3>
          <Rating value={game.rating} />
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{game.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {(game.tags || []).slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {(game.tags || []).length > 2 && (
              <span className="text-gray-500 text-xs">+{(game.tags || []).length - 2} more</span>
            )}
          </div>
          <span className="text-xs text-gray-500">{(game.playCount || 0).toLocaleString()} plays</span>
        </div>
      </div>
    </div>
  );
}

export default GameCard;