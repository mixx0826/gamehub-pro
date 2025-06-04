/**
 * GitHub存储服务
 * 提供游戏文件上传到GitHub和GitHub Pages部署功能
 */

import { GITHUB_CONFIG, getGitHubConfig, getGitHubPagesUrl, validateGitHubConfig } from '../config/github';

export class GitHubStorage {
  constructor() {
    this.config = getGitHubConfig();
    this.baseHeaders = {
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_CONFIG.API_VERSION
    };
  }

  /**
   * 验证配置并检查仓库状态
   */
  async validateAndInit() {
    const validation = validateGitHubConfig();
    if (!validation.valid) {
      throw new Error(`GitHub配置错误: ${validation.errors.join(', ')}`);
    }

    // 检查存储仓库是否存在
    const repoExists = await this.checkRepository();
    if (!repoExists) {
      console.log('存储仓库不存在，准备创建...');
      await this.createStorageRepository();
    }

    // 检查GitHub Pages是否启用
    await this.ensureGitHubPages();
    
    return true;
  }

  /**
   * 检查仓库是否存在
   */
  async checkRepository() {
    try {
      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${this.config.owner}/${this.config.storageRepo}`,
        { headers: this.baseHeaders }
      );
      return response.ok;
    } catch (error) {
      console.error('检查仓库失败:', error);
      return false;
    }
  }

  /**
   * 创建存储仓库
   */
  async createStorageRepository() {
    try {
      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/user/repos`,
        {
          method: 'POST',
          headers: {
            ...this.baseHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.config.storageRepo,
            description: 'GameHub Pro - Game Files Storage Repository',
            private: false, // 必须为public才能使用GitHub Pages
            auto_init: true,
            gitignore_template: null,
            license_template: null
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`创建仓库失败: ${error.message}`);
      }

      console.log('存储仓库创建成功');
      return await response.json();
    } catch (error) {
      console.error('创建存储仓库失败:', error);
      throw error;
    }
  }

