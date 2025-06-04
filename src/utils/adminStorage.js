/**
 * 管理员后台数据存储工具
 * 基于localStorage实现的完整数据管理系统
 */

// 存储键名常量
const STORAGE_KEYS = {
  UPLOADED_GAMES: 'admin_uploaded_games',
  AD_POSITIONS: 'admin_ad_positions',
  AD_NETWORKS: 'admin_ad_networks',
  UPLOAD_HISTORY: 'admin_upload_history',
  SYSTEM_CONFIG: 'admin_system_config',
  USER_SETTINGS: 'admin_user_settings',
  PLATFORM_GAME_OVERRIDES: 'admin_platform_game_overrides'
};

/**
 * 基础存储操作
 */
const Storage = {
  // 保存数据
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      }));
      return true;
    } catch (error) {
      console.error('数据保存失败:', error);
      return false;
    }
  },

  // 获取数据
  get: (key, defaultValue = null) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      return parsed.data || defaultValue;
    } catch (error) {
      console.error('数据读取失败:', error);
      return defaultValue;
    }
  },

  // 删除数据
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('数据删除失败:', error);
      return false;
    }
  },

  // 清空所有管理员数据
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('数据清空失败:', error);
      return false;
    }
  }
};

/**
 * 游戏管理数据操作
 */
