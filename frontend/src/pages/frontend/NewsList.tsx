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
      <h1 className="text-2xl font-bold mb-6">
        {keyword ? `Search results for: "${keyword}"` : 'All News'}
      </h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryFilter(undefined)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${!selectedCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategory === cat.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* News grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No news found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link key={item.id} to={`/news/${item.id}`} className="card group flex flex-col">
              {item.coverImage && (
                <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                {item.categoryName && (
                  <span className="text-xs text-primary-600 font-medium">{item.categoryName}</span>
                )}
                <h3 className="font-semibold mt-1 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
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
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 rounded border disabled:opacity-30 hover:bg-gray-50"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded text-sm ${currentPage === i ? 'bg-primary-600 text-white' : 'border hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 rounded border disabled:opacity-30 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