  /**
   * 确保GitHub Pages已启用
   */
  async ensureGitHubPages() {
    try {
      // 检查Pages状态
      let response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${this.config.owner}/${this.config.storageRepo}/pages`,
        { headers: this.baseHeaders }
      );

      if (response.status === 404) {
        // Pages未启用，尝试启用
        console.log('启用GitHub Pages...');
        response = await fetch(
          `${GITHUB_CONFIG.API_BASE_URL}/repos/${this.config.owner}/${this.config.storageRepo}/pages`,
          {
            method: 'POST',
            headers: {
              ...this.baseHeaders,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              source: {
                branch: GITHUB_CONFIG.DEFAULT_BRANCH,
                path: '/'
              }
            })
          }
        );

        if (!response.ok && response.status !== 409) { // 409表示已存在
          console.warn('启用GitHub Pages失败，可能需要手动配置');
        } else {
          console.log('GitHub Pages启用成功');
        }
      } else if (response.ok) {
        console.log('GitHub Pages已启用');
      }
    } catch (error) {
      console.warn('检查GitHub Pages状态失败:', error);
    }
  }

  /**
   * 上传文件到GitHub
   */
  async uploadFile(path, content, message, options = {}) {
    try {
      // 获取文件当前SHA（如果存在）
      let sha = null;
      try {
        const existingResponse = await fetch(
          `${GITHUB_CONFIG.API_BASE_URL}/repos/${this.config.owner}/${this.config.storageRepo}/contents/${path}`,
          { headers: this.baseHeaders }
        );
        if (existingResponse.ok) {
          const existingFile = await existingResponse.json();
          sha = existingFile.sha;
        }
      } catch (error) {
        // 文件不存在，正常情况
      }

      // 准备上传数据
      const uploadData = {
        message,
        content: typeof content === 'string' ? content : await this.fileToBase64(content),
        branch: options.branch || GITHUB_CONFIG.DEFAULT_BRANCH
      };

      if (sha) {
        uploadData.sha = sha; // 更新已存在的文件
      }

      // 上传文件
      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${this.config.owner}/${this.config.storageRepo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            ...this.baseHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(uploadData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`上传文件失败: ${error.message}`);
      }

      const result = await response.json();
      console.log(`文件上传成功: ${path}`);
      return result;
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  }

  /**
   * 将File对象转换为Base64
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // 移除data:前缀，只保留base64内容
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 上传游戏文件
   */
  async uploadGame(gameFile, coverFile, gameData) {
    await this.validateAndInit();

    const gameId = gameData.id || Date.now();
    const results = {};

    try {
      // 1. 上传游戏文件
      const gameFileName = gameFile.name;
      const gameFilePath = `${GITHUB_CONFIG.GAMES_PATH}/${gameId}/${gameFileName}`;
      
      console.log(`开始上传游戏文件: ${gameFileName}`);
      results.gameFile = await this.uploadFile(
        gameFilePath,
        gameFile,
        `上传游戏文件: ${gameData.title}`
      );

      // 2. 上传封面图片
      if (coverFile) {
        const coverFileName = `${gameId}-cover.${coverFile.name.split('.').pop()}`;
        const coverFilePath = `${GITHUB_CONFIG.COVERS_PATH}/${coverFileName}`;
        
        console.log(`开始上传封面图片: ${coverFileName}`);
        results.coverFile = await this.uploadFile(
          coverFilePath,
          coverFile,
          `上传封面图片: ${gameData.title}`
        );
      }

      // 3. 如果是HTML文件，创建游戏目录的index.html
      if (gameFileName.toLowerCase().endsWith('.html')) {
        const indexPath = `${GITHUB_CONFIG.GAMES_PATH}/${gameId}/index.html`;
        results.gameFile = await this.uploadFile(
          indexPath,
          gameFile,
          `创建游戏入口: ${gameData.title}`
        );
      }

      // 4. 更新游戏元数据
      const metadata = {
        ...gameData,
        id: gameId,
        uploadTime: new Date().toISOString(),
        gameUrl: this.getGameUrl(gameId, gameFileName),
        coverUrl: coverFile ? this.getCoverUrl(gameId, coverFile.name) : null,
        storageType: 'github',
        githubPaths: {
          game: gameFilePath,
          cover: coverFile ? `${GITHUB_CONFIG.COVERS_PATH}/${gameId}-cover.${coverFile.name.split('.').pop()}` : null
        }
      };

      const metadataPath = `${GITHUB_CONFIG.METADATA_PATH}/${gameId}.json`;
      console.log(`更新游戏元数据: ${gameId}`);
      results.metadata = await this.uploadFile(
        metadataPath,
        btoa(JSON.stringify(metadata, null, 2)),
        `更新游戏元数据: ${gameData.title}`
      );

      console.log('游戏上传完成！');
      return {
        success: true,
        gameId,
        metadata,
        results
      };

    } catch (error) {
      console.error('游戏上传失败:', error);
      throw error;
    }
  }

  /**
   * 获取游戏URL
   */
  getGameUrl(gameId, fileName) {
    const path = fileName.toLowerCase().endsWith('.html') 
      ? `${GITHUB_CONFIG.GAMES_PATH}/${gameId}/index.html`
      : `${GITHUB_CONFIG.GAMES_PATH}/${gameId}/${fileName}`;
    
    return getGitHubPagesUrl(this.config.owner, this.config.storageRepo, path);
  }

  /**
   * 获取封面图片URL
   */
  getCoverUrl(gameId, fileName) {
    const ext = fileName.split('.').pop();
    const coverFileName = `${gameId}-cover.${ext}`;
    const path = `${GITHUB_CONFIG.COVERS_PATH}/${coverFileName}`;
    
    return getGitHubPagesUrl(this.config.owner, this.config.storageRepo, path);
  }

  /**
   * 检查GitHub存储是否可用
   */
  isAvailable() {
    return this.config.enabled;
  }

  /**
   * 获取存储信息
   */
  getStorageInfo() {
    if (!this.isAvailable()) {
      return {
        available: false,
        reason: 'GitHub配置未完成'
      };
    }

    return {
      available: true,
      type: 'github',
      owner: this.config.owner,
      repository: this.config.storageRepo,
      pagesUrl: getGitHubPagesUrl(this.config.owner, this.config.storageRepo)
    };
  }
}

// 创建全局实例
export const githubStorage = new GitHubStorage();

// 导出工具函数
export { getGitHubConfig, validateGitHubConfig, getGitHubPagesUrl }; 