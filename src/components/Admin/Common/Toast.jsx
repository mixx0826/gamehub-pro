import React, { useState, useEffect } from 'react';

const Toast = ({ type = 'info', message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // 等待动画完成
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️'
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
    }`}>
      <div className={`max-w-sm w-full ${style.bg} ${style.border} border rounded-lg shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-lg">{style.icon}</span>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${style.text}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => {
                  setIsVisible(false);
                  if (onClose) {
                    setTimeout(onClose, 300);
                  }
                }}
                className={`inline-flex ${style.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
              >
                <span className="sr-only">关闭</span>
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast 管理器组件
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // 添加 toast 的方法
  const addToast = (type, message, duration = 3000) => {
    const id = Date.now();
    const newToast = { id, type, message, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  // 移除 toast 的方法
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 将方法暴露到全局（简单实现）
  useEffect(() => {
    window.showToast = addToast;
  }, []);

  return (
    <div>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast; 