import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/news', label: 'News', icon: '📰' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
  { path: '/admin/media', label: 'Media', icon: '🖼️' },
];

export default function AdminLayout() {
  const { isAuthenticated, displayName, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">WN</span>
            </div>
            <span className="font-bold text-sm">WhatIsNews Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-gray-400">{displayName}</span>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
