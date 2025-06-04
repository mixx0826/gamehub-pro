import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks/useAdminAuth.jsx';
import { ToastContainer } from '../Common/Toast';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser, logout, hasPermission } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 导航菜单项
  const menuItems = [
    {
      title: '仪表板',
      path: '/admin/dashboard',
      icon: '📊',
      permission: 'analytics_view'
    },
    {
      title: '游戏管理',
      path: '/admin/games',
      icon: '🎮',
      permission: 'game_management'
    },
    {
      title: '游戏上传',
      path: '/admin/games/upload',
      icon: '⬆️',
      permission: 'game_management'
    },
    {
      title: '广告管理',
      path: '/admin/ads',
      icon: '📢',
      permission: 'ad_management'
    },
    {
      title: '用户管理',
      path: '/admin/users',
      icon: '👥',
      permission: 'user_management'
    },
    {
      title: '数据分析',
      path: '/admin/analytics',
      icon: '📈',
      permission: 'analytics_view'
    },
    {
      title: '系统设置',
      path: '/admin/settings',
      icon: '⚙️',
      permission: 'system_settings'
    }
  ];

  // 过滤有权限的菜单项
  const authorizedMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActiveRoute = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <span className="sr-only">打开侧边栏</span>
              ☰
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-900">
                GameHub Pro 管理控制台
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              欢迎, <span className="font-medium">{adminUser?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <nav className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:shadow-none border-r border-gray-200 flex flex-col`}>
          
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-b-0 flex-shrink-0">
            <div className="flex items-center">
              <span className="text-2xl">🎮</span>
              <span className="ml-2 font-semibold text-gray-900">GameHub Pro</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* 导航菜单 */}
          <div className="flex-1 mt-6 px-3 overflow-y-auto">
            <nav className="space-y-1">
              {authorizedMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-200 ${
                    isActiveRoute(item.path)
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* 侧边栏底部信息 */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <div className="text-xs text-gray-500">
              <p>角色: {adminUser?.role}</p>
              <p>登录时间: {adminUser?.loginTime ? new Date(adminUser.loginTime).toLocaleString() : '-'}</p>
            </div>
          </div>
        </nav>

        {/* 遮罩层 (移动端) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* 主内容区域 */}
        <main className="flex-1 min-w-0">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  );
};

export default AdminLayout; 