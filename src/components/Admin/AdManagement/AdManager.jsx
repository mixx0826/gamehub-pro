import React, { useState, useEffect } from 'react';
import { games } from '../../../data/games';
import { AdPositionStorage, AdNetworkStorage } from '../../../utils/adminStorage';

const AdManager = () => {
  const [activeTab, setActiveTab] = useState('positions');
  const [adPositions, setAdPositions] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdPosition, setNewAdPosition] = useState({
    name: '',
    type: 'banner',
    location: '',
    size: '',
    frequency: 'medium'
  });

  // 初始化数据加载
  useEffect(() => {
    loadAdPositions();
    loadAdNetworks();
  }, []);

  // 加载广告位数据
  const loadAdPositions = () => {
    const savedPositions = AdPositionStorage.getAllPositions();
    
    // 如果没有保存的数据，使用默认数据
    if (savedPositions.length === 0) {
      const defaultPositions = [
        {
          id: 1,
          name: '首页横幅',
          type: 'banner',
          location: 'homepage-top',
          size: '728x90',
          status: 'active',
          revenue: 1250.50,
          impressions: 45230,
          clicks: 891
        },
        {
          id: 2,
          name: '游戏详情页插屏',
          type: 'interstitial',
          location: 'game-detail',
          size: '320x480',
          status: 'active',
          revenue: 2180.75,
          impressions: 28450,
          clicks: 1205
        },
        {
          id: 3,
          name: '游戏结束奖励视频',
          type: 'rewarded_video',
          location: 'game-end',
          size: 'fullscreen',
          status: 'active',
          revenue: 3250.25,
          impressions: 15670,
          clicks: 2340
        }
      ];
      
      // 保存默认数据
      defaultPositions.forEach(position => {
        AdPositionStorage.savePosition(position);
      });
      
      setAdPositions(defaultPositions);
    } else {
      setAdPositions(savedPositions);
    }
  };

  // 加载广告联盟数据
  const loadAdNetworks = () => {
    const savedNetworks = AdNetworkStorage.getAllNetworks();
    
    // 如果没有保存的数据，使用默认数据
    if (savedNetworks.length === 0) {
      const defaultNetworks = [
        {
          id: 1,
          name: 'Google AdMob',
          status: 'connected',
          revenue: 4580.25,
          fillRate: 94.5,
          eCPM: 2.85
        },
        {
          id: 2,
          name: 'Unity Ads',
          status: 'connected',
          revenue: 3240.75,
          fillRate: 87.2,
          eCPM: 3.10
        },
        {
          id: 3,
          name: 'AppLovin MAX',
          status: 'pending',
          revenue: 0,
          fillRate: 0,
          eCPM: 0
        }
      ];
      
      // 保存默认数据
      defaultNetworks.forEach(network => {
        AdNetworkStorage.saveNetwork(network);
      });
      
      setNetworks(defaultNetworks);
    } else {
      setNetworks(savedNetworks);
    }
  };

  // 广告类型选项
  const adTypes = [
    { value: 'banner', label: '横幅广告', sizes: ['320x50', '728x90', '300x250'] },
    { value: 'interstitial', label: '插屏广告', sizes: ['320x480', '480x320', '768x1024'] },
    { value: 'rewarded_video', label: '奖励视频', sizes: ['fullscreen'] },
    { value: 'native', label: '原生广告', sizes: ['custom'] }
  ];

  // 位置选项
  const locationOptions = [
    { value: 'homepage-top', label: '首页顶部' },
    { value: 'homepage-bottom', label: '首页底部' },
    { value: 'game-detail', label: '游戏详情页' },
    { value: 'game-list', label: '游戏列表页' },
    { value: 'game-start', label: '游戏开始前' },
    { value: 'game-end', label: '游戏结束后' },
    { value: 'game-pause', label: '游戏暂停时' }
  ];

  // 计算总收益
  const totalRevenue = adPositions.reduce((sum, pos) => sum + pos.revenue, 0);
  const totalImpressions = adPositions.reduce((sum, pos) => sum + pos.impressions, 0);
  const totalClicks = adPositions.reduce((sum, pos) => sum + pos.clicks, 0);
  const averageCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  // 处理新建广告位
  const handleCreateAdPosition = () => {
    const position = {
      id: Date.now(),
      ...newAdPosition,
      status: 'pending',
      revenue: 0,
      impressions: 0,
      clicks: 0
    };
    
    // 保存到存储
    const saveSuccess = AdPositionStorage.savePosition(position);
    
    if (saveSuccess) {
      setAdPositions([...adPositions, position]);
      setNewAdPosition({
        name: '',
        type: 'banner',
        location: '',
        size: '',
        frequency: 'medium'
      });
      setShowCreateModal(false);
    } else {
      if (window.showToast) {
        window.showToast('error', '保存失败，请重试');
      }
    }
  };

  // 切换广告位状态
  const toggleAdStatus = (id) => {
    const position = adPositions.find(pos => pos.id === id);
    const newStatus = position.status === 'active' ? 'paused' : 'active';
    
    // 更新存储
    const updateSuccess = AdPositionStorage.updatePositionStatus(id, newStatus);
    
    if (updateSuccess) {
      setAdPositions(positions => 
        positions.map(pos => 
          pos.id === id 
            ? { ...pos, status: newStatus }
            : pos
        )
      );
    } else {
      if (window.showToast) {
        window.showToast('error', '状态更新失败');
      }
    }
  };

  // 删除广告位
  const deleteAdPosition = (id) => {
    if (window.confirm('确定要删除这个广告位吗？')) {
      const deleteSuccess = AdPositionStorage.deletePosition(id);
      
      if (deleteSuccess) {
        setAdPositions(positions => positions.filter(pos => pos.id !== id));
      } else {
        if (window.showToast) {
          window.showToast('error', '删除失败，请重试');
        }
      }
    }
  };

  const renderPositionsTab = () => (
    <div className="space-y-6">
      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">总收益</div>
          <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">总展示</div>
          <div className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">总点击</div>
          <div className="text-2xl font-bold text-purple-600">{totalClicks.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">平均CTR</div>
          <div className="text-2xl font-bold text-orange-600">{averageCTR}%</div>
        </div>
      </div>

      {/* 广告位列表 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">广告位管理</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + 新建广告位
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">广告位名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">位置</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">尺寸</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">收益</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">展示</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{position.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {position.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {position.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {position.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      position.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : position.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {position.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${position.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {position.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAdStatus(position.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          position.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {position.status === 'active' ? '暂停' : '启用'}
                      </button>
                      <button
                        onClick={() => deleteAdPosition(position.id)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNetworksTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">广告联盟管理</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {networks.map((network) => (
              <div key={network.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">{network.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    network.status === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {network.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">收益:</span>
                    <span className="text-sm font-medium">${network.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">填充率:</span>
                    <span className="text-sm font-medium">{network.fillRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">eCPM:</span>
                    <span className="text-sm font-medium">${network.eCPM.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                    配置设置
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">广告效果分析</h3>
        
        {/* 图表占位符 */}
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📈</div>
            <p>收益趋势图表</p>
            <p className="text-sm">(图表组件待集成)</p>
          </div>
        </div>
        
        {/* 详细数据表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">按游戏分析</h4>
            <div className="space-y-2">
              {games.slice(0, 5).map((game) => (
                <div key={game.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{game.title}</span>
                  <span className="text-sm font-medium">${(Math.random() * 500).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">按时段分析</h4>
            <div className="space-y-2">
              {['上午 (8-12)', '下午 (12-18)', '晚上 (18-24)', '深夜 (0-8)'].map((period, index) => (
                <div key={period} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{period}</span>
                  <span className="text-sm font-medium">${(Math.random() * 200 + 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">广告管理</h1>
        <p className="text-gray-600 mt-1">管理广告位、联盟和效果分析</p>
      </div>

      {/* 标签导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'positions', label: '广告位管理', icon: '📍' },
            { id: 'networks', label: '广告联盟', icon: '🌐' },
            { id: 'analytics', label: '数据分析', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 标签内容 */}
      <div>
        {activeTab === 'positions' && renderPositionsTab()}
        {activeTab === 'networks' && renderNetworksTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      {/* 创建广告位模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">新建广告位</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广告位名称</label>
                  <input
                    type="text"
                    value={newAdPosition.name}
                    onChange={(e) => setNewAdPosition({...newAdPosition, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入广告位名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广告类型</label>
                  <select
                    value={newAdPosition.type}
                    onChange={(e) => setNewAdPosition({...newAdPosition, type: e.target.value, size: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {adTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">展示位置</label>
                  <select
                    value={newAdPosition.location}
                    onChange={(e) => setNewAdPosition({...newAdPosition, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择位置</option>
                    {locationOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广告尺寸</label>
                  <select
                    value={newAdPosition.size}
                    onChange={(e) => setNewAdPosition({...newAdPosition, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择尺寸</option>
                    {adTypes.find(type => type.value === newAdPosition.type)?.sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateAdPosition}
                  disabled={!newAdPosition.name || !newAdPosition.location || !newAdPosition.size}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdManager; 