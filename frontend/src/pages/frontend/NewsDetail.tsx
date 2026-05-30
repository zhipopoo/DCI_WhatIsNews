import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublishedNews } from '@/api/news';
import type { NewsItem } from '@/types';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPublishedNews(Number(id))
      .then((res) => {
        if (res.code === 200) setNews(res.data);
        else setError(res.message);
      })
      .catch(() => setError('Failed to load news'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="max-w-news mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-400">News not found</h1>
        <Link to="/" className="text-primary-600 mt-4 inline-block">← Back to Home</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        {news.categoryName && (
          <>
            <Link to={`/category/${news.categoryName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary-600">
              {news.categoryName}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-400 truncate">{news.title}</span>
      </nav>

      {/* Category badge */}
      {news.categoryName && (
        <span className="inline-block bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full mb-4">
          {news.categoryName}
        </span>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">{news.title}</h1>
      {news.subtitle && (
        <p className="text-xl text-gray-500 mb-6">{news.subtitle}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b">
        <span className="font-medium text-gray-700">{news.author}</span>
        <span>{news.publishedAt ? new Date(news.publishedAt).toLocaleString() : ''}</span>
        <span>{news.viewCount} views</span>
      </div>

      {/* Cover Image */}
      {news.coverImage && (
        <img src={news.coverImage} alt={news.title} className="w-full rounded-xl mb-8" />
      )}

      {/* Content */}
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: news.content }} />

      {/* Tags */}
      {news.tags && (
        <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
          {news.tags.split(',').map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Previous / Next Navigation */}
      <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.prevNews ? (
          <Link to={`/news/${news.prevNews.id}`} className="card p-4 group hover:border-primary-300">
            <span className="text-xs text-gray-400">← Previous</span>
            <p className="font-medium group-hover:text-primary-600 transition-colors line-clamp-1">{news.prevNews.title}</p>
          </Link>
        ) : <div />}
        {news.nextNews ? (
          <Link to={`/news/${news.nextNews.id}`} className="card p-4 group hover:border-primary-300 text-right">
            <span className="text-xs text-gray-400">Next →</span>
            <p className="font-medium group-hover:text-primary-600 transition-colors line-clamp-1">{news.nextNews.title}</p>
          </Link>
        ) : <div />}
      </div>
    </article>
  );
}
