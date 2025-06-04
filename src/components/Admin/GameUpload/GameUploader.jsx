import React, { useState, useRef } from 'react';
import { categories } from '../../../data/categories';
import { GameStorage, UploadHistoryStorage } from '../../../utils/adminStorage';
import { githubStorage } from '../../../utils/githubStorage';

const GameUploader = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [gameFile, setGameFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    developer: '',
    categoryIds: [],
    tags: [],
    isMobile: true,
    featured: false
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadMode, setUploadMode] = useState('auto'); // 'auto', 'local', 'github'
  
  const gameFileRef = useRef(null);
  const coverImageRef = useRef(null);

  // 获取存储信息
  const storageInfo = githubStorage.getStorageInfo();
  const canUseGitHub = storageInfo.available;

  // 处理拖拽事件
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // 处理文件拖拽放置
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleGameFile(files[0]);
    }
  };

  // 处理游戏文件选择
  const handleGameFile = (file) => {
    if (file) {
      // 验证文件类型
      const allowedTypes = ['.zip', '.html', '.js'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setErrors(prev => ({ ...prev, gameFile: '只支持 ZIP、HTML 或 JS 文件格式' }));
        return;
      }

      // 验证文件大小 (最大 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, gameFile: '文件大小不能超过 50MB' }));
        return;
      }

      setGameFile(file);
      setErrors(prev => ({ ...prev, gameFile: '' }));
      
      // 如果没有设置标题，使用文件名
      if (!gameData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setGameData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  // 处理封面图片选择
  const handleCoverImage = (file) => {
    if (file) {
      // 验证图片类型
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, coverImage: '只支持图片文件' }));
        return;
      }

      // 验证文件大小 (最大 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImage: '图片大小不能超过 5MB' }));
        return;
      }

      setCoverImage(file);
      setErrors(prev => ({ ...prev, coverImage: '' }));
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGameData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 处理分类选择
  const handleCategoryChange = (categoryId) => {
    setGameData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  // 处理标签输入
  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && !gameData.tags.includes(tag)) {
        setGameData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        e.target.value = '';
      }
    }
  };

  // 删除标签
  const removeTag = (tagToRemove) => {
    setGameData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    if (!gameData.title.trim()) {
      newErrors.title = '游戏标题不能为空';
    }
    
    if (!gameData.description.trim()) {
      newErrors.description = '游戏描述不能为空';
    }
    
    if (!gameData.developer.trim()) {
      newErrors.developer = '开发者名称不能为空';
    }
    
    if (gameData.categoryIds.length === 0) {
      newErrors.categories = '至少选择一个分类';
    }
    
    if (!gameFile) {
      newErrors.gameFile = '请上传游戏文件';
    }
    
    if (!coverImage) {
      newErrors.coverImage = '请上传封面图片';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // GitHub上传方法
  const uploadToGitHub = async () => {
    console.log('开始GitHub上传...');
    const gameId = Date.now();
    
    const gameDataWithId = {
      ...gameData,
      id: gameId
    };

    try {
      const result = await githubStorage.uploadGame(gameFile, coverImage, gameDataWithId);
      
      if (result.success) {
        // 创建兼容的游戏对象
        const newGame = {
          ...result.metadata,
          slug: gameData.title.toLowerCase().replace(/\s+/g, '-'),
          thumbnail: result.metadata.coverUrl || `/api/placeholder/400/225`,
          rating: 0,
          playCount: 0,
          releaseDate: new Date().toISOString().split('T')[0],
          fileName: gameFile.name,
          coverFileName: coverImage?.name,
          uploadedBy: 'admin',
          isUploadedGame: true,
          githubStorage: true // 标记为GitHub存储
        };

        return newGame;
      } else {
        throw new Error('GitHub上传失败');
      }
    } catch (error) {
      console.error('GitHub上传错误:', error);
      throw new Error(`GitHub上传失败: ${error.message}`);
    }
  };

  // 本地上传方法（原有逻辑）
  const uploadToLocal = async () => {
    console.log('使用本地存储...');
    
    const gameId = Date.now();
    
    // 创建 blob URL
    let gameUrl = '';
    let gameFileBlob = null;
    
    gameFileBlob = URL.createObjectURL(gameFile);
    gameUrl = gameFileBlob;
    console.log('Generated blob URL for game:', gameUrl);
    
    // 创建新游戏对象
    const newGame = {
      ...gameData,
      id: gameId,
      slug: gameData.title.toLowerCase().replace(/\s+/g, '-'),
      thumbnail: `/uploaded-covers/${gameId}-${coverImage.name}`,
      gameUrl: gameUrl,
      gameFileBlob: gameFileBlob,
      rating: 0,
      playCount: 0,
      releaseDate: new Date().toISOString().split('T')[0],
      uploadTime: new Date().toISOString(),
      fileSize: gameFile.size,
      fileName: gameFile.name,
      coverFileName: coverImage.name,
      coverImageBlob: URL.createObjectURL(coverImage),
      uploadedBy: 'admin',
      isUploadedGame: true,
      githubStorage: false // 标记为本地存储
    };
    
    return newGame;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      let newGame;
      let uploadMethod;

      // 决定上传方式
      if (uploadMode === 'github' || (uploadMode === 'auto' && canUseGitHub)) {
        uploadMethod = 'GitHub';
        newGame = await uploadToGitHub();
      } else {
        uploadMethod = 'Local';
        newGame = await uploadToLocal();
      }
      
      // 保存游戏到本地存储
      const saveSuccess = GameStorage.saveGame(newGame);
      
      if (saveSuccess) {
        // 添加上传历史记录
        UploadHistoryStorage.addUploadRecord({
          gameId: newGame.id,
          gameTitle: newGame.title,
          fileName: gameFile.name,
          fileSize: gameFile.size,
          action: 'upload',
          status: 'completed',
          uploadedBy: 'admin',
          method: uploadMethod
        });
        
        // 调用上传完成回调
        if (onUploadComplete) {
          onUploadComplete(newGame, gameFile, coverImage);
        }
        
        // 显示成功消息
        if (window.showToast) {
          window.showToast('success', `游戏上传成功！(${uploadMethod})`, 3000);
        }
        
        // 重置表单
        setGameData({
          title: '',
          description: '',
          developer: '',
          categoryIds: [],
          tags: [],
          isMobile: true,
          featured: false
        });
        setGameFile(null);
        setCoverImage(null);
        setErrors({});
      } else {
        throw new Error('数据保存失败');
      }
      
    } catch (error) {
      console.error('上传失败:', error);
      
      // 记录失败的上传历史
      UploadHistoryStorage.addUploadRecord({
        gameTitle: gameData.title,
        fileName: gameFile?.name || '未知文件',
        fileSize: gameFile?.size || 0,
        action: 'upload',
        status: 'failed',
        error: error.message,
        uploadedBy: 'admin'
      });
      
      setErrors({ submit: '上传失败，请重试: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 存储模式选择 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">存储模式</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadMode"
              value="auto"
              checked={uploadMode === 'auto'}
              onChange={(e) => setUploadMode(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">
              自动选择 {canUseGitHub ? '(优先GitHub)' : '(仅本地)'}
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadMode"
              value="github"
              checked={uploadMode === 'github'}
              onChange={(e) => setUploadMode(e.target.value)}
              disabled={!canUseGitHub}
              className="mr-2"
            />
            <span className={`text-sm ${!canUseGitHub ? 'text-gray-400' : ''}`}>
              GitHub存储 {!canUseGitHub ? '(未配置)' : '(持久化)'}
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadMode"
              value="local"
              checked={uploadMode === 'local'}
              onChange={(e) => setUploadMode(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">本地存储 (刷新后失效)</span>
          </label>
        </div>
        
        {!canUseGitHub && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            💡 要启用GitHub存储，请配置环境变量：VITE_GITHUB_TOKEN 和 VITE_GITHUB_OWNER
          </div>
        )}
        
        {canUseGitHub && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
            ✅ GitHub存储已配置：{storageInfo.owner}/{storageInfo.repository}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 文件上传区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 游戏文件上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游戏文件 *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : gameFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => gameFileRef.current?.click()}
            >
              <input
                ref={gameFileRef}
                type="file"
                accept=".zip,.html,.js"
                onChange={(e) => handleGameFile(e.target.files[0])}
                className="hidden"
              />
              
              {gameFile ? (
                <div className="text-green-600">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="font-medium">{gameFile.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(gameFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="font-medium">拖拽游戏文件到这里</p>
                  <p className="text-sm mt-1">或点击选择文件</p>
                  <p className="text-xs mt-2">支持 ZIP、HTML、JS 格式</p>
                </div>
              )}
            </div>
            {errors.gameFile && (
              <p className="text-red-600 text-sm mt-1">{errors.gameFile}</p>
            )}
          </div>

          {/* 封面图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游戏封面 *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                coverImage
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => coverImageRef.current?.click()}
            >
              <input
                ref={coverImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverImage(e.target.files[0])}
                className="hidden"
              />
              
              {coverImage ? (
                <div>
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="封面预览"
                    className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                  />
                  <p className="font-medium text-green-600">{coverImage.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(coverImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="font-medium">点击上传封面图片</p>
                  <p className="text-sm mt-1">推荐尺寸: 512x512</p>
                  <p className="text-xs mt-2">支持 JPG、PNG 格式</p>
                </div>
              )}
            </div>
            {errors.coverImage && (
              <p className="text-red-600 text-sm mt-1">{errors.coverImage}</p>
            )}
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">游戏信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                游戏标题 *
              </label>
              <input
                type="text"
                name="title"
                value={gameData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入游戏标题"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开发者 *
              </label>
              <input
                type="text"
                name="developer"
                value={gameData.developer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入开发者名称"
              />
              {errors.developer && (
                <p className="text-red-600 text-sm mt-1">{errors.developer}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              游戏描述 *
            </label>
            <textarea
              name="description"
              value={gameData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="描述游戏玩法和特色..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* 分类选择 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游戏分类 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameData.categoryIds.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-600 text-sm mt-1">{errors.categories}</p>
            )}
          </div>

          {/* 标签输入 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              游戏标签
            </label>
            <input
              type="text"
              onKeyDown={handleTagInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入标签后按回车键添加"
            />
            {gameData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {gameData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 选项设置 */}
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isMobile"
                checked={gameData.isMobile}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">支持移动设备</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={gameData.featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">设为精选游戏</span>
            </label>
          </div>
        </div>

        {/* 错误信息 */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => {
              // 重置表单逻辑
              setGameData({
                title: '',
                description: '',
                developer: '',
                categoryIds: [],
                tags: [],
                isMobile: true,
                featured: false
              });
              setGameFile(null);
              setCoverImage(null);
              setErrors({});
            }}
          >
            重置
          </button>
          
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                上传中...
              </div>
            ) : (
              '上传游戏'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameUploader; 