import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listPublishedNews, searchNews } from '@/api/news';
import { getAllCategories } from '@/api/category';
import type { NewsItem, Category } from '@/types';

export default function NewsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCategories().then((res) => { if (res.code === 200) setCategories(res.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchFn = keyword
      ? searchNews({ keyword, page: currentPage, size: 12 })
      : listPublishedNews({ categoryId: selectedCategory, page: currentPage, size: 12 });

    fetchFn.then((res) => {
      if (res.code === 200) {
        setNews(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    }).finally(() => setLoading(false));
  }, [keyword, selectedCategory, currentPage]);

  const handleCategoryFilter = (catId?: number) => {
    setSelectedCategory(catId);
    setCurrentPage(0);
    if (keyword) setSearchParams({});
  };

  return (
    <div className="max-w-news mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {keyword ? `Search: "${keyword}"` : 'All News'}
        </h1>
        {keyword && (
          <p className="text-sm text-gray-400 mt-1">
            Search results for keyword "{keyword}" — <button onClick={() => setSearchParams({})} className="text-primary-600 hover:underline">Clear</button>
          </p>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryFilter(undefined)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* News grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          No news found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((item) => (
            <Link key={item.id} to={`/news/${item.id}`} className="card group flex flex-col">
              {item.coverImage && (
                <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-5 flex-1 flex flex-col">
                {item.categoryName && (
                  <span className="text-xs text-primary-600 font-medium mb-1">{item.categoryName}</span>
                )}
                <h3 className="font-semibold group-hover:text-primary-600 transition-colors line-clamp-2 flex-1 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
                  <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</span>
                  <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
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
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                currentPage === i
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-2 rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
