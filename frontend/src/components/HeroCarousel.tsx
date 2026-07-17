import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '@/types';

interface Props {
  items: NewsItem[];
}

export default function HeroCarousel({ items }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, items.length]);

  if (items.length === 0) return null;

  const item = items[currentIndex];

  return (
    <section
      className="relative bg-gray-900 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cover image background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: item.coverImage ? `url(${item.coverImage})` : undefined }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gray-900/60" />
      {/* Radial accent glow */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 80% 50%, var(--primary-color, #C7000B) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-news mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl transition-opacity duration-500 ease-in-out">
          {item.categoryName && (
            <span className="inline-block bg-primary-600/90 text-white text-xs px-3 py-1 rounded mb-4 font-medium">
              {item.categoryName}
            </span>
          )}
          <Link to={`/news/${item.id}`}>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white hover:text-gray-200 transition-colors leading-tight">
              {item.title}
            </h1>
          </Link>
          {item.summary && (
            <p className="text-gray-300 text-lg mb-6 line-clamp-2 leading-relaxed">{item.summary}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="text-white font-medium">{item.author}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{item.viewCount} views</span>
          </div>
          <Link to={`/news/${item.id}`} className="inline-block mt-6 bg-primary-600 text-white px-6 py-2.5 rounded hover:bg-primary-700 transition-colors text-sm font-medium">
            Read More →
          </Link>
        </div>
      </div>

      {/* Navigation dots */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
