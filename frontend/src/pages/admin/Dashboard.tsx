import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listAllNews } from '@/api/news';
import { getAllCategories } from '@/api/category';

export default function Dashboard() {
  const [newsCount, setNewsCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      listAllNews(0, 5),
      getAllCategories(),
    ]).then(([newsRes, catRes]) => {
      if (newsRes.code === 200) {
        setNewsCount(newsRes.data.totalElements);
        setRecentNews(newsRes.data.content);
      }
      if (catRes.code === 200) setCatCount(catRes.data.length);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total News</p>
          <p className="text-3xl font-bold mt-1">{newsCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Categories</p>
          <p className="text-3xl font-bold mt-1">{catCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center">
          <Link to="/admin/news/new" className="btn-primary w-full text-center">+ Create New Article</Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/admin/news', label: 'Manage News', desc: 'View and manage all articles' },
          { to: '/admin/categories', label: 'Categories', desc: 'Manage news categories' },
          { to: '/admin/media', label: 'Media Library', desc: 'Uploaded images and files' },
          { to: '/', label: 'View Site →', desc: 'Open the public website' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-primary-600">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent News */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Recent Articles</h2>
          <Link to="/admin/news" className="text-sm text-primary-600">View All</Link>
        </div>
        <div className="divide-y">
          {recentNews.map((item: any) => (
            <div key={item.id} className="px-6 py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-gray-400">
                  {item.categoryName} · {item.isPublished ? '✅ Published' : '📝 Draft'} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Link to={`/admin/news/${item.id}/edit`} className="text-sm text-primary-600 ml-4 shrink-0">Edit</Link>
            </div>
          ))}
          {recentNews.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400">No articles yet. Create your first one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
