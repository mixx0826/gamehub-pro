import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth.jsx';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/Layout/AdminLayout';
import AdminLogin from './components/Admin/Auth/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import GameManager from './pages/Admin/GameManager';
import GameUploader from './components/Admin/GameUpload/GameUploader';
import AdManager from './components/Admin/AdManagement/AdManager';
import Home from './pages/Home';
import GamesCatalog from './pages/GamesCatalog';
import GameDetail from './pages/GameDetail';
import NotFound from './pages/NotFound';

// Import data repair tools
import './utils/dataRepair';

// 管理员路由保护组件
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* 管理员登录路由 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* 管理员后台路由 */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="games" element={<GameManager />} />
            <Route path="games/upload" element={<GameUploader />} />
            <Route path="ads" element={<AdManager />} />
            {/* 其他管理员路由可以在这里添加 */}
            <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">用户管理</h1><p className="text-gray-600">用户管理页面开发中...</p></div>} />
            <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">数据分析</h1><p className="text-gray-600">数据分析页面开发中...</p></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">系统设置</h1><p className="text-gray-600">系统设置页面开发中...</p></div>} />
          </Route>

          {/* 用户端路由 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="games" element={<GamesCatalog />} />
            <Route path="games/:gameId" element={<GameDetail />} />
          </Route>

          {/* 404 页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;