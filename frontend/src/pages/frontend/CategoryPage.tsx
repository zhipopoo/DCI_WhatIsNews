import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '@/api/category';
import { listPublishedNews } from '@/api/news';
import type { Category, NewsItem } from '@/types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getCategoryBySlug(slug)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setCategory(res.data);
          return listPublishedNews({ categoryId: res.data.id, page: 0, size: 20 });
        }
        return null;
      })
      .then((newsRes) => {
        if (newsRes && newsRes.code === 200) setNews(newsRes.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="max-w-news mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-primary-600 mb-4 inline-block">← Back to Home</Link>
      <h1 className="text-3xl font-bold mb-2">{category?.name || slug}</h1>
      {category?.description && <p className="text-gray-500 mb-6">{category.description}</p>}

      {news.length === 0 ? (
        <p className="text-gray-400 py-8">No articles in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link key={item.id} to={`/news/${item.id}`} className="card group">
              {item.coverImage && <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-primary-600 transition-colors line-clamp-2">{item.title}</h3>
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
    </div>
  );
}
