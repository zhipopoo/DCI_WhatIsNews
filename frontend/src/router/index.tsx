import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';
import Home from '@/pages/frontend/Home';
import NewsList from '@/pages/frontend/NewsList';
import NewsDetail from '@/pages/frontend/NewsDetail';
import CategoryPage from '@/pages/frontend/CategoryPage';
import Guidelines from '@/pages/frontend/Guidelines';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminNewsManage from '@/pages/admin/NewsManage';
import AdminNewsEdit from '@/pages/admin/NewsEdit';
import AdminCategoryManage from '@/pages/admin/CategoryManage';
import AdminMediaManage from '@/pages/admin/MediaManage';
import AdminUserManage from '@/pages/admin/UserManage';
import AdminUsefulLinkManage from '@/pages/admin/UsefulLinkManage';
import AdminThemeSettings from '@/pages/admin/ThemeSettings';

const router = createBrowserRouter([
  // Frontend routes
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'news', element: <NewsList /> },
      { path: 'news/:id', element: <NewsDetail /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'guidelines', element: <Guidelines /> },
    ],
  },
  // Admin routes
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'news', element: <AdminNewsManage /> },
      { path: 'news/new', element: <AdminNewsEdit /> },
      { path: 'news/:id/edit', element: <AdminNewsEdit /> },
      { path: 'categories', element: <AdminCategoryManage /> },
      { path: 'media', element: <AdminMediaManage /> },
      { path: 'users', element: <AdminUserManage /> },
      { path: 'useful-links', element: <AdminUsefulLinkManage /> },
      { path: 'settings', element: <AdminThemeSettings /> },
    ],
  },
  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
