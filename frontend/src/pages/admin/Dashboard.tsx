import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listAllNews } from '@/api/news';
import { getAllCategories } from '@/api/category';

export default function Dashboard() {
  const [newsCount, setNewsCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([listAllNews(0, 5), getAllCategories()])
      .then(([newsRes, catRes]) => {
        if (newsRes.code === 200) { setNewsCount(newsRes.data.totalElements); setRecentNews(newsRes.data.content); }
        if (catRes.code === 200) setCatCount(catRes.data.length);
      }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <p className="text-gray-500 text-sm">Total News</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{newsCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <p className="text-gray-500 text-sm">Categories</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{catCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6 flex items-center">
          <Link to="/admin/news/new" className="w-full bg-primary-600 text-white text-center py-2.5 rounded hover:bg-primary-700 transition-colors font-medium text-sm">+ New Article</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/admin/news', label: 'Manage News', desc: 'View and manage all articles' },
          { to: '/admin/categories', label: 'Categories', desc: 'Manage news categories' },
          { to: '/admin/media', label: 'Media Library', desc: 'Uploaded images and files' },
          { to: '/', label: 'View Site →', desc: 'Open the public website' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all">
            <h3 className="font-semibold text-primary-600 text-sm">{item.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Articles</h2>
          <Link to="/admin/news" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentNews.map((item: any) => (
            <div key={item.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate text-sm">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.categoryName} · {item.isPublished ? '✅ Published' : '📝 Draft'} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Link to={`/admin/news/${item.id}/edit`} className="text-sm text-primary-600 hover:text-primary-700 ml-4 shrink-0 font-medium">Edit</Link>
            </div>
          ))}
          {recentNews.length === 0 && <p className="px-6 py-10 text-center text-gray-400 text-sm">No articles yet.</p>}
        </div>
      </div>
    </div>
  );
}
