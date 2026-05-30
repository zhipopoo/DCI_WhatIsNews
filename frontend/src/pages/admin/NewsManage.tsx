import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listAllNews, deleteNews, togglePublish, toggleTop } from '@/api/news';
import type { NewsItem } from '@/types';

export default function NewsManage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(() => {
    setLoading(true);
    listAllNews(page, 20).then((res) => {
      if (res.code === 200) {
        setNews(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This is a soft delete.`)) return;
    const res = await deleteNews(id);
    if (res.code === 200) fetchNews();
    else alert(res.message);
  };

  const handleTogglePublish = async (id: number) => {
    await togglePublish(id);
    fetchNews();
  };

  const handleToggleTop = async (id: number) => {
    await toggleTop(id);
    fetchNews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Link to="/admin/news/new" className="btn-primary">+ New Article</Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Top</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Views</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-xs">{item.title}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{item.categoryName || '-'}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      className={`text-xs px-2 py-0.5 rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {item.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <button
                      onClick={() => handleToggleTop(item.id)}
                      className={`text-xs px-2 py-0.5 rounded-full ${item.isTop ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {item.isTop ? 'Pinned' : 'Normal'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500">{item.viewCount}</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500 text-xs">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/admin/news/${item.id}/edit`} className="text-xs text-primary-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(item.id, item.title)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {news.length === 0 && !loading && <p className="text-center py-8 text-gray-400">No articles yet.</p>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-30">←</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded text-sm ${page === i ? 'bg-primary-600 text-white' : 'border'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded disabled:opacity-30">→</button>
        </div>
      )}
    </div>
  );
}
