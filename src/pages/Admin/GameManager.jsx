import React, { useState, useEffect, useMemo } from 'react';
import { GameStorage } from '../../utils/adminStorage';
import { categories } from '../../data/categories';
import GameEditModal from '../../components/Admin/GameManagement/GameEditModal';

const GameManager = () => {
  // 状态管理
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedGames, setSelectedGames] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 加载游戏数据
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const allGames = GameStorage.getAllManagedGames();
      setGames(allGames);
    } catch (error) {
      console.error('加载游戏数据失败:', error);
      if (window.showToast) {
        window.showToast('error', '加载游戏数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 筛选和排序游戏
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games];

    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(term) ||
        game.developer.toLowerCase().includes(term) ||
        game.description.toLowerCase().includes(term)
      );
    }

    // 分类筛选
    if (selectedCategory) {
      filtered = filtered.filter(game =>
        game.categoryIds?.includes(parseInt(selectedCategory))
      );
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(game => {
        const status = game.status || 'active';
        return status === statusFilter;
      });
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [games, searchTerm, selectedCategory, statusFilter, sortBy, sortOrder]);

  // 分页处理
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedGames.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedGames, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);

  // 处理游戏选择
  const handleGameSelect = (gameId, isSelected) => {
    if (isSelected) {
      setSelectedGames([...selectedGames, gameId]);
    } else {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedGames.length === paginatedGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(paginatedGames.map(game => game.id));
    }
  };

  // 切换游戏精选状态
  const handleToggleFeatured = async (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const newFeaturedStatus = !game.featured;
    const success = await GameStorage.updateGame(gameId, { featured: newFeaturedStatus });
    
    if (success) {
      loadGames();
      if (window.showToast) {
        window.showToast('success', `游戏已${newFeaturedStatus ? '设为' : '取消'}精选`);
      }
    }
  };

  // 切换游戏状态
  const handleToggleStatus = async (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const currentStatus = game.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const success = await GameStorage.updateGame(gameId, { status: newStatus });
    
    if (success) {
      loadGames();
      if (window.showToast) {
        window.showToast('success', `游戏已${newStatus === 'active' ? '上架' : '下架'}`);
      }
    }
  };

  // 删除游戏
  const handleDeleteGame = async (gameId) => {
    if (!confirm('确定要删除这个游戏吗？')) return;

    const success = await GameStorage.deleteGameManaged(gameId);
    
    if (success) {
      loadGames();
      setSelectedGames(selectedGames.filter(id => id !== gameId));
      if (window.showToast) {
        window.showToast('success', '游戏已删除');
      }
    }
  };

  // 批量操作
  const handleBatchOperation = async (operation) => {
    if (selectedGames.length === 0) {
      if (window.showToast) {
        window.showToast('warning', '请先选择要操作的游戏');
      }
      return;
    }

    let updates = {};
    let message = '';

    switch (operation) {
      case 'feature':
        updates = { featured: true };
        message = '已设为精选';
        break;
      case 'unfeature':
        updates = { featured: false };
        message = '已取消精选';
        break;
      case 'activate':
        updates = { status: 'active' };
        message = '已上架';
        break;
      case 'deactivate':
        updates = { status: 'inactive' };
        message = '已下架';
        break;
      case 'hide':
        updates = { status: 'hidden' };
        message = '已隐藏';
        break;
      case 'hidePlatformGames':
        // 专门处理平台游戏隐藏
        const allGames = GameStorage.getAllManagedGames();
        const platformGameIds = selectedGames.filter(gameId => {
          const game = allGames.find(g => g.id === gameId);
          return game?.isPlatformGame;
        });
        
        if (platformGameIds.length === 0) {
          if (window.showToast) {
            window.showToast('warning', '所选游戏中没有平台游戏');
          }
          return;
        }
        
        if (!confirm(`确定要隐藏选中的 ${platformGameIds.length} 个平台游戏吗？这将在管理页面隐藏它们，但不会删除原始数据。`)) return;
        
        const success = await GameStorage.batchUpdatePlatformGames(platformGameIds, { status: 'hidden' });
        
        if (success) {
          loadGames();
          setSelectedGames([]);
          if (window.showToast) {
            window.showToast('success', `已隐藏 ${platformGameIds.length} 个平台游戏`);
          }
        }
        return;
      case 'delete':
        if (!confirm(`确定要删除选中的 ${selectedGames.length} 个游戏吗？`)) return;
        
        for (const gameId of selectedGames) {
          await GameStorage.deleteGameManaged(gameId);
        }
        setSelectedGames([]);
        loadGames();
        if (window.showToast) {
          window.showToast('success', '批量删除完成');
        }
        return;
    }

    // 分别处理平台游戏和上传游戏的批量更新
    const allGames = GameStorage.getAllManagedGames();
    const platformGameIds = [];
    const uploadedGameIds = [];
    
    selectedGames.forEach(gameId => {
      const game = allGames.find(g => g.id === gameId);
      if (game?.isPlatformGame) {
        platformGameIds.push(gameId);
      } else {
        uploadedGameIds.push(gameId);
      }
    });

    // 执行批量更新
    let success = true;
    
    if (platformGameIds.length > 0) {
      success = success && await GameStorage.batchUpdatePlatformGames(platformGameIds, updates);
    }
    
    if (uploadedGameIds.length > 0) {
      success = success && await GameStorage.batchUpdateGames(uploadedGameIds, updates);
    }
    
    if (success) {
      loadGames();
      setSelectedGames([]);
      if (window.showToast) {
        window.showToast('success', `批量操作完成：${message}`);
      }
    } else {
      if (window.showToast) {
        window.showToast('error', '批量操作部分失败，请重试');
      }
    }
  };

  // 获取状态显示文本和样式
  const getStatusInfo = (game) => {
    const status = game.status || 'active';
    switch (status) {
      case 'active':
        return { text: '已上架', class: 'bg-green-100 text-green-800' };
      case 'inactive':
        return { text: '已下架', class: 'bg-yellow-100 text-yellow-800' };
      case 'hidden':
        return { text: '已隐藏', class: 'bg-gray-100 text-gray-800' };
      default:
        return { text: '未知', class: 'bg-gray-100 text-gray-800' };
    }
  };

  // 隐藏所有平台游戏
  const handleHideAllPlatformGames = async () => {
    const allGames = GameStorage.getAllManagedGames();
    const platformGames = allGames.filter(game => game.isPlatformGame && game.status !== 'hidden');
    
    if (platformGames.length === 0) {
      if (window.showToast) {
        window.showToast('info', '没有需要隐藏的平台游戏');
      }
      return;
    }
    
    if (!confirm(`确定要隐藏全部 ${platformGames.length} 个平台游戏吗？这将清理游戏列表，只显示你上传的游戏。`)) return;
    
    const platformGameIds = platformGames.map(game => game.id);
    const success = await GameStorage.batchUpdatePlatformGames(platformGameIds, { status: 'hidden' });
    
    if (success) {
      loadGames();
      if (window.showToast) {
        window.showToast('success', `已隐藏 ${platformGames.length} 个平台游戏`);
      }
    } else {
      if (window.showToast) {
        window.showToast('error', '批量隐藏失败，请重试');
      }
    }
  };

  // 显示所有游戏
  const handleShowAllGames = async () => {
    const allOverrides = GameStorage.getAllPlatformGameOverrides();
    const hiddenGames = allOverrides.filter(override => override.status === 'hidden');
    
    if (hiddenGames.length === 0) {
      if (window.showToast) {
        window.showToast('info', '没有隐藏的游戏需要显示');
      }
      return;
    }
    
    if (!confirm(`确定要显示全部 ${hiddenGames.length} 个隐藏的游戏吗？`)) return;
    
    const gameIds = hiddenGames.map(override => override.gameId);
    const success = await GameStorage.batchUpdatePlatformGames(gameIds, { status: 'active' });
    
    if (success) {
      loadGames();
      if (window.showToast) {
        window.showToast('success', `已显示 ${hiddenGames.length} 个游戏`);
      }
    } else {
      if (window.showToast) {
        window.showToast('error', '批量显示失败，请重试');
      }
    }
  };

  // 调试游戏数据
  const handleDebugGames = () => {
    const uploadedGames = GameStorage.getAllGames();
    const platformGames = window.__PLATFORM_GAMES__ || [];
    const overrides = GameStorage.getAllPlatformGameOverrides();
    const allManagedGames = GameStorage.getAllManagedGames();
    
    console.log('=== 游戏数据调试信息 ===');
    console.log('上传的游戏:', uploadedGames);
    console.log('平台游戏:', platformGames);
    console.log('平台游戏覆盖:', overrides);
    console.log('合并后的游戏:', allManagedGames);
    console.log('当前显示的游戏:', games);
    
    if (window.showToast) {
      window.showToast('info', `调试信息已输出到控制台。上传游戏: ${uploadedGames.length}, 平台游戏: ${platformGames.length}, 总计: ${allManagedGames.length}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">游戏管理</h1>
            <p className="text-gray-600 mt-1">管理平台上的所有游戏，包括上传的游戏和平台默认游戏</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDebugGames}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              调试游戏数据
            </button>
            <button
              onClick={handleHideAllPlatformGames}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              隐藏所有平台游戏
            </button>
            <button
              onClick={handleShowAllGames}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              显示所有游戏
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="游戏名称、开发者、描述..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分类筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有状态</option>
              <option value="active">已上架</option>
              <option value="inactive">已下架</option>
              <option value="hidden">已隐藏</option>
            </select>
          </div>

          {/* 排序 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title-asc">标题 A-Z</option>
              <option value="title-desc">标题 Z-A</option>
              <option value="releaseDate-desc">发布时间 新-旧</option>
              <option value="releaseDate-asc">发布时间 旧-新</option>
              <option value="rating-desc">评分 高-低</option>
              <option value="rating-asc">评分 低-高</option>
              <option value="playCount-desc">游玩次数 多-少</option>
              <option value="playCount-asc">游玩次数 少-多</option>
            </select>
          </div>
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedGames.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              已选择 {selectedGames.length} 个游戏
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBatchOperation('feature')}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                设为精选
              </button>
              <button
                onClick={() => handleBatchOperation('unfeature')}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                取消精选
              </button>
              <button
                onClick={() => handleBatchOperation('activate')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                上架
              </button>
              <button
                onClick={() => handleBatchOperation('deactivate')}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
              >
                下架
              </button>
              <button
                onClick={() => handleBatchOperation('hide')}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                隐藏
              </button>
              <button
                onClick={() => handleBatchOperation('hidePlatformGames')}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                批量隐藏平台游戏
              </button>
              <button
                onClick={() => handleBatchOperation('delete')}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{games.length}</div>
          <div className="text-sm text-gray-600">总游戏数</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {games.filter(g => (g.status || 'active') === 'active').length}
          </div>
          <div className="text-sm text-gray-600">已上架</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {games.filter(g => g.featured).length}
          </div>
          <div className="text-sm text-gray-600">精选游戏</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {filteredAndSortedGames.length}
          </div>
          <div className="text-sm text-gray-600">筛选结果</div>
        </div>
      </div>

      {/* 游戏列表表格 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={paginatedGames.length > 0 && selectedGames.length === paginatedGames.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                游戏信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                数据
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedGames.map((game) => {
              const statusInfo = getStatusInfo(game);
              const gameCategories = categories.filter(cat => 
                game.categoryIds?.includes(cat.id)
              );

              return (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedGames.includes(game.id)}
                      onChange={(e) => handleGameSelect(game.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={game.thumbnail || '/assets/images/placeholder.svg'}
                        alt={game.title}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="font-medium text-gray-900 flex items-center">
                          {game.title}
                          {game.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              精选
                            </span>
                          )}
                          {game.isPlatformGame && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              平台
                            </span>
                          )}
                          {game.isUploadedGame && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              上传
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{game.developer}</div>
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {game.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {gameCategories.map(category => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>评分: ⭐ {game.rating || 0}</div>
                    <div>游玩: {(game.playCount || 0).toLocaleString()}</div>
                    <div>发布: {game.releaseDate || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingGame(game);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(game.id)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        {game.featured ? '取消精选' : '设为精选'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(game.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        {(game.status || 'active') === 'active' ? '下架' : '上架'}
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {paginatedGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到符合条件的游戏</p>
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedGames.length)} 
            共 {filteredAndSortedGames.length} 条记录
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 游戏编辑模态框 */}
      <GameEditModal
        game={editingGame}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingGame(null);
        }}
        onSave={() => {
          loadGames(); // 重新加载游戏列表
        }}
      />
    </div>
  );
};

export default GameManager; 