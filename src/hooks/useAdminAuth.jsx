import { useState, useEffect, useContext, createContext } from 'react';
import { Navigate } from 'react-router-dom';

// 创建认证上下文
const AdminAuthContext = createContext();

// 模拟管理员账户数据 (生产环境应该从后端获取)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  role: 'super_admin',
  permissions: [
    'game_management',
    'ad_management',
    'user_management',
    'analytics_view',
    'system_settings'
  ]
};

// AdminAuth Provider 组件
export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 组件挂载时检查本地存储的认证状态
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAdminUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  // 登录函数
  const login = async (username, password) => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 验证凭据
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const userData = {
          username: ADMIN_CREDENTIALS.username,
          role: ADMIN_CREDENTIALS.role,
          permissions: ADMIN_CREDENTIALS.permissions,
          loginTime: new Date().toISOString()
        };
        
        // 生成模拟token
        const token = btoa(JSON.stringify({
          username,
          timestamp: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
        }));
        
        // 保存到本地存储
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        // 更新状态
        setAdminUser(userData);
        setIsAuthenticated(true);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  // 检查权限
  const hasPermission = (permission) => {
    if (!adminUser || !adminUser.permissions) return false;
    return adminUser.permissions.includes(permission);
  };

  // 检查多个权限（需要全部拥有）
  const hasAllPermissions = (permissions) => {
    if (!adminUser || !adminUser.permissions) return false;
    return permissions.every(permission => adminUser.permissions.includes(permission));
  };

  // 检查多个权限（拥有其中任一即可）
  const hasAnyPermission = (permissions) => {
    if (!adminUser || !adminUser.permissions) return false;
    return permissions.some(permission => adminUser.permissions.includes(permission));
  };

  // 检查token是否过期
  const isTokenValid = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token));
      return Date.now() < tokenData.expires;
    } catch (error) {
      return false;
    }
  };

  const value = {
    isAuthenticated,
    adminUser,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isTokenValid
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// 使用认证Hook
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth 必须在 AdminAuthProvider 内部使用');
  }
  return context;
};

// 管理员路由保护HOC
export const withAdminAuth = (Component, requiredPermissions = []) => {
  return function ProtectedComponent(props) {
    const { isAuthenticated, hasAllPermissions, isLoading } = useAdminAuth();
    
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
    
    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h2>
            <p className="text-gray-600">您没有访问此页面的权限</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default useAdminAuth; 