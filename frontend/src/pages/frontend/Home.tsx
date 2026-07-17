import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopNews, getLatestNews } from '@/api/news';
import { getAllCategories } from '@/api/category';
import { getActiveUsefulLinks } from '@/api/usefulLink';
import type { NewsItem, Category, UsefulLink } from '@/types';
import HeroCarousel from '@/components/HeroCarousel';
import FileIcon from '@/components/FileIcon';

export default function Home() {
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTopNews(5),
      getLatestNews(6),
      getAllCategories(),
      getActiveUsefulLinks(),
    ])
      .then(([topRes, latestRes, catRes, linksRes]) => {
        if (topRes.code === 200) setTopNews(topRes.data);
        if (latestRes.code === 200) setLatestNews(latestRes.data);
        if (catRes.code === 200) setCategories(catRes.data);
        if (linksRes.code === 200) setUsefulLinks(linksRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const secondaryTop = topNews.slice(1, 3);

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel items={topNews.length > 0 ? topNews : latestNews.slice(0, 1)} />

      <div className="max-w-news mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Latest News */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-primary-600 rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">Latest News</h2>
              </div>
              <div className="space-y-4">
                {latestNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`} className="card flex flex-col md:flex-row group">
                    {item.coverImage && (
                      <img src={item.coverImage} alt={item.title} className="w-full md:w-52 h-40 md:h-auto object-cover shrink-0" />
                    )}
                    <div className="p-5 flex-1">
                      {item.categoryName && (
                        <span className="text-xs text-primary-600 font-medium">{item.categoryName}</span>
                      )}
                      <h3 className="font-semibold text-lg mt-1 group-hover:text-primary-600 transition-colors text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-4">
                        <span className="text-gray-600 font-medium">{item.author}</span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span>{item.viewCount} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to="/news" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All News
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* DCI Guidelines */}
            {usefulLinks.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">DCI Guidelines</h3>
                <ul className="space-y-1">
                  {usefulLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.filePath}
                        download={link.fileName}
                        className="flex items-center gap-3 py-2.5 px-3 rounded hover:bg-gray-50 transition-colors group"
                      >
                        <FileIcon fileName={link.fileName} size={20} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors block truncate">
                            {link.title}
                          </span>
                          {link.description && (
                            <span className="text-xs text-gray-400 truncate block">{link.description}</span>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categories */}
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Categories</h3>
              <ul className="space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors">{cat.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        {cat.newsCount ?? 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Editor's Picks Sidebar */}
            {secondaryTop.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Editor's Picks</h3>
                <div className="space-y-4">
                  {secondaryTop.map((item) => (
                    <Link key={item.id} to={`/news/${item.id}`} className="flex gap-3 group">
                      {item.coverImage && (
                        <img src={item.coverImage} alt={item.title} className="w-20 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-xs text-gray-400 mt-1 inline-block">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                        </span>
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
