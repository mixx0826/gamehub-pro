/**
 * GitHub API 配置
 * 用于游戏文件存储和GitHub Pages部署
 */

// GitHub API基础配置
export const GITHUB_CONFIG = {
  // GitHub API基础URL
  API_BASE_URL: 'https://api.github.com',
  
  // GitHub Pages基础URL模板
  PAGES_BASE_URL: 'https://{owner}.github.io/{repo}',
  
  // 默认存储仓库名称模板
  DEFAULT_STORAGE_REPO: 'gamehub-storage',
  
  // API版本
  API_VERSION: '2022-11-28',
  
  // 默认分支
  DEFAULT_BRANCH: 'main',
  
  // 游戏文件存储路径
  GAMES_PATH: 'games',
  
  // 封面图片存储路径
  COVERS_PATH: 'covers',
  
  // 元数据文件路径
  METADATA_PATH: 'metadata'
};

// 环境变量配置
export const getGitHubConfig = () => {
  return {
    // GitHub访问令牌
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    
    // GitHub用户名/组织名
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    
    // 存储仓库名称
    storageRepo: import.meta.env.VITE_GITHUB_STORAGE_REPO || GITHUB_CONFIG.DEFAULT_STORAGE_REPO,
    
    // 是否启用GitHub存储
    enabled: !!(import.meta.env.VITE_GITHUB_TOKEN && import.meta.env.VITE_GITHUB_OWNER)
  };
};

// 获取GitHub Pages URL
export const getGitHubPagesUrl = (owner, repo, path = '') => {
  const baseUrl = GITHUB_CONFIG.PAGES_BASE_URL
    .replace('{owner}', owner)
    .replace('{repo}', repo);
  
  return path ? `${baseUrl}/${path}` : baseUrl;
};

// 验证GitHub配置
export const validateGitHubConfig = () => {
  const config = getGitHubConfig();
  const errors = [];
  
  if (!config.token) {
    errors.push('缺少GitHub访问令牌 (VITE_GITHUB_TOKEN)');
  }
  
  if (!config.owner) {
    errors.push('缺少GitHub用户名 (VITE_GITHUB_OWNER)');
  }
  
  if (!config.storageRepo) {
    errors.push('缺少存储仓库名称 (VITE_GITHUB_STORAGE_REPO)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    config
  };
}; 