export const GameStorage = {
  // 保存上传的游戏
  saveGame: (gameData) => {
    const games = GameStorage.getAllGames();
    const newGame = {
      ...gameData,
      id: gameData.id || Date.now(),
      uploadTime: new Date().toISOString(),
      status: 'active'
    };
    
    const existingIndex = games.findIndex(game => game.id === newGame.id);
    if (existingIndex >= 0) {
      games[existingIndex] = newGame;
    } else {
      games.push(newGame);
    }
    
    return Storage.save(STORAGE_KEYS.UPLOADED_GAMES, games);
  },

  // 获取所有游戏
  getAllGames: () => {
    return Storage.get(STORAGE_KEYS.UPLOADED_GAMES, []);
  },

  // 获取单个游戏
  getGame: (gameId) => {
    const games = GameStorage.getAllGames();
    return games.find(game => game.id === gameId) || null;
  },

  // 更新游戏数据
  updateGame: (gameId, updates) => {
    const games = GameStorage.getAllGames();
    const gameIndex = games.findIndex(game => game.id === gameId);
    
    if (gameIndex >= 0) {
      games[gameIndex] = {
        ...games[gameIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };
      return Storage.save(STORAGE_KEYS.UPLOADED_GAMES, games);
    }
    return false;
  },

  // 更新游戏状态
  updateGameStatus: (gameId, status) => {
    const games = GameStorage.getAllGames();
    const gameIndex = games.findIndex(game => game.id === gameId);
    
    if (gameIndex >= 0) {
      games[gameIndex].status = status;
      games[gameIndex].lastModified = new Date().toISOString();
      return Storage.save(STORAGE_KEYS.UPLOADED_GAMES, games);
    }
    return false;
  },

  // 删除游戏
  deleteGame: (gameId) => {
    const games = GameStorage.getAllGames();
    const filteredGames = games.filter(game => game.id !== gameId);
    return Storage.save(STORAGE_KEYS.UPLOADED_GAMES, filteredGames);
  },

  // 批量操作
  batchUpdateGames: (gameIds, updates) => {
    const games = GameStorage.getAllGames();
    games.forEach(game => {
      if (gameIds.includes(game.id)) {
        Object.assign(game, updates, {
          lastModified: new Date().toISOString()
        });
      }
    });
    return Storage.save(STORAGE_KEYS.UPLOADED_GAMES, games);
  },

  // GitHub存储相关方法
  
  // 标记游戏为GitHub存储
  markAsGitHubStorage: (gameId, githubData) => {
    const games = GameStorage.getAllGames();
    const gameIndex = games.findIndex(game => game.id === gameId);
    
    if (gameIndex >= 0) {
      games[gameIndex] = {
        ...games[gameIndex],
        githubStorage: true,
        storageType: 'github',
        githubData: githubData,
        lastModified: new Date().toISOString()
      };
      return Storage.save(STORAGE_KEYS.UPLOADED_GAMES, games);
    }
    return false;
  },

  // 获取GitHub存储的游戏
  getGitHubStorageGames: () => {
    const games = GameStorage.getAllGames();
    return games.filter(game => game.githubStorage === true);
  },

  // 获取本地存储的游戏
  getLocalStorageGames: () => {
    const games = GameStorage.getAllGames();
    return games.filter(game => game.githubStorage !== true);
  },

  // 检查游戏存储类型
  getGameStorageType: (gameId) => {
    const game = GameStorage.getGame(gameId);
    if (!game) return null;
    
    if (game.githubStorage) return 'github';
    if (game.gameFileBlob || game.gameUrl?.startsWith('blob:')) return 'local-blob';
    return 'unknown';
  },

  // 迁移游戏到GitHub存储
  migrateToGitHubStorage: async (gameId, githubData) => {
    const game = GameStorage.getGame(gameId);
    if (!game) return false;
    
    // 更新游戏数据
    const updates = {
      githubStorage: true,
      storageType: 'github',
      githubData: githubData,
      // 保留原始数据作为备份
      originalData: {
        gameUrl: game.gameUrl,
        gameFileBlob: game.gameFileBlob,
        coverImageBlob: game.coverImageBlob
      },
      // 更新URL为GitHub Pages URL
      gameUrl: githubData.gameUrl,
      thumbnail: githubData.coverUrl || game.thumbnail,
      migratedAt: new Date().toISOString()
    };
    
    return GameStorage.updateGame(gameId, updates);
  },

  // 保存平台游戏状态覆盖
  savePlatformGameOverride: (gameId, overrides) => {
    const existingOverrides = GameStorage.getAllPlatformGameOverrides();
    const newOverride = {
      gameId,
      ...overrides,
      lastModified: new Date().toISOString()
    };
    
    const existingIndex = existingOverrides.findIndex(override => override.gameId === gameId);
    if (existingIndex >= 0) {
      existingOverrides[existingIndex] = newOverride;
    } else {
      existingOverrides.push(newOverride);
    }
    
    return Storage.save(STORAGE_KEYS.PLATFORM_GAME_OVERRIDES, existingOverrides);
  },

  // 获取所有平台游戏状态覆盖
  getAllPlatformGameOverrides: () => {
    return Storage.get(STORAGE_KEYS.PLATFORM_GAME_OVERRIDES, []);
  },

  // 获取平台游戏状态覆盖
  getPlatformGameOverride: (gameId) => {
    const overrides = GameStorage.getAllPlatformGameOverrides();
    return overrides.find(override => override.gameId === gameId) || null;
  },

  // 删除平台游戏状态覆盖
  deletePlatformGameOverride: (gameId) => {
    const overrides = GameStorage.getAllPlatformGameOverrides();
    const filteredOverrides = overrides.filter(override => override.gameId !== gameId);
    return Storage.save(STORAGE_KEYS.PLATFORM_GAME_OVERRIDES, filteredOverrides);
  },

  // 批量更新平台游戏状态
  batchUpdatePlatformGames: (gameIds, updates) => {
    const overrides = GameStorage.getAllPlatformGameOverrides();
    const timestamp = new Date().toISOString();
    
    gameIds.forEach(gameId => {
      const existingIndex = overrides.findIndex(override => override.gameId === gameId);
      const newOverride = {
        gameId,
        ...updates,
        lastModified: timestamp
      };
      
      if (existingIndex >= 0) {
        overrides[existingIndex] = { ...overrides[existingIndex], ...newOverride };
      } else {
        overrides.push(newOverride);
      }
    });
    
    return Storage.save(STORAGE_KEYS.PLATFORM_GAME_OVERRIDES, overrides);
  },

  // 合并平台游戏与状态覆盖
  mergePlatformGameWithOverride: (platformGame, override) => {
    if (!override) return platformGame;
    
    return {
      ...platformGame,
      ...override,
      id: platformGame.id, // 保持原始ID
      isPlatformGame: true, // 标记为平台游戏
      originalData: platformGame // 保存原始数据引用
    };
  },

  // 获取所有游戏（合并平台游戏和上传游戏）
  getAllManagedGames: () => {
    // 动态导入平台游戏数据（避免循环依赖）
    const platformGames = JSON.parse(JSON.stringify(window.__PLATFORM_GAMES__ || []));
    const uploadedGames = GameStorage.getAllGames();
    const overrides = GameStorage.getAllPlatformGameOverrides();
    
    // 处理平台游戏（应用状态覆盖）
    const managedPlatformGames = platformGames.map(game => {
      const override = overrides.find(o => o.gameId === game.id);
      return GameStorage.mergePlatformGameWithOverride(game, override);
    });
    
    // 标记上传游戏
    const managedUploadedGames = uploadedGames.map(game => ({
      ...game,
      isPlatformGame: false,
      isUploadedGame: true
    }));
    
    return [...managedPlatformGames, ...managedUploadedGames];
  },

  // 更新游戏（自动判断是平台游戏还是上传游戏）
  updateGameManaged: (gameId, updates) => {
    const allGames = GameStorage.getAllManagedGames();
    const game = allGames.find(g => g.id === gameId);
    
    if (!game) return false;
    
    if (game.isPlatformGame) {
      // 平台游戏使用状态覆盖
      return GameStorage.savePlatformGameOverride(gameId, updates);
    } else {
      // 上传游戏直接更新
      return GameStorage.updateGame(gameId, updates);
    }
  },

  // 删除游戏（自动判断类型）
  deleteGameManaged: (gameId) => {
    const allGames = GameStorage.getAllManagedGames();
    const game = allGames.find(g => g.id === gameId);
    
    if (!game) return false;
    
    if (game.isPlatformGame) {
      // 平台游戏设置为隐藏状态
      return GameStorage.savePlatformGameOverride(gameId, {
        status: 'hidden',
        hiddenAt: new Date().toISOString()
      });
    } else {
      // 上传游戏直接删除
      return GameStorage.deleteGame(gameId);
    }
  }
};

/**
 * 广告位管理数据操作
 */
export const AdPositionStorage = {
  // 保存广告位
  savePosition: (positionData) => {
    const positions = AdPositionStorage.getAllPositions();
    const newPosition = {
      ...positionData,
      id: positionData.id || Date.now(),
      createTime: positionData.createTime || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    const existingIndex = positions.findIndex(pos => pos.id === newPosition.id);
    if (existingIndex >= 0) {
      positions[existingIndex] = newPosition;
    } else {
      positions.push(newPosition);
    }
    
    return Storage.save(STORAGE_KEYS.AD_POSITIONS, positions);
  },

  // 获取所有广告位
  getAllPositions: () => {
    return Storage.get(STORAGE_KEYS.AD_POSITIONS, []);
  },

  // 获取单个广告位
  getPosition: (positionId) => {
    const positions = AdPositionStorage.getAllPositions();
    return positions.find(pos => pos.id === positionId) || null;
  },

  // 更新广告位状态
  updatePositionStatus: (positionId, status) => {
    const positions = AdPositionStorage.getAllPositions();
    const positionIndex = positions.findIndex(pos => pos.id === positionId);
    
    if (positionIndex >= 0) {
      positions[positionIndex].status = status;
      positions[positionIndex].lastModified = new Date().toISOString();
      return Storage.save(STORAGE_KEYS.AD_POSITIONS, positions);
    }
    return false;
  },

  // 删除广告位
  deletePosition: (positionId) => {
    const positions = AdPositionStorage.getAllPositions();
    const filteredPositions = positions.filter(pos => pos.id !== positionId);
    return Storage.save(STORAGE_KEYS.AD_POSITIONS, filteredPositions);
  },

  // 更新广告位数据（收益、展示、点击等）
  updatePositionMetrics: (positionId, metrics) => {
    const positions = AdPositionStorage.getAllPositions();
    const positionIndex = positions.findIndex(pos => pos.id === positionId);
    
    if (positionIndex >= 0) {
      Object.assign(positions[positionIndex], metrics, {
        lastUpdated: new Date().toISOString()
      });
      return Storage.save(STORAGE_KEYS.AD_POSITIONS, positions);
    }
    return false;
  }
};

/**
 * 广告联盟管理数据操作
 */
export const AdNetworkStorage = {
  // 保存广告联盟配置
  saveNetwork: (networkData) => {
    const networks = AdNetworkStorage.getAllNetworks();
    const newNetwork = {
      ...networkData,
      id: networkData.id || Date.now(),
      createTime: networkData.createTime || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    const existingIndex = networks.findIndex(net => net.id === newNetwork.id);
    if (existingIndex >= 0) {
      networks[existingIndex] = newNetwork;
    } else {
      networks.push(newNetwork);
    }
    
    return Storage.save(STORAGE_KEYS.AD_NETWORKS, networks);
  },

  // 获取所有广告联盟
  getAllNetworks: () => {
    return Storage.get(STORAGE_KEYS.AD_NETWORKS, []);
  },

  // 获取单个广告联盟
  getNetwork: (networkId) => {
    const networks = AdNetworkStorage.getAllNetworks();
    return networks.find(net => net.id === networkId) || null;
  },

  // 更新联盟状态
  updateNetworkStatus: (networkId, status) => {
    const networks = AdNetworkStorage.getAllNetworks();
    const networkIndex = networks.findIndex(net => net.id === networkId);
    
    if (networkIndex >= 0) {
      networks[networkIndex].status = status;
      networks[networkIndex].lastModified = new Date().toISOString();
      return Storage.save(STORAGE_KEYS.AD_NETWORKS, networks);
    }
    return false;
  },

  // 更新联盟指标
  updateNetworkMetrics: (networkId, metrics) => {
    const networks = AdNetworkStorage.getAllNetworks();
    const networkIndex = networks.findIndex(net => net.id === networkId);
    
    if (networkIndex >= 0) {
      Object.assign(networks[networkIndex], metrics, {
        lastUpdated: new Date().toISOString()
      });
      return Storage.save(STORAGE_KEYS.AD_NETWORKS, networks);
    }
    return false;
  }
};

/**
 * 上传历史记录管理
 */
export const UploadHistoryStorage = {
  // 添加上传记录
  addUploadRecord: (record) => {
    const history = UploadHistoryStorage.getUploadHistory();
    const newRecord = {
      ...record,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: record.status || 'completed'
    };
    
    history.unshift(newRecord); // 最新记录在前
    
    // 只保留最近1000条记录
    if (history.length > 1000) {
      history.splice(1000);
    }
    
    return Storage.save(STORAGE_KEYS.UPLOAD_HISTORY, history);
  },

  // 获取上传历史
  getUploadHistory: (limit = 0) => {
    const history = Storage.get(STORAGE_KEYS.UPLOAD_HISTORY, []);
    return limit > 0 ? history.slice(0, limit) : history;
  },

  // 清空上传历史
  clearUploadHistory: () => {
    return Storage.save(STORAGE_KEYS.UPLOAD_HISTORY, []);
  },

  // 获取上传统计
  getUploadStats: () => {
    const history = UploadHistoryStorage.getUploadHistory();
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: history.length,
      today: history.filter(record => 
        new Date(record.timestamp).toDateString() === today
      ).length,
      thisWeek: history.filter(record => 
        new Date(record.timestamp) >= thisWeek
      ).length,
      successful: history.filter(record => 
        record.status === 'completed'
      ).length,
      failed: history.filter(record => 
        record.status === 'failed'
      ).length
    };
  }
};

/**
 * 系统配置管理
 */
export const SystemConfigStorage = {
  // 保存系统配置
  saveConfig: (config) => {
    const currentConfig = SystemConfigStorage.getConfig();
    const newConfig = {
      ...currentConfig,
      ...config,
      lastModified: new Date().toISOString()
    };
    return Storage.save(STORAGE_KEYS.SYSTEM_CONFIG, newConfig);
  },

  // 获取系统配置
  getConfig: () => {
    return Storage.get(STORAGE_KEYS.SYSTEM_CONFIG, {
      siteName: 'GameHub Pro',
      maxUploadSize: 50 * 1024 * 1024, // 50MB
      allowedFileTypes: ['.zip', '.html', '.js'],
      autoApproveUploads: false,
      enableAdTracking: true,
      defaultAdFrequency: 'medium',
      maintenanceMode: false
    });
  },

  // 更新特定配置项
  updateConfigItem: (key, value) => {
    const config = SystemConfigStorage.getConfig();
    config[key] = value;
    return SystemConfigStorage.saveConfig(config);
  }
};

/**
 * 用户设置管理
 */
export const UserSettingsStorage = {
  // 保存用户设置
  saveSettings: (settings) => {
    const currentSettings = UserSettingsStorage.getSettings();
    const newSettings = {
      ...currentSettings,
      ...settings,
      lastModified: new Date().toISOString()
    };
    return Storage.save(STORAGE_KEYS.USER_SETTINGS, newSettings);
  },

  // 获取用户设置
  getSettings: () => {
    return Storage.get(STORAGE_KEYS.USER_SETTINGS, {
      theme: 'light',
      language: 'zh-CN',
      dashboardLayout: 'default',
      notificationsEnabled: true,
      autoSaveEnabled: true,
      itemsPerPage: 20
    });
  },

  // 更新特定设置项
  updateSetting: (key, value) => {
    const settings = UserSettingsStorage.getSettings();
    settings[key] = value;
    return UserSettingsStorage.saveSettings(settings);
  }
};

/**
 * 数据导出导入工具
 */
export const DataManagement = {
  // 导出所有管理员数据
  exportAllData: () => {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = Storage.get(storageKey, null);
    });
    
    return {
      data,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
  },

  // 导入数据
  importData: (importData) => {
    try {
      if (!importData.data) return false;
      
      Object.entries(importData.data).forEach(([key, value]) => {
        if (STORAGE_KEYS[key] && value !== null) {
          Storage.save(STORAGE_KEYS[key], value);
        }
      });
      
      return true;
    } catch (error) {
      console.error('数据导入失败:', error);
      return false;
    }
  },

  // 获取存储使用情况
  getStorageInfo: () => {
    const usage = {};
    let totalSize = 0;
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      const size = data ? new Blob([data]).size : 0;
      usage[key] = {
        size,
        sizeFormatted: (size / 1024).toFixed(2) + ' KB',
        records: data ? (JSON.parse(data).data?.length || 0) : 0
      };
      totalSize += size;
    });
    
    return {
      usage,
      totalSize,
      totalSizeFormatted: (totalSize / 1024).toFixed(2) + ' KB'
    };
  }
};

// 默认导出包含所有功能的对象
export default {
  Storage,
  GameStorage,
  AdPositionStorage,
  AdNetworkStorage,
  UploadHistoryStorage,
  SystemConfigStorage,
  UserSettingsStorage,
  DataManagement
}; 