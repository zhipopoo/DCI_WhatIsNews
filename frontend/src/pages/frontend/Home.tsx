import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopNews, getLatestNews } from '@/api/news';
import { getAllCategories } from '@/api/category';
import type { NewsItem, Category } from '@/types';

export default function Home() {
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTopNews(5),
      getLatestNews(6),
      getAllCategories(),
    ])
      .then(([topRes, latestRes, catRes]) => {
        if (topRes.code === 200) setTopNews(topRes.data);
        if (latestRes.code === 200) setLatestNews(latestRes.data);
        if (catRes.code === 200) setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const heroNews = topNews.length > 0 ? topNews[0] : latestNews[0];
  const secondaryTop = topNews.slice(1, 3);

  return (
    <div>
      {/* Hero / Banner Section */}
      {heroNews && (
        <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
          <div className="max-w-news mx-auto px-4 py-12 md:py-20">
            <div className="max-w-2xl">
              {heroNews.categoryName && (
                <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-3">
                  {heroNews.categoryName}
                </span>
              )}
              <Link to={`/news/${heroNews.id}`}>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 hover:underline leading-tight">
                  {heroNews.title}
                </h1>
              </Link>
              {heroNews.summary && (
                <p className="text-white/80 text-lg mb-4 line-clamp-2">{heroNews.summary}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{heroNews.author}</span>
                <span>{heroNews.publishedAt ? new Date(heroNews.publishedAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-news mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top/Sticky News */}
            {topNews.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded"></span>
                  Top Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topNews.map((item) => (
                    <Link key={item.id} to={`/news/${item.id}`} className="card group">
                      {item.coverImage && (
                        <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        {item.categoryName && (
                          <span className="text-xs text-primary-600 font-medium">{item.categoryName}</span>
                        )}
                        <h3 className="font-semibold mt-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Latest News */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-500 rounded"></span>
                Latest News
              </h2>
              <div className="space-y-4">
                {latestNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`} className="card flex flex-col md:flex-row group">
                    {item.coverImage && (
                      <img src={item.coverImage} alt={item.title} className="w-full md:w-48 h-40 md:h-auto object-cover shrink-0" />
                    )}
                    <div className="p-4 flex-1">
                      {item.categoryName && (
                        <span className="text-xs text-primary-600 font-medium">{item.categoryName}</span>
                      )}
                      <h3 className="font-semibold text-lg mt-1 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
                        <span>{item.author}</span>
                        <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</span>
                        <span>{item.viewCount} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to="/news" className="btn-primary inline-block">View All News →</Link>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Categories */}
            <div className="card p-4">
              <h3 className="font-bold text-lg mb-3">Categories</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{cat.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {cat.newsCount ?? 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Secondary top news sidebar */}
            {secondaryTop.length > 0 && (
              <div className="card p-4">
                <h3 className="font-bold text-lg mb-3">Editor's Picks</h3>
                <div className="space-y-3">
                  {secondaryTop.map((item) => (
                    <Link key={item.id} to={`/news/${item.id}`} className="flex gap-3 group">
                      {item.coverImage && (
                        <img src={item.coverImage} alt={item.title} className="w-20 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium group-hover:text-primary-600 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-xs text-gray-400">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
