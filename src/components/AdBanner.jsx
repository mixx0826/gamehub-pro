import React from 'react';

const AdBanner = ({ 
  type = 'horizontal', // horizontal, vertical, square
  size = 'medium', // small, medium, large
  className = '',
  content = null 
}) => {
  // 预设的广告尺寸
  const sizeClasses = {
    horizontal: {
      small: 'h-20',
      medium: 'h-24',
      large: 'h-32'
    },
    vertical: {
      small: 'w-48 h-64',
      medium: 'w-56 h-80',
      large: 'w-64 h-96'
    },
    square: {
      small: 'w-48 h-48',
      medium: 'w-56 h-56',
      large: 'w-64 h-64'
    }
  };

  // 获取对应的尺寸类
  const sizeClass = sizeClasses[type]?.[size] || sizeClasses.horizontal.medium;

  // 默认广告内容
  const defaultContent = (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-2xl mb-2">📢</div>
      <p className="text-sm font-medium">广告位招租</p>
      <p className="text-xs">联系管理员投放广告</p>
    </div>
  );

  return (
    <div className={`
      ${sizeClass}
      ${type === 'horizontal' ? 'w-full' : ''}
      bg-gray-100 
      border-2 
      border-dashed 
      border-gray-300 
      rounded-lg 
      overflow-hidden
      hover:border-gray-400
      transition-colors
      ${className}
    `}>
      {content || defaultContent}
    </div>
  );
};

export default AdBanner; 