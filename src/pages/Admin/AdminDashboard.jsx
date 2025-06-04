import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { games } from '../../data/games';
import { GameStorage } from '../../utils/adminStorage';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPlays: 0,
    averageRating: 0,
    featuredGames: 0,
    mobileGames: 0,
    recentGames: []
  });

  useEffect(() => {
    try {
      // 获取所有游戏（静态 + 上传）
      const allGames = GameStorage.getAllManagedGames();
      
      // 计算统计数据
      const totalGames = allGames.length;
      const totalPlays = allGames.reduce((sum, game) => sum + (game.playCount || 0), 0);
      const averageRating = allGames.length > 0 
        ? allGames.reduce((sum, game) => sum + (game.rating || 0), 0) / allGames.length 
        : 0;
      const featuredGames = allGames.filter(game => game.featured).length;
      const mobileGames = allGames.filter(game => game.isMobile).length;
      
      // 最近游戏：按上传时间或发布日期排序
      const recentGames = allGames
        .sort((a, b) => {
          const dateA = new Date(a.uploadTime || a.releaseDate);
          const dateB = new Date(b.uploadTime || b.releaseDate);
          return dateB - dateA;
        })
        .slice(0, 5);

      setStats({
        totalGames,
        totalPlays,
        averageRating: Math.round(averageRating * 10) / 10,
        featuredGames,
        mobileGames,
        recentGames
      });
    } catch (error) {
      console.error('获取游戏统计数据失败:', error);
      // 如果出错，使用静态数据作为备用
      const totalGames = games.length;
      const totalPlays = games.reduce((sum, game) => sum + game.playCount, 0);
      const averageRating = games.reduce((sum, game) => sum + game.rating, 0) / games.length;
      const featuredGames = games.filter(game => game.featured).length;
      const mobileGames = games.filter(game => game.isMobile).length;
      const recentGames = games
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .slice(0, 5);

      setStats({
        totalGames,
        totalPlays,
        averageRating: Math.round(averageRating * 10) / 10,
        featuredGames,
        mobileGames,
        recentGames
      });
    }
  }, []);

  const quickActions = [
    {
      title: '上传新游戏',
      description: '添加新的游戏到平台',
      icon: '⬆️',
      link: '/admin/games/upload',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '游戏管理',
      description: '管理现有游戏内容',
      icon: '🎮',
      link: '/admin/games',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '广告设置',
      description: '配置广告展示策略',
      icon: '📢',
      link: '/admin/ads',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: '数据分析',
      description: '查看详细分析报告',
      icon: '📈',
      link: '/admin/analytics',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const statCards = [
    {
      title: '总游戏数',
      value: stats.totalGames,
      icon: '🎮',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '总游玩次数',
      value: stats.totalPlays.toLocaleString(),
      icon: '🎯',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '平均评分',
      value: stats.averageRating,
      icon: '⭐',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: '精选游戏',
      value: stats.featuredGames,
      icon: '🌟',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
        <p className="text-gray-600 mt-1">GameHub Pro 管理控制台概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`${action.color} text-white rounded-lg p-4 transition duration-200 transform hover:scale-105`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{action.icon}</div>
                <h3 className="font-semibold text-sm">{action.title}</h3>
                <p className="text-xs opacity-90 mt-1">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近游戏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近添加的游戏</h2>
          <div className="space-y-3">
            {stats.recentGames.map((game) => (
              <div key={game.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{game.title}</h3>
                  <p className="text-sm text-gray-600">{game.developer}</p>
                  <p className="text-xs text-gray-500">
                    发布日期: {new Date(game.releaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ⭐ {game.rating}
                  </p>
                  <p className="text-xs text-gray-600">
                    {game.playCount.toLocaleString()} 次游玩
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to="/admin/games"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              查看所有游戏 →
            </Link>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">游戏服务</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                正常运行
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">广告系统</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                正常运行
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">数据库</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                正常运行
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CDN 加速</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                优化中
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">今日数据概览</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">1,234</p>
                <p className="text-xs text-gray-600">新增用户</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">5,678</p>
                <p className="text-xs text-gray-600">游戏启动</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 