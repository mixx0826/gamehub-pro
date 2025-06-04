import React, { useState, useEffect, useRef } from 'react';
import { categories } from '../../../data/categories';
import { GameStorage } from '../../../utils/adminStorage';

const GameEditModal = ({ game, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    developer: '',
    categoryIds: [],
    tags: [],
    rating: 0,
    playCount: 0,
    releaseDate: '',
    featured: false,
    isMobile: true,
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const coverImageRef = useRef(null);

  // 获取当前游戏的封面图片URL
  const getCurrentThumbnail = () => {
    if (newCoverImage) {
      return URL.createObjectURL(newCoverImage);
    }
    if (game?.coverImageBlob) {
      return game.coverImageBlob;
    }
    return game?.thumbnail;
  };

  // 初始化表单数据
  useEffect(() => {
    if (game && isOpen) {
      setFormData({
        title: game.title || '',
        description: game.description || '',
        developer: game.developer || '',
        categoryIds: game.categoryIds || [],
        tags: game.tags || [],
        rating: game.rating || 0,
        playCount: game.playCount || 0,
        releaseDate: game.releaseDate || '',
        featured: game.featured || false,
        isMobile: game.isMobile !== false, // 默认为true
        status: game.status || 'active'
      });
      setErrors({});
      setNewCoverImage(null);
      setPreviewUrl('');
    }
  }, [game, isOpen]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 处理分类选择
  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  // 添加标签
  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '游戏标题不能为空';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '游戏描述不能为空';
    }
    
    if (!formData.developer.trim()) {
      newErrors.developer = '开发者名称不能为空';
    }
    
    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = '至少选择一个分类';
    }

    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = '评分必须在0-5之间';
    }

    if (formData.playCount < 0) {
      newErrors.playCount = '游玩次数不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存游戏
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // 准备更新数据
      const updateData = {
        ...formData,
        categoryIds: formData.categoryIds.map(id => parseInt(id)),
        rating: parseFloat(formData.rating),
        playCount: parseInt(formData.playCount),
        lastModified: new Date().toISOString()
      };

      // 如果有新的封面图片，更新相关字段
      if (newCoverImage) {
        const gameId = game.id || Date.now();
        updateData.thumbnail = `/uploaded-covers/${gameId}-${newCoverImage.name}`;
        updateData.coverImageBlob = URL.createObjectURL(newCoverImage);
        updateData.coverFileName = newCoverImage.name;
      }

      console.log('Saving game update:', updateData);
      
      const success = await GameStorage.updateGame(game.id, updateData);
      
      console.log('Update result:', success);
      
      if (success) {
        if (window.showToast) {
          window.showToast('success', '游戏信息已更新');
        }
        
        // 创建完整的更新后游戏对象
        const updatedGame = {
          ...game,
          ...updateData,
          id: game.id
        };
        
        console.log('Calling onSave with:', updatedGame);
        onSave && onSave(updatedGame);
        onClose();
        
        // 强制页面刷新以确保数据更新
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        if (window.showToast) {
          window.showToast('error', '保存失败，请重试');
        }
      }
    } catch (error) {
      console.error('保存游戏信息失败:', error);
      if (window.showToast) {
        window.showToast('error', '保存失败：' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.name === 'newTag') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 处理封面图片选择
  const handleCoverImageChange = (file) => {
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

      setNewCoverImage(file);
      setErrors(prev => ({ ...prev, coverImage: '' }));
    }
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">编辑游戏信息</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">关闭</span>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">基本信息</h4>
            
            {/* 封面图片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片
              </label>
              <div className="flex items-start space-x-4">
                {/* 当前图片预览 */}
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                  {getCurrentThumbnail() ? (
                    <img
                      src={getCurrentThumbnail()}
                      alt="游戏封面"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/96/96';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-2xl">🖼️</span>
                    </div>
                  )}
                </div>
                
                {/* 上传按钮 */}
                <div className="flex-1">
                  <input
                    ref={coverImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCoverImageChange(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverImageRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    更换封面
                  </button>
                  {newCoverImage && (
                    <p className="text-sm text-green-600 mt-1">
                      已选择新图片: {newCoverImage.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    支持 JPG、PNG 格式，建议尺寸 512x512，最大 5MB
                  </p>
                </div>
              </div>
              {errors.coverImage && (
                <p className="text-red-600 text-sm mt-1">{errors.coverImage}</p>
              )}
            </div>

            {/* 游戏标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                游戏标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* 开发者 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开发者 *
              </label>
              <input
                type="text"
                name="developer"
                value={formData.developer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.developer && (
                <p className="text-red-600 text-sm mt-1">{errors.developer}</p>
              )}
            </div>

            {/* 游戏描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                游戏描述 *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* 发布日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                发布日期
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 分类和标签 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">分类和标签</h4>
            
            {/* 游戏分类 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                游戏分类 *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
              {errors.categoryIds && (
                <p className="text-red-600 text-sm mt-1">{errors.categoryIds}</p>
              )}
            </div>

            {/* 游戏标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                游戏标签
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  name="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入标签后按回车键添加"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 数据和设置 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">数据和设置</h4>
            
            {/* 评分 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                评分 (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.rating && (
                <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            {/* 游玩次数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                游玩次数
              </label>
              <input
                type="number"
                name="playCount"
                value={formData.playCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.playCount && (
                <p className="text-red-600 text-sm mt-1">{errors.playCount}</p>
              )}
            </div>

            {/* 游戏状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                游戏状态
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">已上架</option>
                <option value="inactive">已下架</option>
                <option value="hidden">已隐藏</option>
              </select>
            </div>
          </div>

          {/* 选项设置 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">选项设置</h4>
            
            <div className="space-y-3">
              {/* 是否精选 */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">设为精选游戏</span>
              </label>

              {/* 是否支持移动端 */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isMobile"
                  checked={formData.isMobile}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">支持移动设备</span>
              </label>
            </div>

            {/* 游戏类型标识 */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 mb-2">游戏类型：</p>
              <div className="flex space-x-2">
                {game.isPlatformGame && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    平台游戏
                  </span>
                )}
                {game.isUploadedGame && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    上传游戏
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEditModal; 