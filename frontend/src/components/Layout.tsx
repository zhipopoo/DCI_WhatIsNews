import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getAllCategories } from '@/api/category';
import type { Category } from '@/types';

export default function Layout() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCategories()
      .then((res) => { if (res.code === 200) setCategories(res.data); })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/news?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      {/* <div className="bg-gray-900 text-gray-400 text-xs">
        <div className="max-w-news mx-auto px-4 h-8 flex items-center justify-between">
          <span>Welcome to WhatIsNews — Your Trusted Source for Tech & AI News</span>
          <Link to="/admin/login" className="hover:text-white transition-colors">Admin Panel</Link>
        </div>
      </div> */}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-news mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">DCI</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">WhatIs</span>
              <span className="text-lg font-bold text-primary-600 tracking-tight">News</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/news" className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors rounded">News</Link>
            {categories.filter(cat => cat.slug !== 'news').slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors rounded"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search + Mobile toggle */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search news..."
                className="w-48 px-3 py-2 border border-gray-200 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-r text-sm hover:bg-primary-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-3 space-y-1">
            <Link to="/news" className="block py-2.5 px-3 text-sm text-gray-700 rounded hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>News</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="block py-2.5 px-3 text-sm text-gray-700 rounded hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="flex pt-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search news..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-r text-sm">Search</button>
            </form>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-news mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">DCI</span>
                </div>
                <span className="text-white font-bold text-base">WhatIsNews</span>
              </div>
              <p className="text-sm leading-relaxed">Your trusted source for technology, cloud computing, and AI news.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`} className="hover:text-white transition-colors">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/news" className="hover:text-white transition-colors">All News</Link></li>
                <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">About</h4>
              <p className="text-sm leading-relaxed">WhatIsNews delivers the latest insights on cloud services, AI models, and technology trends.</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs">
            &copy; {new Date().getFullYear()} WhatIsNews. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
