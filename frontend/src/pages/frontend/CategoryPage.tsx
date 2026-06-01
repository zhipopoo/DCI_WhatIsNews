import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '@/api/category';
import { listPublishedNews } from '@/api/news';
import type { Category, NewsItem } from '@/types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setPage(0);
    getCategoryBySlug(slug)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setCategory(res.data);
          return listPublishedNews({ categoryId: res.data.id, page: 0, size: 12 });
        }
        return null;
      })
      .then((newsRes) => {
        if (newsRes && newsRes.code === 200) {
          setNews(newsRes.data.content);
          setTotalPages(newsRes.data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const fetchPage = (p: number) => {
    if (!category) return;
    setPage(p);
    setLoading(true);
    listPublishedNews({ categoryId: category.id, page: p, size: 12 })
      .then((res) => {
        if (res.code === 200) {
          setNews(res.data.content);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-news mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-400 hover:text-primary-600 transition-colors mb-4 inline-flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Home
      </Link>

      <div className="mb-8">
        <span className="inline-block bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded mb-3">Category</span>
        <h1 className="text-3xl font-bold text-gray-900">{category?.name || slug}</h1>
        {category?.description && (
          <p className="text-gray-500 mt-2">{category.description}</p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
        </div>
      )}

      {!loading && news.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          No articles in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((item) => (
            <Link key={item.id} to={`/news/${item.id}`} className="card group">
              {item.coverImage && <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-5">
                <h3 className="font-semibold group-hover:text-primary-600 transition-colors line-clamp-2 text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
                  <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</span>
                  <span>{item.viewCount} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-10">
          <button
            onClick={() => fetchPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-2 rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const start = Math.max(0, Math.min(page - 3, totalPages - 7));
            const p = start + i;
            if (p >= totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => fetchPage(p)}
                className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                  page === p
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p + 1}
              </button>
            );
          })}
          <button
            onClick={() => fetchPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-2 rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
